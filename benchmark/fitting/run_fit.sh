#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
MODE="${MODE:-common}"
N="${N:-1000}"
P="${P:-5}"
REPEATS="${REPEATS:-3}"

export MODE N P REPEATS
export FIT_DIR="$HERE"
mkdir -p "$HERE/results"

julia --project="$ROOT/benchmarks" "$HERE/generate_cases.jl"
julia --project="$ROOT/benchmarks" "$HERE/julia_fit_bench.jl"
Rscript "$HERE/r_fit_bench.R"
julia --project="$ROOT/benchmarks" "$HERE/summarize.jl"

echo "Fitting benchmark complete: MODE=$MODE N=$N P=$P REPEATS=$REPEATS"
