library(rvinecopulib)
library(bench)
source("benchmarks/r_helpers.R")

family <- str_env("FAMILY", "gaussian")
model <- str_env("MODEL", "D")
p <- int_env("P", 5)
n <- int_env("N", 10000)
trunc <- int_env("TRUNC", p - 1)
iterations <- int_env("ITERATIONS", 20)
cdf_points <- int_env("CDF_POINTS", 25)
cdf_n <- int_env("CDF_N", 10000)
include_cdf <- bool_env("INCLUDE_CDF", TRUE)

vc <- make_vine(model, family, p, trunc)
set.seed(2026)
U <- rvinecop(n, vc)
Z <- rosenblatt(U, vc)
Ucdf <- U[seq_len(min(cdf_points, n)), , drop = FALSE]

cat("rvinecopulib benchmark\n")
cat("family     =", family, "\n")
cat("model      =", model, "\n")
cat("p          =", p, "\n")
cat("n          =", n, "\n")
cat("trunc      =", trunc, "\n")
cat("iterations =", iterations, "\n")
cat("cdf_points =", cdf_points, "\n")
cat("cdf_n      =", cdf_n, "\n\n")

if (include_cdf) {
  res <- bench::mark(
    density_vector = dvinecop(U, vc),
    loglikelihood_sum = sum(log(dvinecop(U, vc))),
    rosenblatt = rosenblatt(U, vc),
    inverse_rosenblatt = inverse_rosenblatt(Z, vc),
    rand = rvinecop(n, vc),
    cdf_qmc_matrix = safe_pvinecop(Ucdf, vc, cdf_n),
    iterations = iterations,
    check = FALSE,
    memory = TRUE
  )
} else {
  res <- bench::mark(
    density_vector = dvinecop(U, vc),
    loglikelihood_sum = sum(log(dvinecop(U, vc))),
    rosenblatt = rosenblatt(U, vc),
    inverse_rosenblatt = inverse_rosenblatt(Z, vc),
    rand = rvinecop(n, vc),
    iterations = iterations,
    check = FALSE,
    memory = TRUE
  )
}

out <- data.frame(
  operation = as.character(res$expression),
  min = as.character(res$min),
  median = as.character(res$median),
  mem_alloc = as.character(res$mem_alloc),
  n_itr = res$n_itr,
  n_gc = res$n_gc
)
print(out, row.names = FALSE)

dir.create("benchmarks/results", recursive = TRUE, showWarnings = FALSE)
outpath <- paste0("benchmarks/results/bench_r_", model, "_", family, "_p", p, "_n", n, "_trunc", trunc, ".csv")
write.csv(out, outpath, row.names = FALSE)
cat("\nSaved:", outpath, "\n")
