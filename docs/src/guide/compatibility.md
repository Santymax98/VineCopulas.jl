# Compatibility

## Julia and package versions

`VineCopulas.jl` supports Julia 1.10 and newer. Version 0.1.2 requires `Copulas.jl` 0.1.40 or newer within the 0.1 series.

The CI matrix tests the package on Julia 1.10 and the current Julia release.

## Copulas.jl interoperability

The public construction API keeps the mathematical parameter domains implemented by `Copulas.jl`. For example, direct construction such as

```julia
ClaytonCopula(2, θ)
TCopula(ν, Σ)
GumbelCopula(2, θ)
```

continues to use the corresponding `Copulas.jl` domain.

Automatic vine selection can use narrower **candidate parameter domains**. These bounds are internal to model selection and are chosen to align the candidate space with `vinecopulib` where external parity is required. They do not redefine the public copula families. See [Controls and parameter domains](../fitting/controls.md).

## rvinecopulib

`rvinecopulib` is used as an external reference for the correctness gate. Raw R-vine matrices are not compared as strings because equivalent vines can have different matrix representations. Correctness checks compare represented edges, families, rotations, parameters, likelihoods, Rosenblatt transforms, and inverse transforms.

## Documentation versions

The documentation deployment keeps separate tagged and development sites. Use `stable` for the latest registered release and `dev` for the current `main` branch; retained patch releases are available from the version selector.
