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
