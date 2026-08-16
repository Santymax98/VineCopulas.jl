suppressPackageStartupMessages(library(rvinecopulib))

script_dir <- function() {
  args <- commandArgs(trailingOnly = FALSE)
  file_arg <- grep("^--file=", args, value = TRUE)
  if (length(file_arg) == 0) return(normalizePath("benchmarks/correctness", mustWork = FALSE))
  dirname(normalizePath(sub("^--file=", "", file_arg[[1]]), mustWork = FALSE))
}

CORR_ROOT <- script_dir()
DATA_DIR <- file.path(CORR_ROOT, "data")
RESULTS_DIR <- file.path(CORR_ROOT, "results")

dir.create(DATA_DIR, recursive = TRUE, showWarnings = FALSE)
dir.create(RESULTS_DIR, recursive = TRUE, showWarnings = FALSE)

read_matrix <- function(path) {
  as.matrix(read.table(path, sep = ",", header = FALSE, check.names = FALSE))
}

write_matrix17 <- function(x, path) {
  lines <- apply(as.matrix(x), 1, function(r) paste(sprintf("%.17g", r), collapse = ","))
  writeLines(lines, path, useBytes = TRUE)
}

read_spec_csv <- function(name) {
  read.csv(
    file.path(DATA_DIR, name),
    stringsAsFactors = FALSE,
    check.names = FALSE,
    na.strings = c("", "NA")
  )
}

parse_ints <- function(x, sep = ":") {
  if (is.na(x) || !nzchar(x)) return(integer())
  as.integer(strsplit(x, sep, fixed = TRUE)[[1]])
}

parse_struct_array <- function(x) {
  if (is.na(x) || !nzchar(x)) return(list())
  lapply(strsplit(x, "|", fixed = TRUE)[[1]], parse_ints)
}

params_from_row <- function(row) {
  p <- numeric()
  if (!is.na(row$p1)) p <- c(p, as.numeric(row$p1))
  if (!is.na(row$p2)) p <- c(p, as.numeric(row$p2))
  p
}

r_family_name <- function(family) {
  switch(
    family,
    "Independence" = "indep",
    "Gaussian" = "gaussian",
    "Student" = "t",
    "Clayton" = "clayton",
    "Gumbel" = "gumbel",
    "Frank" = "frank",
    "Joe" = "joe",
    "BB1" = "bb1",
    "BB6" = "bb6",
    "BB7" = "bb7",
    "BB8" = "bb8",
    stop(paste0("Unsupported family in correctness spec: ", family))
  )
}

canonical_family_name <- function(family) {
  key <- tolower(gsub("[-_ ]", "", family))
  switch(
    key,
    "indep" = "Independence",
    "independence" = "Independence",
    "gaussian" = "Gaussian",
    "gauss" = "Gaussian",
    "t" = "Student",
    "student" = "Student",
    "studentt" = "Student",
    "clayton" = "Clayton",
    "clay" = "Clayton",
    "gumbel" = "Gumbel",
    "frank" = "Frank",
    "joe" = "Joe",
    "bb1" = "BB1",
    "bb6" = "BB6",
    "bb7" = "BB7",
    "bb8" = "BB8",
    family
  )
}

make_bicop <- function(family, rotation, params) {
  fam <- r_family_name(family)
  if (family == "Independence") return(bicop_dist(family = fam))
  bicop_dist(family = fam, rotation = as.integer(rotation), parameters = as.numeric(params))
}

model_spec <- function(name, vine_specs = NULL) {
  if (is.null(vine_specs)) vine_specs <- read_spec_csv("vine_specs.csv")
  rows <- vine_specs[vine_specs$model == name, , drop = FALSE]
  if (nrow(rows) != 1) stop(paste0("Expected exactly one vine spec for ", name))
  rows[1, , drop = FALSE]
}

make_structure <- function(model_row) {
  rvine_structure(
    order = parse_ints(model_row$order),
    struct_array = parse_struct_array(model_row$struct_array)
  )
}

