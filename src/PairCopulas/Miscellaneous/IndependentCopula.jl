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

@inline _pair_hfuncs(C::Copulas.IndependentCopula, u::Real, v::Real) = (_clp(u), _clp(v))
@inline _pair_step(C::Copulas.IndependentCopula, u::Real, v::Real, buf::Vector{Float64}) = (0.0, _clp(u), _clp(v))
@inline _pair_logpdf_h1(C::Copulas.IndependentCopula, u::Real, v::Real, buf::Vector{Float64}) = (0.0, _clp(u))
@inline _pair_logpdf_h2(C::Copulas.IndependentCopula, u::Real, v::Real, buf::Vector{Float64}) = (0.0, _clp(v))
