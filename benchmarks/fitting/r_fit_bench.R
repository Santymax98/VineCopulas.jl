suppressPackageStartupMessages(library(rvinecopulib))

mode <- Sys.getenv("MODE", "common")
repeats <- as.integer(Sys.getenv("REPEATS", "3"))
root <- Sys.getenv("FIT_DIR", "benchmarks/fitting")
datadir <- file.path(root, "data")
outdir <- file.path(root, "results")
dir.create(outdir, showWarnings = FALSE, recursive = TRUE)

if (mode == "common") {
  families <- c("gaussian", "t", "clayton", "gumbel", "frank", "joe")
  criterion <- "aic"
} else if (mode == "default") {
  families <- c("indep", "gaussian", "t", "clayton", "gumbel", "frank", "joe", "bb1", "bb6", "bb7", "bb8")
  criterion <- "bic"
} else stop("MODE must be common or default")

median_time <- function(fun) {
  fun() # warm-up
  times <- numeric(repeats)
  result <- NULL
  for (i in seq_len(repeats)) {
    times[i] <- system.time(result <- fun())[["elapsed"]]
  }
  list(result = result, median = median(times), best = min(times))
}

rows <- list()
add_row <- function(scope, dataset, data, fun) {
  tryCatch({
    z <- median_time(fun)
    model <- z$result
    rows[[length(rows) + 1L]] <<- data.frame(
      engine = "rvinecopulib", scope = scope, dataset = dataset, mode = mode,
      n = nrow(data), p = ncol(data), median_sec = z$median, min_sec = z$best,
      loglik = as.numeric(model$loglik), npars = as.numeric(model$npars), status = "ok", error = ""
    )
  }, error = function(e) {
    rows[[length(rows) + 1L]] <<- data.frame(
      engine = "rvinecopulib", scope = scope, dataset = dataset, mode = mode,
      n = nrow(data), p = ncol(data), median_sec = NA, min_sec = NA,
      loglik = NA, npars = NA, status = "error", error = gsub(",", ";", conditionMessage(e))
    )
  })
}

pair_controls <- list(
  family_set = families, par_method = "mle", selcrit = criterion,
  presel = FALSE, allow_rotations = TRUE, cores = 1
)
for (name in c("pair_gaussian", "pair_clayton")) {
  data <- as.matrix(read.csv(file.path(datadir, paste0(name, ".csv")), header = FALSE))
  add_row("pair_selection", name, data, function() do.call(bicop, c(list(data = data), pair_controls)))
}

data <- as.matrix(read.csv(file.path(datadir, "vine_gaussian_ar1.csv"), header = FALSE))
vine_args <- list(
  data = data, family_set = families, par_method = "mle", selcrit = criterion,
  presel = FALSE, allow_rotations = TRUE, trunc_lvl = ncol(data) - 1L,
  tree_crit = "tau", tree_algorithm = "mst_kruskal", threshold = 0, cores = 1
)
fixed <- dvine_structure(order = seq_len(ncol(data)))
add_row("fixed_vine", "gaussian_ar1", data, function() do.call(vinecop, c(vine_args, list(structure = fixed))))
add_row("automatic_vine", "gaussian_ar1", data, function() do.call(vinecop, vine_args))

write.csv(do.call(rbind, rows), file.path(outdir, paste0("r_", mode, ".csv")), row.names = FALSE, quote = FALSE)
