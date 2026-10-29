source(file.path(dirname(normalizePath(sub("^--file=", "", grep("^--file=", commandArgs(trailingOnly = FALSE), value = TRUE)[1]), mustWork = FALSE)), "r_common.R"))

pair_reference <- function() {
  specs <- read_spec_csv("pair_specs.csv")
  X <- read_matrix(file.path(DATA_DIR, "pair_points.csv"))
  uv <- X[, 1:2, drop = FALSE]
  q <- X[, 3]
  base <- X[, 4]

  rows <- vector("list", nrow(specs))
  for (i in seq_len(nrow(specs))) {
    spec <- specs[i, , drop = FALSE]
    pc <- make_bicop(spec$family, spec$rotation, params_from_row(spec))

    dens <- dbicop(uv, pc)
    if (any(!is.finite(dens)) || any(dens <= 0)) stop(paste0("Invalid pair density for ", spec$case))

    # rvinecopulib numbers h-functions by the conditioning variable.
    # Convert to VineCopulas.jl semantics before writing the shared CSV:
    #   Julia hfunc1 = F(U1 | U2) = R h_2
    #   Julia hfunc2 = F(U2 | U1) = R h_1
    h1 <- hbicop(uv, 2, pc)
    h2 <- hbicop(uv, 1, pc)
    hinv1 <- hbicop(cbind(q, base), 2, pc, inverse = TRUE)
    hinv2 <- hbicop(cbind(base, q), 1, pc, inverse = TRUE)

    rows[[i]] <- data.frame(
      case = spec$case,
      row = seq_len(nrow(X)),
      logpdf = log(dens),
      h1 = h1,
      h2 = h2,
      hinv1 = hinv1,
      hinv2 = hinv2,
      stringsAsFactors = FALSE
    )
  }
  write_result_csv(do.call(rbind, rows), file.path(RESULTS_DIR, "pair_r.csv"))
}

vine_reference <- function() {
  specs <- read_spec_csv("vine_specs.csv")
  edges <- read_spec_csv("vine_edge_specs.csv")
  value_rows <- list()
  structure_rows <- list()
  k <- 1L

  for (i in seq_len(nrow(specs))) {
    spec <- specs[i, , drop = FALSE]
    name <- spec$model[[1]]
    model <- make_vine(spec, edges)
    p <- length(get_structure(model)$order)

    U <- read_matrix(file.path(DATA_DIR, paste0("vine_eval_", name, ".csv")))
    Z <- read_matrix(file.path(DATA_DIR, paste0("vine_z_", name, ".csv")))
    dens <- dvinecop(U, model, cores = 1)
    if (any(!is.finite(dens)) || any(dens <= 0)) stop(paste0("Invalid fixed-vine density for ", name))
    R <- rosenblatt(U, model, cores = 1, randomize_discrete = FALSE)
    X <- inverse_rosenblatt(Z, model, cores = 1)

    value_rows[[k]] <- data.frame(model = name, metric = "logpdf", row = seq_along(dens), dim = 0L, value = log(dens)); k <- k + 1L
    for (d in seq_len(ncol(R))) {
      value_rows[[k]] <- data.frame(model = name, metric = "rosenblatt", row = seq_len(nrow(R)), dim = d, value = R[, d]); k <- k + 1L
    }
    for (d in seq_len(ncol(X))) {
      value_rows[[k]] <- data.frame(model = name, metric = "inverse", row = seq_len(nrow(X)), dim = d, value = X[, d]); k <- k + 1L
    }

    structure <- get_structure(model)
    M <- get_matrix(model)
    structure_rows[[i]] <- data.frame(
      model = name,
      p = p,
      trunc = as.integer(structure$trunc_lvl),
      order = paste(as.integer(structure$order), collapse = ":"),
      matrix = matrix_string(M, p),
      stringsAsFactors = FALSE
    )

    # Generate the fitting sample once in rvinecopulib and share it verbatim
    # with both fitting engines. This avoids RNG/convention differences.
    if (as.integer(spec$fit_source[[1]]) == 1L) {
      Zfit <- read_matrix(file.path(DATA_DIR, paste0("fit_z_", name, ".csv")))
      Ufit <- inverse_rosenblatt(Zfit, model, cores = 1)
      write_matrix17(Ufit, file.path(DATA_DIR, paste0("fit_data_", name, ".csv")))
    }
  }

  write_result_csv(do.call(rbind, value_rows), file.path(RESULTS_DIR, "vine_r.csv"))
  write_result_csv(do.call(rbind, structure_rows), file.path(RESULTS_DIR, "structure_r.csv"))
}

pair_reference()
vine_reference()
cat("Wrote rvinecopulib fixed-model reference results.\n")
