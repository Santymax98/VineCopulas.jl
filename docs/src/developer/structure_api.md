# Structure API

The structure API gives vine-specific algorithms a small, stable handle for the
part of a vine that is not a pair-copula family or parameter.

## AbstractVineStructure

`AbstractVineStructure{p}` is the abstract supertype for `p`-dimensional vine
structures. Concrete public structures are:

- `CVineStructure{p,q}`;
- `DVineStructure{p,q}`;
- `RVineStructure{p,q}`.

Here `p` is the dimension and `q` is the active truncation depth.

!!! warning "Do not store the same invariant twice"
    Structure truncation is encoded by `q`. Do not add a separate mutable or
    runtime truncation field to structure objects. A duplicated `q`/`trunc`
    representation can create inconsistent states and ambiguous traversal
    behavior.

## CVineStructure and DVineStructure

`CVineStructure` and `DVineStructure` store only an order:

```julia
CVineStructure{p,q}(order::NTuple{p,Int})
DVineStructure{p,q}(order::NTuple{p,Int})
```

Public constructors accept vectors or tuples and normalize to
`NTuple{p,Int}`:

```julia
st = CVineStructure((1, 2, 3, 4); trunc=2)
CVineStructure(order(st); trunc=truncation(st))
```

## RVineStructure

`RVineStructure` stores order, structure array, and an optional matrix exchange
representation:

```julia
RVineStructure{p,q}(
    order::NTuple{p,Int},
    struct_array::NTuple{q,Vector{Int}},
    matrix::Union{Nothing,Matrix{Int}},
)
```

For R-vines, the invariant is especially direct:

```math
q = \operatorname{length}(\texttt{struct\_array})
  = \operatorname{truncation}(\texttt{structure})
```

## Public operations

The public structural operations are:

```julia
structure(vine)
order(vine_or_structure)
edges(vine)
struct_array(rvine_or_structure)
truncation(vine_or_structure)
truncate(vine_or_structure, level)
rvine_matrix(vine)
```

These methods are defined only for supported concrete types. There is no
catch-all fallback for `AbstractVineCopula` or `AbstractVineStructure`.

!!! note "Capability checks"
    Because unsupported abstract subtypes do not receive generic throwing
    fallbacks, `applicable(structure, x)` and `applicable(truncation, x)` are
    meaningful capability checks.

## Truncation invariants

`truncate(vine, level)` and `truncate(structure, level)` return new objects. They
do not mutate the input.

Truncating from level `4` to level `2` is valid. Truncating that result back to
level `3` is not valid because the missing pair-copulas are no longer present.

The current public level range is `1:p-1`. Level-zero truncation is
mathematically meaningful as multivariate independence, but it requires a
deliberate engine/API pass and is therefore tracked as future work.

## Developer guidance

Add structure methods when they simplify a real algorithm: serialization,
plotting, fitting, diagnostics, conditional simulation, or truncation. Avoid
creating parallel structure abstractions that duplicate the public vine model
objects without a concrete use.
