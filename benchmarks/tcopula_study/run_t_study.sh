#!/usr/bin/env bash
set -euo pipefail

# Focused Student-t route. It is separated from the main battery because
# TCopula is correct and validated, but currently performance-limited by
# scalar Student-t CDF/quantile evaluations.

: "${RUN_DIAGNOSTICS:=true}"
: "${MODELS:=D}"
: "${SCENARIOS:=2:10000:1 5:10000:4 20:10000:2}"
: "${SAMPLES:=5}"
: "${ITERATIONS:=5}"
: "${CDF_POINTS:=10}"
: "${CDF_N:=5000}"
: "${INCLUDE_CDF:=true}"
: "${RUN_VALIDATION:=true}"

export FAMILY=t SAMPLES ITERATIONS CDF_POINTS CDF_N INCLUDE_CDF RUN_VALIDATION

mkdir -p benchmarks/results benchmarks/reference benchmarks/logs

if [[ "$RUN_DIAGNOSTICS" == "true" || "$RUN_DIAGNOSTICS" == "1" ]]; then
  echo "== TCopula scalar diagnostics =="
  julia --project=benchmarks benchmarks/tcopula_study/diagnose_t_core.jl

  echo
  echo "== TCopula primitive diagnostics =="
  julia --project=benchmarks benchmarks/tcopula_study/diagnose_t_primitives.jl
fi

for MODEL in $MODELS; do
  for scenario in $SCENARIOS; do
    IFS=: read -r P N TRUNC <<< "$scenario"
    export MODEL P N TRUNC
    log="benchmarks/logs/run_${MODEL}_t_p${P}_n${N}_trunc${TRUNC}.log"
    echo
    echo "============================================================"
    echo "TCopula study: MODEL=$MODEL P=$P N=$N TRUNC=$TRUNC"
    echo "log: $log"
    echo "============================================================"
    bash benchmarks/run_one.sh 2>&1 | tee "$log"
  done
done
