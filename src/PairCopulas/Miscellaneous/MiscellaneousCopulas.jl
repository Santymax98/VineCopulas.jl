# Miscellaneous bivariate conditional primitives.

# SurvivalCopula flips are encoded at the type level. The base copula is
# evaluated after flipping coordinates; the conditional probability is flipped
# only when its target margin is flipped.
function hfunc1(S::Copulas.SurvivalCopula{2,CT,flips}, uv::Tuple{<:Real,<:Real}) where {CT,flips}
    u, v = _clp(uv[1]), _clp(uv[2])
    fu, fv = 1 in flips, 2 in flips
    q = hfunc1(S.C, fu ? 1-u : u, fv ? 1-v : v)
    return _clp(fu ? 1-q : q)
end

function hfunc2(S::Copulas.SurvivalCopula{2,CT,flips}, uv::Tuple{<:Real,<:Real}) where {CT,flips}
    u, v = _clp(uv[1]), _clp(uv[2])
    fu, fv = 1 in flips, 2 in flips
    q = hfunc2(S.C, fu ? 1-u : u, fv ? 1-v : v)
    return _clp(fv ? 1-q : q)
end

function hinv1(S::Copulas.SurvivalCopula{2,CT,flips}, q::Real, v::Real) where {CT,flips}
    q, v = _clp(q), _clp(v)
    fu, fv = 1 in flips, 2 in flips
    u = hinv1(S.C, fu ? 1-q : q, fv ? 1-v : v)
    return _clp(fu ? 1-u : u)
end

function hinv2(S::Copulas.SurvivalCopula{2,CT,flips}, q::Real, u::Real) where {CT,flips}
    q, u = _clp(q), _clp(u)
    fu, fv = 1 in flips, 2 in flips
    v = hinv2(S.C, fv ? 1-q : q, fu ? 1-u : u)
    return _clp(fv ? 1-v : v)
end

# Fused reflection wrappers reuse the base copula's specialized kernels.  A
# coordinate reflection has unit absolute Jacobian, so the density itself is
# unchanged after evaluating the base copula at the reflected point.
@inline function _survival_inputs(
    S::Copulas.SurvivalCopula{2,CT,flips},
    u::Real,
    v::Real,
) where {CT,flips}
    uu, vv = _clp(u), _clp(v)
    fu, fv = 1 in flips, 2 in flips
    return fu ? 1 - uu : uu, fv ? 1 - vv : vv, fu, fv
end

@inline function _pair_logpdf(
    S::Copulas.SurvivalCopula{2,CT,flips},
    u::Real,
    v::Real,
    buf::Vector{Float64},
) where {CT,flips}
    ub, vb, _, _ = _survival_inputs(S, u, v)
    return _pair_logpdf(S.C, ub, vb, buf)
end

@inline function _pair_hfuncs(
    S::Copulas.SurvivalCopula{2,CT,flips},
    u::Real,
    v::Real,
) where {CT,flips}
    ub, vb, fu, fv = _survival_inputs(S, u, v)
    h1, h2 = _pair_hfuncs(S.C, ub, vb)
    return _clp(fu ? 1 - h1 : h1), _clp(fv ? 1 - h2 : h2)
end

@inline function _pair_step(
    S::Copulas.SurvivalCopula{2,CT,flips},
    u::Real,
    v::Real,
    buf::Vector{Float64},
) where {CT,flips}
    ub, vb, fu, fv = _survival_inputs(S, u, v)
    logc, h1, h2 = _pair_step(S.C, ub, vb, buf)
    return logc, _clp(fu ? 1 - h1 : h1), _clp(fv ? 1 - h2 : h2)
end

@inline function _pair_logpdf_h1(
    S::Copulas.SurvivalCopula{2,CT,flips},
    u::Real,
    v::Real,
    buf::Vector{Float64},
) where {CT,flips}
    ub, vb, fu, _ = _survival_inputs(S, u, v)
    logc, h1 = _pair_logpdf_h1(S.C, ub, vb, buf)
    return logc, _clp(fu ? 1 - h1 : h1)
end

@inline function _pair_logpdf_h2(
    S::Copulas.SurvivalCopula{2,CT,flips},
    u::Real,
    v::Real,
    buf::Vector{Float64},
) where {CT,flips}
    ub, vb, _, fv = _survival_inputs(S, u, v)
    logc, h2 = _pair_logpdf_h2(S.C, ub, vb, buf)
    return logc, _clp(fv ? 1 - h2 : h2)
end
