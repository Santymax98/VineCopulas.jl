# Miscellaneous bivariate conditional primitives.

# Public reflected-copula types supported by Copulas.jl.
#
# Do not dispatch on Copulas.AbstractReflectedCopula here: that type is an
# internal implementation detail in Copulas.jl.  VineCopulas depends only on
# the public reflected types and semantic accessors.
const _ReflectedPairCopula = Union{
    Copulas.SurvivalCopula{2},
    Copulas.Rotated90Copula{2},
    Copulas.Rotated180Copula{2},
    Copulas.Rotated270Copula{2},
}

@inline function _reflection_parts(S::_ReflectedPairCopula)
    B = Copulas.basecopula(S)
    fu, fv = Copulas.flipmask(S)
    return B, fu, fv
end

# ---------------------------------------------------------------------
# Conditional CDFs and inverse conditional CDFs
# ---------------------------------------------------------------------

function hfunc1(S::_ReflectedPairCopula, uv::Tuple{<:Real,<:Real})
    u, v = _clp(uv[1]), _clp(uv[2])
    B, fu, fv = _reflection_parts(S)
    q = hfunc1(B, fu ? 1 - u : u, fv ? 1 - v : v,)
    return _clp(fu ? 1 - q : q)
end

function hfunc2(S::_ReflectedPairCopula, uv::Tuple{<:Real,<:Real})
    u, v = _clp(uv[1]), _clp(uv[2])
    B, fu, fv = _reflection_parts(S)
    q = hfunc2(B, fu ? 1 - u : u, fv ? 1 - v : v,)
    return _clp(fv ? 1 - q : q)
end

function hinv1(S::_ReflectedPairCopula, q::Real, v::Real)
    q, v = _clp(q), _clp(v)
    B, fu, fv = _reflection_parts(S)
    u = hinv1(B, fu ? 1 - q : q, fv ? 1 - v : v,)
    return _clp(fu ? 1 - u : u)
end

function hinv2(S::_ReflectedPairCopula, q::Real, u::Real)
    q, u = _clp(q), _clp(u)
    B, fu, fv = _reflection_parts(S)
    v = hinv2(B, fv ? 1 - q : q, fu ? 1 - u : u,)
    return _clp(fv ? 1 - v : v)
end

# ---------------------------------------------------------------------
# Fused reflected pair kernels
# ---------------------------------------------------------------------

# A coordinate reflection has unit absolute Jacobian, so the density itself is
# unchanged after evaluating the base copula at the reflected point.

@inline function _reflected_inputs(S::_ReflectedPairCopula, u::Real, v::Real,)
    uu, vv = _clp(u), _clp(v)
    B, fu, fv = _reflection_parts(S)
    ub = fu ? 1 - uu : uu
    vb = fv ? 1 - vv : vv
    return B, ub, vb, fu, fv
end

@inline function _pair_logpdf(S::_ReflectedPairCopula, u::Real, v::Real, buf::Vector{Float64},)
    B, ub, vb, _, _ = _reflected_inputs(S, u, v)
    return _pair_logpdf(B, ub, vb, buf)
end

@inline function _pair_hfuncs(S::_ReflectedPairCopula, u::Real, v::Real,)
    B, ub, vb, fu, fv = _reflected_inputs(S, u, v)
    h1, h2 = _pair_hfuncs(B, ub, vb)
    return (_clp(fu ? 1 - h1 : h1), _clp(fv ? 1 - h2 : h2),)
end

@inline function _pair_step(S::_ReflectedPairCopula, u::Real, v::Real, buf::Vector{Float64},)
    B, ub, vb, fu, fv = _reflected_inputs(S, u, v)
    logc, h1, h2 = _pair_step(B, ub, vb, buf)
    return (logc, _clp(fu ? 1 - h1 : h1), _clp(fv ? 1 - h2 : h2),)
end

@inline function _pair_logpdf_h1(S::_ReflectedPairCopula, u::Real, v::Real, buf::Vector{Float64},)
    B, ub, vb, fu, _ = _reflected_inputs(S, u, v)
    logc, h1 = _pair_logpdf_h1(B, ub, vb, buf)
    return logc, _clp(fu ? 1 - h1 : h1)
end

@inline function _pair_logpdf_h2(S::_ReflectedPairCopula,u::Real, v::Real, buf::Vector{Float64},)
    B, ub, vb, _, fv = _reflected_inputs(S, u, v)
    logc, h2 = _pair_logpdf_h2(B, ub, vb, buf)
    return logc, _clp(fv ? 1 - h2 : h2)
end
