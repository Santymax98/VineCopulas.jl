supported_families <- c("indep", "gaussian", "t", "clayton", "gumbel", "frank", "joe", "bb1", "bb6", "bb7", "bb8", "mixed")

paircopula <- function(family) {
  switch(
    family,
    "indep" = bicop_dist("indep"),
    "gaussian" = bicop_dist("gaussian", parameters = 0.35),
    "t" = bicop_dist("t", parameters = c(0.35, 4)),
    "clayton" = bicop_dist("clayton", parameters = 1.5),
    "gumbel" = bicop_dist("gumbel", parameters = 1.3),
    "frank" = bicop_dist("frank", parameters = 2.5),
    "joe" = bicop_dist("joe", parameters = 1.5),
    "bb1" = bicop_dist("bb1", parameters = c(1.2, 1.5)),
    "bb6" = bicop_dist("bb6", parameters = c(1.2, 1.5)),
    "bb7" = bicop_dist("bb7", parameters = c(1.2, 1.5)),
    "bb8" = bicop_dist("bb8", parameters = c(1.5, 0.6)),
    stop(paste0("Unsupported family: ", family))
  )
}

mixed_family_at <- function(tree, edge) {
  pool <- c("gaussian", "t", "clayton", "gumbel", "frank", "joe", "bb1", "bb6", "bb7", "bb8")
  pool[((tree + edge - 2) %% length(pool)) + 1]
}

make_paircopulas <- function(family, p, trunc) {
  if (family == "mixed") {
    return(lapply(seq_len(trunc), function(tree) {
      lapply(seq_len(p - tree), function(edge) paircopula(mixed_family_at(tree, edge)))
    }))
  }
  pc <- paircopula(family)
  lapply(seq_len(trunc), function(tree) replicate(p - tree, pc, simplify = FALSE))
}

make_vine <- function(model, family, p, trunc) {
  pcs <- make_paircopulas(family, p, trunc)
  structure <- if (model == "C") {
    cvine_structure(order = seq_len(p), trunc_lvl = trunc)
  } else if (model == "D") {
    dvine_structure(order = seq_len(p), trunc_lvl = trunc)
  } else {
    stop("Use MODEL=D or MODEL=C")
  }
  vinecop_dist(pair_copulas = pcs, structure = structure)
}

safe_pvinecop <- function(U, vc, n_mc) {
  tryCatch(
    pvinecop(U, vc, n_mc = n_mc, qrng = TRUE),
    error = function(e1) {
      tryCatch(
        pvinecop(U, vc, n_mc = n_mc),
        error = function(e2) pvinecop(U, vc)
      )
    }
  )
}

str_env <- function(name, default) {
  val <- Sys.getenv(name, unset = default)
  if (is.na(val) || val == "") default else val
}

int_env <- function(name, default) {
  as.integer(str_env(name, as.character(default)))
}

bool_env <- function(name, default = FALSE) {
  val <- tolower(str_env(name, if (default) "true" else "false"))
  val %in% c("1", "true", "t", "yes", "y")
}
