#!/usr/bin/env bash
set -euo pipefail

: "${FAMILY:=gaussian}"
: "${MODEL:=D}"
: "${P:=5}"
: "${N:=10000}"
: "${TRUNC:=$((P-1))}"
: "${CDF_POINTS:=25}"
: "${CDF_N:=10000}"
: "${SAMPLES:=20}"
: "${ITERATIONS:=20}"
: "${INCLUDE_CDF:=true}"
: "${RUN_VALIDATION:=true}"
: "${RANDOMIZED_CDF:=false}"

export FAMILY MODEL P N TRUNC CDF_POINTS CDF_N SAMPLES ITERATIONS INCLUDE_CDF RANDOMIZED_CDF

mkdir -p benchmarks/results benchmarks/reference benchmarks/logs

echo "== Julia performance =="
julia --project=benchmarks benchmarks/julia_bench.jl

echo
echo "== R performance =="
Rscript benchmarks/r_bench.R

if [[ "$RUN_VALIDATION" == "true" || "$RUN_VALIDATION" == "1" ]]; then
  echo
  echo "== R reference values =="
  Rscript benchmarks/r_reference.R

  echo
  echo "== Julia validation against R =="
  julia --project=benchmarks benchmarks/julia_validate_against_r.jl
fi
