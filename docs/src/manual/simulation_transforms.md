# Simulation and Transforms

## Simulation

Vine models support ordinary random simulation through `rand` and quasi-Monte Carlo simulation through `simulate_qmc`.

```julia
U = rand(vine, 10_000)
Q = simulate_qmc(vine, 10_000)
```

## Rosenblatt transform

For a fitted or explicit vine ``C``, the Rosenblatt transform maps dependent observations to conditionally uniform coordinates:

```julia
Z = rosenblatt(vine, U)
```

The inverse transform reconstructs observations from independent uniforms:

```julia
U2 = inverse_rosenblatt(vine, Z)
maximum(abs.(U2 .- U))
```

In-place variants are available for repeated workloads:

```julia
rosenblatt!(dest, vine, U)
inverse_rosenblatt!(dest, vine, Z)
```

For **standard general R-vines** truncated below full depth, density evaluation and fitting are available, but Rosenblatt/inverse Rosenblatt transforms are not yet implemented. Because `rand`, `simulate_qmc`, and the numerical CDF use the inverse Rosenblatt transform, those operations currently require a full-depth standard general R-vine. Truncated C- and D-vines are not subject to this limitation.

!!! warning
    This limitation is structural, not cosmetic. A truncated general R-vine must
    still define a coherent traversal plan for transforms before `rand`,
    `simulate_qmc`, or simulation-based CDF estimation can use it.

## Conditional simulation

Every vine sampler is a recursion: the inverse Rosenblatt transform generates
the coordinates one at a time, each conditionally on the ones generated before
it. When the coordinates you want to hold fixed are exactly the first ones that
recursion generates, seeding them with known uniforms and generating the rest
gives an **exact** sample from the conditional copula ``C(u_{-S} \mid u_S)``
at the cost of an ordinary `rand`. The `fixed` keyword does that:

```julia
# Hold coordinate 5 at 0.9 and coordinate 4 at 0.2 in every column, draw the rest.
U = rand(vine, 10_000; fixed=([4, 5], (0.2, 0.9)))

# One conditioning value per column.
U = rand(vine, n; fixed=([5], reshape(u5, 1, n)))

# The same through the transforms; the rows Z[js, :] are ignored.
U = inverse_rosenblatt(vine, Z; fixed=([4, 5], (0.2, 0.9)))
Q = simulate_qmc(vine, 4096; fixed=([5], (0.9,)))
```

`Ujs` is a `length(js) × n` matrix, or a tuple or vector of `length(js)` scalars
broadcast over every column; `js => Ujs` is accepted in place of the tuple.
Every value must lie in `[0, 1]`: a value outside the unit interval, `NaN` or
`Inf` is an `ArgumentError`, never silently moved into range. The fixed rows of
the result are the given values exactly, including `0.0` and `1.0`; a boundary
value conditions the recursion at the nearest interior floating-point number,
which is the limit of the conditional law at that edge.

Which coordinates can be fixed is a property of the structure, and
[`admits_conditioning`](@ref) reads it:

- a `DVineCopula` admits a block at either end of its path `order(vine)`;
- a `CVineCopula` admits the first `length(js)` roots of `order(vine)`;
- a standard `RVineCopula` admits the tail of `order(vine)`.

The order of the labels inside `js` does not matter. When the predicate is
`false`, `rand` refuses with an `ArgumentError` that names the fit-side option
that makes it `true` rather than returning an approximate draw:

```julia
admits_conditioning(vine, [4, 5])      # true or false
fit(RVineCopula, U; sampling_tail=[4, 5])   # peel the trees so 4 and 5 go last
fit(DVineCopula, U; order=[4, 5, 1, 3, 2])  # a D-vine path with 4 and 5 at one end
```

`sampling_tail` changes only how the selected trees are read into an order,
never the trees or the pair copulas, so the fitted model is the same; it cannot
always be honoured, because a variable that is never a leaf of the top tree at
the right moment cannot be peeled last. Check the predicate after the fit.

Conditioning on an interval ``U_j \in [a, b]`` composes with this without
further machinery: draw the conditioning block from its interval-restricted law
(for one coordinate that is `Uniform(a, b)`, since a copula margin is uniform),
then draw the rest with `fixed`.

## Numerical CDF

The multivariate CDF is evaluated numerically for general vines. Use `set_cdf_nsamples!` to control the integration budget and `enable_deterministic_cdf!` when reproducibility is more important than randomization.
