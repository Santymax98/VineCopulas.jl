# Release checklist

Use this checklist before registering a release.

## 1. Package tests

```bash
julia --project=. -e 'using Pkg; Pkg.instantiate(); Pkg.test()'
```

## 2. External correctness

Run both fitting campaigns against R `rvinecopulib`:

```bash
PARITY_N=800 PARITY_FIT_MODE=common \
  bash benchmarks/correctness/run_correctness_gate.sh

PARITY_N=800 PARITY_FIT_MODE=default \
  bash benchmarks/correctness/run_correctness_gate.sh
```

Do not relax tolerances or remove a candidate family to turn a failing gate into a pass. Diagnose the failing family, structure, or numerical primitive instead.

## 3. Performance snapshot

Refresh the evaluation benchmark and at least one fitting benchmark:

```bash
bash benchmarks/run_main.sh
MODE=common N=1000 P=5 REPEATS=3 bash benchmarks/fitting/run_fit.sh
```

Run the default fitting benchmark after its correctness gate is green. Record the comparison environment with:

```bash
bash benchmarks/correctness/record_environment.sh
```

## 4. Documentation

Build the documentation from the package root:

```bash
julia --project=docs -e '
using Pkg
Pkg.develop(PackageSpec(path=pwd()))
Pkg.instantiate()
include("docs/make.jl")
'
```

Check that the six main documentation sections render correctly and that the version selector exposes `dev`, `stable`, and tagged releases after deployment.

## 5. Release metadata

Before tagging:

- set the intended version in `Project.toml` and `CITATION.cff`;
- replace `Unreleased` in `CHANGELOG.md` with the release date;
- add `date-released` to `CITATION.cff`;
- confirm CI and documentation jobs are green;
- register the release only from the tested commit.
