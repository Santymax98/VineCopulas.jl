# ---------------------------------------------------------------------
# Generic bivariate pair-copula primitives
# ---------------------------------------------------------------------
# Family-specific files should add methods to `_pair_logpdf`, `hfunc1`,
# `hfunc2`, `hinv1`, and `hinv2`. These fallbacks keep arbitrary
# `Copulas.jl` bivariate copulas usable, at the cost of generic dispatch.

const _STD_NORMAL = Distributions.Normal()

@inline function _pair_logpdf(C::PairCopula, u::Real, v::Real, buf::Vector{Float64})
    buf[1], buf[2] = _clp(u), _clp(v)
    return Distributions.logpdf(C, buf)
end
