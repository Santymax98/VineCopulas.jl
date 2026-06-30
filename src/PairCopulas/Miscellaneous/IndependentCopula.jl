# ---------------------------------------------------------------------
# Independence copula fast path
# ---------------------------------------------------------------------

@inline _pair_logpdf(C::Copulas.IndependentCopula, u::Real, v::Real, buf::Vector{Float64}) = 0.0
@inline hfunc1(C::Copulas.IndependentCopula, u::Real, v::Real) = _clp(u)
@inline hfunc2(C::Copulas.IndependentCopula, u::Real, v::Real) = _clp(v)
@inline hfunc1(C::Copulas.IndependentCopula, uv::Tuple{<:Real,<:Real}) = hfunc1(C, uv[1], uv[2])
@inline hfunc2(C::Copulas.IndependentCopula, uv::Tuple{<:Real,<:Real}) = hfunc2(C, uv[1], uv[2])
@inline hinv1(C::Copulas.IndependentCopula, q::Real, v::Real) = _clp(q)
@inline hinv2(C::Copulas.IndependentCopula, q::Real, u::Real) = _clp(q)
