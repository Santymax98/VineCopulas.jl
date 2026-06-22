# Bivariate extreme-value conditional primitives.
# C(u,v) = exp(-(x+y)A(t)), x=-log(u), y=-log(v), t=x/(x+y).

@inline _uses_exact_ev_conditionals(::Any) = false
@inline _uses_exact_ev_conditionals(::Union{Copulas.CuadrasAugeTail,Copulas.MOTail,Copulas.BC2Tail}) = true
@inline _ev_conditional(C::Copulas.ExtremeValueCopula{2}, base::Real, dim::Int8) = Copulas.BivEVDistortion(C.tail, dim, float(base))

@inline function _ev_terms(C::Copulas.ExtremeValueCopula{2}, u::Real, v::Real)
    x, y = -log(u), -log(v)
    s, t = x+y, x/(x+y)
    A, dA = Copulas.A(C.tail, t), Copulas.dA(C.tail, t)
    return t, A, dA, exp(-s*A)
end

function hfunc1(C::Copulas.ExtremeValueCopula{2}, uv::Tuple{<:Real,<:Real})
    u, v = _clp(uv[1]), _clp(uv[2])
    _uses_exact_ev_conditionals(C.tail) && return _clp(Distributions.cdf(_ev_conditional(C, v, Int8(2)), u))
    t, A, dA, Cuv = _ev_terms(C, u, v)
    return _clp(Cuv*(A-t*dA)/v)
end

function hfunc2(C::Copulas.ExtremeValueCopula{2}, uv::Tuple{<:Real,<:Real})
    u, v = _clp(uv[1]), _clp(uv[2])
    _uses_exact_ev_conditionals(C.tail) && return _clp(Distributions.cdf(_ev_conditional(C, u, Int8(1)), v))
    t, A, dA, Cuv = _ev_terms(C, u, v)
    return _clp(Cuv*(A+(1-t)*dA)/u)
end

function hinv1(C::Copulas.ExtremeValueCopula{2}, q::Real, v::Real)
    q, v = _clp(q), _clp(v)
    _uses_exact_ev_conditionals(C.tail) && return _clp(Distributions.quantile(_ev_conditional(C, v, Int8(2)), q))
    return _clp(_unit_root(u -> hfunc1(C, u, v)-q))
end

function hinv2(C::Copulas.ExtremeValueCopula{2}, q::Real, u::Real)
    q, u = _clp(q), _clp(u)
    _uses_exact_ev_conditionals(C.tail) && return _clp(Distributions.quantile(_ev_conditional(C, u, Int8(1)), q))
    return _clp(_unit_root(v -> hfunc2(C, u, v)-q))
end
