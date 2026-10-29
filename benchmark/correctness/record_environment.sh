#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="$HERE/environment_correctness.txt"
{
  echo "timestamp_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "uname=$(uname -a)"
  echo "PARITY_N=${PARITY_N:-800}"
  echo "PARITY_FIT_MODE=${PARITY_FIT_MODE:-common}"
  echo "reference=rvinecopulib"
  echo "julia=$(julia --version 2>&1 || true)"
  julia --project="$HERE/.." -e '
    using Pkg
    deps = Pkg.dependencies()
    for p in ("VineCopulas", "Copulas", "Optim")
        x = nothing
        for info in values(deps)
            if info.name == p
                x = info
                break
            end
        end
        println(p, "=", x === nothing ? "missing" : x.version)
    end
  ' 2>&1 || true
  echo "Rscript=$(Rscript --version 2>&1 || true)"
  Rscript -e 'cat("R=", R.version.string, "\n", sep=""); if (requireNamespace("rvinecopulib", quietly=TRUE)) cat("rvinecopulib=", as.character(packageVersion("rvinecopulib")), "\n", sep="") else cat("rvinecopulib=missing\n")' 2>&1 || true
} > "$OUT"
echo "Wrote $OUT"
