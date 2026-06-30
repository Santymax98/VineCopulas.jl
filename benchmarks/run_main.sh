#!/usr/bin/env bash
set -euo pipefail

# Clean default route for ordinary performance/value checks.
# Excludes Student-t so the main benchmark remains fast and representative
# of the currently optimized families.

export FAMILIES="${FAMILIES:=gaussian clayton gumbel frank}"
export SCENARIOS="${SCENARIOS:=5:10000:4 10:10000:2 20:10000:2}"
export SAMPLES="${SAMPLES:=5}"
export ITERATIONS="${ITERATIONS:=5}"
export CDF_POINTS="${CDF_POINTS:=10}"
export CDF_N="${CDF_N:=5000}"
export RUN_VALIDATION="${RUN_VALIDATION:=true}"

bash benchmarks/run_battery.sh
