#!/usr/bin/env bash
set -euo pipefail

# General benchmark battery for the families currently suitable for the
# main performance table. Student-t is intentionally excluded here and is
# studied separately with benchmarks/tcopula_study/run_t_study.sh.

: "${MODELS:=D}"
: "${FAMILIES:=gaussian clayton gumbel frank}"
: "${EXTENDED:=false}"
: "${MIXED:=false}"
: "${SCENARIOS:=5:10000:4 10:10000:2 20:10000:2}"
: "${CDF_POINTS:=10}"
: "${CDF_N:=5000}"
: "${SAMPLES:=5}"
: "${ITERATIONS:=5}"
: "${INCLUDE_CDF:=true}"
: "${RUN_VALIDATION:=true}"

if [[ "$EXTENDED" == "true" || "$EXTENDED" == "1" ]]; then
  FAMILIES="$FAMILIES joe bb1 bb6 bb7 bb8"
fi

if [[ "$MIXED" == "true" || "$MIXED" == "1" ]]; then
  FAMILIES="$FAMILIES mixed"
fi

export CDF_POINTS CDF_N SAMPLES ITERATIONS INCLUDE_CDF RUN_VALIDATION

mkdir -p benchmarks/results benchmarks/reference benchmarks/logs

for MODEL in $MODELS; do
  for FAMILY in $FAMILIES; do
    for scenario in $SCENARIOS; do
      IFS=: read -r P N TRUNC <<< "$scenario"
      export MODEL FAMILY P N TRUNC
      log="benchmarks/logs/run_${MODEL}_${FAMILY}_p${P}_n${N}_trunc${TRUNC}.log"
      echo "============================================================"
      echo "MODEL=$MODEL FAMILY=$FAMILY P=$P N=$N TRUNC=$TRUNC"
      echo "log: $log"
      echo "============================================================"
      bash benchmarks/run_one.sh 2>&1 | tee "$log"
    done
  done
done
