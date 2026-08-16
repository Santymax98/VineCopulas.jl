source(file.path(dirname(normalizePath(sub("^--file=", "", grep("^--file=", commandArgs(trailingOnly = FALSE), value = TRUE)[1]), mustWork = FALSE)), "r_common.R"))

requested_modes <- function() {
  mode <- tolower(Sys.getenv("PARITY_FIT_MODE", unset = "common"))
  if (mode == "common") return("common")
  if (mode == "default") return("default")
  if (mode %in% c("both", "all")) return(c("common", "default"))
  stop("PARITY_FIT_MODE must be common, default, or both")
}

fit_config <- function(mode) {
  if (mode == "common") {
    return(list(
      families = c("gaussian", "t", "clayton", "gumbel", "frank", "joe"),
      criterion = "aic"
    ))
  }
  list(
    families = c("indep", "gaussian", "t", "clayton", "gumbel", "frank", "joe", "bb1", "bb6", "bb7", "bb8"),
    criterion = "bic"
  )
}

fit_once <- function(U, mode, structure = NA) {
  cfg <- fit_config(mode)
  vinecop(
    data = U,
    family_set = cfg$families,
    structure = structure,
    par_method = "mle",
    selcrit = cfg$criterion,
    presel = FALSE,
    allow_rotations = TRUE,
    trunc_lvl = ncol(U) - 1L,
    tree_crit = "tau",
    threshold = 0,
    keep_data = FALSE,
    show_trace = FALSE,
    cores = 1,
    tree_algorithm = "mst_kruskal"
  )
}


criterion_score <- function(loglik, npars, n, criterion) {
  if (criterion == "loglik") return(-loglik)
  if (criterion == "aic") return(-2 * loglik + 2 * npars)
  if (criterion == "bic") return(-2 * loglik + npars * log(n))
  stop(paste0("Unsupported diagnostic selection criterion: ", criterion))
}

state_key <- function(v, conditioning = integer()) {
  conditioning <- sort(as.integer(conditioning))
  paste0(as.integer(v), "|", paste(conditioning, collapse = ":"))
}

candidate_family_rows <- function(pdata, phase, dataset, tree, edge, a, b, conditioning, cfg) {
  out <- list()
  k <- 1L
  for (family in cfg$families) {
    ans <- tryCatch({
      fit <- bicop(
        data = pdata,
        family_set = family,
        par_method = "mle",
        selcrit = cfg$criterion,
        presel = FALSE,
        allow_rotations = TRUE,
        keep_data = FALSE,
        cores = 1
      )
      ce <- canonical_edge(a, b, conditioning, fit$rotation)
      pars <- as.numeric(fit$parameters)
      ll <- as.numeric(fit$loglik)
      np <- as.numeric(fit$npars)
      data.frame(
        phase = phase, dataset = dataset, tree = tree, edge = edge,
        a = ce$a, b = ce$b, conditioning = paste(ce$conditioning, collapse = ":"),
        family = canonical_family_name(fit$family), rotation = ce$rotation,
        loglik = ll, score = criterion_score(ll, np, nrow(pdata), cfg$criterion),
        npars = np, criterion = cfg$criterion,
        p1 = if (length(pars) >= 1L) pars[[1]] else NA_real_,
        p2 = if (length(pars) >= 2L) pars[[2]] else NA_real_,
        status = "ok", error = "", stringsAsFactors = FALSE
      )
    }, error = function(e) {
      ce <- canonical_edge(a, b, conditioning, 0L)
      data.frame(
        phase = phase, dataset = dataset, tree = tree, edge = edge,
        a = ce$a, b = ce$b, conditioning = paste(ce$conditioning, collapse = ":"),
        family = canonical_family_name(family), rotation = NA_integer_,
        loglik = NA_real_, score = NA_real_, npars = NA_real_, criterion = cfg$criterion,
        p1 = NA_real_, p2 = NA_real_, status = "error", error = clean_error(e),
        stringsAsFactors = FALSE
      )
    })
    out[[k]] <- ans
    k <- k + 1L
  }
  do.call(rbind, out)
}

candidate_rows <- function(model, U, phase, dataset, cfg) {
  M <- get_matrix(model)
  pcs <- get_all_pair_copulas(model)
  d <- ncol(U)
  trunc <- length(pcs)
  states <- new.env(hash = TRUE, parent = emptyenv())
  for (v in seq_len(d)) {
    assign(state_key(v), as.numeric(U[, v]), envir = states)
  }

  out <- list()
  k <- 1L
  for (t in seq_len(trunc)) {
    for (e in seq_along(pcs[[t]])) {
      a <- as.integer(M[d - e + 1L, e])
      b <- as.integer(M[t, e])
      conditioning <- if (t == 1L) integer() else as.integer(M[(t - 1L):1L, e])
      ua <- get(state_key(a, conditioning), envir = states, inherits = FALSE)
      ub <- get(state_key(b, conditioning), envir = states, inherits = FALSE)
      pdata <- cbind(ua, ub)

      rows <- candidate_family_rows(
        pdata, phase, dataset, t, e, a, b, conditioning, cfg
      )
      out[[k]] <- rows
      k <- k + 1L

      if (t < trunc) {
        pc <- pcs[[t]][[e]]
        # rvinecopulib numbers h-functions by the conditioning variable:
        # cond_var=2 gives the distribution of variable 1 given variable 2,
        # cond_var=1 gives the distribution of variable 2 given variable 1.
        ha <- hbicop(pdata, 2, pc)
        hb <- hbicop(pdata, 1, pc)
        assign(state_key(a, c(conditioning, b)), as.numeric(ha), envir = states)
        assign(state_key(b, c(conditioning, a)), as.numeric(hb), envir = states)
      }
    }
  }

  if (length(out) == 0L) return(data.frame())
  do.call(rbind, out)
}