make_pair_copulas <- function(model_name, edge_specs = NULL) {
  if (is.null(edge_specs)) edge_specs <- read_spec_csv("vine_edge_specs.csv")
  edges <- edge_specs[edge_specs$model == model_name, , drop = FALSE]
  if (nrow(edges) == 0) stop(paste0("No pair-copulas for model ", model_name))
  trees <- sort(unique(edges$tree))
  lapply(trees, function(t) {
    erows <- edges[edges$tree == t, , drop = FALSE]
    erows <- erows[order(erows$edge), , drop = FALSE]
    lapply(seq_len(nrow(erows)), function(i) {
      row <- erows[i, , drop = FALSE]
      make_bicop(row$family, row$rotation, params_from_row(row))
    })
  })
}

make_vine <- function(model_row, edge_specs = NULL) {
  name <- model_row$model[[1]]
  vinecop_dist(
    pair_copulas = make_pair_copulas(name, edge_specs),
    structure = make_structure(model_row)
  )
}

matrix_string <- function(M, p) {
  vals <- as.integer(M)

  if (length(vals) != p * p) {
    stop(
      sprintf(
        "Invalid R-vine matrix serialization: got %d values for dimension %d",
        length(vals), p
      )
    )
  }

  M0 <- matrix(vals, nrow = p, ncol = p)
  paste(
    apply(M0, 1, function(r) paste(r, collapse = ":")),
    collapse = ";"
  )
}

canonical_edge <- function(a, b, conditioning, rotation) {
  conditioning <- sort(as.integer(conditioning))
  rotation <- as.integer(rotation)
  if (a <= b) {
    return(list(a = as.integer(a), b = as.integer(b), conditioning = conditioning, rotation = rotation))
  }
  if (rotation == 90L) rotation <- 270L else if (rotation == 270L) rotation <- 90L
  list(a = as.integer(b), b = as.integer(a), conditioning = conditioning, rotation = rotation)
}

edge_rows <- function(model, phase, dataset) {
  # Extract mathematical edges from rvinecopulib's canonical R-vine matrix.
  # `struct_array` stores indices relative to `order`, so reading it as raw
  # variable labels is wrong for non-natural orders.  The matrix convention is
  # unambiguous: edge e in tree t is
  #   (M[d-e+1,e], M[t,e] | M[t-1,e], ..., M[1,e]).
  M <- get_matrix(model)
  d <- length(get_structure(model)$order)
  pcs <- get_all_pair_copulas(model)
  trunc <- length(pcs)
  out <- list()
  k <- 1L

  for (t in seq_len(trunc)) {
    for (e in seq_along(pcs[[t]])) {
      a <- as.integer(M[d - e + 1L, e])
      b <- as.integer(M[t, e])
      conditioning <- if (t == 1L) {
        integer()
      } else {
        as.integer(M[(t - 1L):1L, e])
      }

      pc <- pcs[[t]][[e]]
      ce <- canonical_edge(a, b, conditioning, pc$rotation)
      pars <- as.numeric(pc$parameters)
      out[[k]] <- data.frame(
        phase = phase,
        dataset = dataset,
        tree = t,
        edge = e,
        a = ce$a,
        b = ce$b,
        conditioning = paste(ce$conditioning, collapse = ":"),
        family = canonical_family_name(pc$family),
        rotation = ce$rotation,
        p1 = if (length(pars) >= 1) pars[[1]] else NA_real_,
        p2 = if (length(pars) >= 2) pars[[2]] else NA_real_,
        stringsAsFactors = FALSE
      )
      k <- k + 1L
    }
  }

  if (length(out) == 0L) return(data.frame())
  do.call(rbind, out)
}


write_result_csv <- function(x, path) {
  write.csv(x, path, row.names = FALSE, na = "")
}

clean_error <- function(e) {
  gsub(",", ";", gsub("[\r\n]+", " ", conditionMessage(e)))
}
