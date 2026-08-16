#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

bash benchmarks/run_main.sh
MODE="${MODE:-common}" N="${FIT_N:-1000}" P="${FIT_P:-5}" REPEATS="${FIT_REPEATS:-3}" \
  bash benchmarks/fitting/run_fit.sh