main <- function() {
  specs <- read_spec_csv("vine_specs.csv")
  source_spec <- specs[as.integer(specs$fit_source) == 1L, , drop = FALSE]
  if (nrow(source_spec) != 1L) stop("Expected exactly one fit_source vine model")
  name <- source_spec$model[[1]]

  U <- read_matrix(file.path(DATA_DIR, paste0("fit_data_", name, ".csv")))
  nmax <- as.integer(Sys.getenv("PARITY_N", unset = "800"))
  if (!is.na(nmax) && nmax > 0L) U <- U[seq_len(min(nmax, nrow(U))), , drop = FALSE]
  n <- nrow(U)
  fixed_structure <- make_structure(source_spec)

  summaries <- list()
  edges <- list()
  candidates <- list()
  si <- 1L
  ei <- 1L
  ci <- 1L

  for (mode in requested_modes()) {
    cfg <- fit_config(mode)
    for (kind in c("fixed", "dissmann")) {
      phase <- paste0(kind, "_", mode)
      ans <- tryCatch({
        model <- fit_once(U, mode, if (kind == "fixed") fixed_structure else NA)
        dens <- dvinecop(U, model, cores = 1)
        if (any(!is.finite(dens)) || any(dens <= 0)) stop("non-positive/non-finite fitted density")
        ll <- sum(log(dens))
        kpars <- as.numeric(model$npars)
        structure <- get_structure(model)
        list(
          summary = data.frame(
            phase = phase,
            dataset = name,
            n = n,
            status = "ok",
            loglik = ll,
            aic = -2 * ll + 2 * kpars,
            bic = -2 * ll + kpars * log(n),
            npars = kpars,
            order = paste(as.integer(structure$order), collapse = ":"),
            error = "",
            stringsAsFactors = FALSE
          ),
          edges = edge_rows(model, phase, name),
          candidates = if (kind == "dissmann") {
            tryCatch(
              candidate_rows(model, U, phase, name, cfg),
              error = function(e) {
                warning(paste0("candidate-score diagnostic failed for ", phase, ": ", clean_error(e)))
                NULL
              }
            )
          } else {
            NULL
          }
        )
      }, error = function(e) {
        list(
          summary = data.frame(
            phase = phase,
            dataset = name,
            n = n,
            status = "error",
            loglik = NA_real_,
            aic = NA_real_,
            bic = NA_real_,
            npars = NA_real_,
            order = "",
            error = clean_error(e),
            stringsAsFactors = FALSE
          ),
          edges = NULL,
          candidates = NULL
        )
      })
      summaries[[si]] <- ans$summary
      si <- si + 1L
      if (!is.null(ans$edges) && nrow(ans$edges) > 0) {
        edges[[ei]] <- ans$edges
        ei <- ei + 1L
      }
      if (!is.null(ans$candidates) && nrow(ans$candidates) > 0) {
        candidates[[ci]] <- ans$candidates
        ci <- ci + 1L
      }
    }
  }

  write_result_csv(do.call(rbind, summaries), file.path(RESULTS_DIR, "fit_summary_r.csv"))
  if (length(edges) > 0) {
    write_result_csv(do.call(rbind, edges), file.path(RESULTS_DIR, "fit_edges_r.csv"))
  } else {
    write_result_csv(data.frame(
      phase=character(), dataset=character(), tree=integer(), edge=integer(),
      a=integer(), b=integer(), conditioning=character(), family=character(),
      rotation=integer(), p1=numeric(), p2=numeric()
    ), file.path(RESULTS_DIR, "fit_edges_r.csv"))
  }
  if (length(candidates) > 0) {
    write_result_csv(do.call(rbind, candidates), file.path(RESULTS_DIR, "fit_candidates_r.csv"))
  } else {
    write_result_csv(data.frame(
      phase=character(), dataset=character(), tree=integer(), edge=integer(),
      a=integer(), b=integer(), conditioning=character(), family=character(),
      rotation=integer(), loglik=numeric(), score=numeric(), npars=numeric(),
      criterion=character(), p1=numeric(), p2=numeric(), status=character(), error=character()
    ), file.path(RESULTS_DIR, "fit_candidates_r.csv"))
  }
  cat("Wrote rvinecopulib fitting/selection parity results.\n")
}

main()
