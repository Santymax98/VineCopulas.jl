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

mkdir -p benchmark/results benchmark/reference benchmark/logs

echo "== Julia performance =="
julia --project=benchmarks benchmark/julia_bench.jl

echo
echo "== R performance =="
Rscript benchmark/r_bench.R

if [[ "$RUN_VALIDATION" == "true" || "$RUN_VALIDATION" == "1" ]]; then
  echo
  echo "== R reference values =="
  Rscript benchmark/r_reference.R

  echo
  echo "== Julia validation against R =="
  julia --project=benchmarks benchmark/julia_validate_against_r.jl
fi
