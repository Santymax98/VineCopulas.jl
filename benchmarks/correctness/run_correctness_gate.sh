#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CORR="$ROOT/benchmarks/correctness"
cd "$ROOT"

: "${PARITY_N:=800}"
: "${PARITY_FIT_MODE:=common}"
export PARITY_N PARITY_FIT_MODE

if ! command -v Rscript >/dev/null 2>&1; then
  echo "Rscript is required for the rvinecopulib correctness gate." >&2
  exit 2
fi
if ! Rscript -e 'quit(status = if (requireNamespace("rvinecopulib", quietly = TRUE)) 0 else 1)' >/dev/null 2>&1; then
  echo 'R package rvinecopulib is required. Install with:' >&2
  echo '  Rscript -e '\''install.packages("rvinecopulib", repos="https://cloud.r-project.org")'\''' >&2
  exit 2
fi

julia --project=benchmarks "$CORR/generate_inputs.jl"
Rscript "$CORR/r_fixed_reference.R"
julia --project=benchmarks "$CORR/julia_fixed_reference.jl"

set +e
julia --project=benchmarks "$CORR/compare_fixed.jl"
fixed_status=$?
set -e

if [[ $fixed_status -ne 0 ]]; then
  cat <<EOF

Fixed-model report:
  $CORR/results/fixed_report.txt

The gate stops here intentionally. Resolve pair/fixed-vine parity before
running fitting or Dißmann selection.
EOF
  exit 1
fi

Rscript "$CORR/r_fit_reference.R"
julia --project=benchmarks "$CORR/julia_fit_reference.jl"

set +e
julia --project=benchmarks "$CORR/compare_fit.jl"
fit_status=$?
set -e

cat <<EOF

Reports:
  $CORR/results/fixed_report.txt
  $CORR/results/fit_report.txt

Configuration:
  reference=rvinecopulib
  PARITY_N=$PARITY_N
  PARITY_FIT_MODE=$PARITY_FIT_MODE
EOF

if [[ $fit_status -ne 0 ]]; then
  echo "Correctness gate: FAIL at fitting/selection (inspect fit_report.txt)."
  exit 1
fi

echo "Correctness gate: PASS"
