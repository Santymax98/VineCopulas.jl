# Roadmap

The roadmap is intentionally short and is not tied to version numbers. Correctness remains a release requirement; the main open target is now performance.

## Main priority: performance

- Use the [performance benchmarks](../benchmarks/performance.md) as the baseline for optimization work and keep every result reproducible through the [benchmark workflow](../benchmarks/reproduce.md).
- Reduce fitting time, especially for the default family search. The practical goal is to close the gap to `rvinecopulib` and, where possible, match or outperform it without weakening correctness or API clarity.
- Profile before optimizing. Performance changes should show a measurable improvement in the benchmark suite while the [correctness gate](../benchmarks/correctness.md) remains green.
- Prioritize pair-family selection, repeated likelihood and h-function calculations, Student-t bottlenecks, allocations, and reusable intermediate state.
- Explore parallel family or edge fitting only where benchmarks show a clear benefit.

Performance work is a particularly useful contribution area. Profiling results, lower-allocation kernels, optimizer improvements, and focused pull requests with before/after benchmark numbers are welcome.

## Near-term improvements

- Improve fitted-model summaries and diagnostics.
- Reduce allocations in repeated vine evaluation and conditional-state propagation.
- Reuse or fuse intermediate computations when density and h-functions require the same quantities.
- Add data-driven truncation-depth selection with a clear statistical criterion.
- Keep fitting controls expressive without making the default API heavier.

## Later

- Observation weights and deliberate missing-data handling.
- Additional nonparametric pair-copula fitting routes.
- Carefully scoped support for non-simplified vine models.
