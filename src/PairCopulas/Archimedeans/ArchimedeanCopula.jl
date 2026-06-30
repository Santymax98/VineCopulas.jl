# ---------------------------------------------------------------------
# Bivariate Archimedean conditional primitives
#
# Copulas.jl provides ϕ, ϕ⁻¹ and ϕ⁽¹⁾. VineCopulas.jl adds
#
#     _inv_ϕ¹(G, y) = s  such that  ϕ⁽¹⁾(G, s) = y,
#
# plus conditional CDFs and quantiles. Archimedean copulas are exchangeable,
# so one internal target/base protocol serves hfunc1/hfunc2 and hinv1/hinv2.
# Family-specific dispatch is reserved for analytic inverses or genuinely
# necessary numerical stabilization.
# ---------------------------------------------------------------------


# Generic Archimedean pair-copula density.
# For C(u,v)=ϕ(ϕ⁻¹(u)+ϕ⁻¹(v)),
# c(u,v)=ϕ''(s)/(ϕ'(s_u)ϕ'(s_v)), s=s_u+s_v.
# Family-specific files may override this method with closed forms.
@inline _pair_logpdf(C::Copulas.ArchimedeanCopula{2}, u::Real, v::Real, buf::Vector{Float64}) = _arch_pair_logpdf(C.G, _clp(u), _clp(v))

@inline _arch_pair_logpdf(G, u::Real, v::Real) = _arch_pair_logpdf_generic(G, u, v)

@inline function _arch_pair_logpdf_generic(G, u::Real, v::Real)
    su = Copulas.ϕ⁻¹(G, u)
    sv = Copulas.ϕ⁻¹(G, v)
    s = su + sv
    d1u = Copulas.ϕ⁽¹⁾(G, su)
    d1v = Copulas.ϕ⁽¹⁾(G, sv)
    d2 = ForwardDiff.derivative(t -> Copulas.ϕ⁽¹⁾(G, t), s)
    return log(abs(d2)) - log(abs(d1u)) - log(abs(d1v))
end

@inline function _arch_hfunc(G, target::Real, base::Real)
    starget, sbase = Copulas.ϕ⁻¹(G, target), Copulas.ϕ⁻¹(G, base)
    return Copulas.ϕ⁽¹⁾(G, starget + sbase) / Copulas.ϕ⁽¹⁾(G, sbase)
end

@inline function _arch_hinv_generic(G, q::Real, base::Real)
    sbase = Copulas.ϕ⁻¹(G, base)
    stotal = _inv_ϕ¹(G, q * Copulas.ϕ⁽¹⁾(G, sbase))
    return Copulas.ϕ(G, max(stotal - sbase, zero(stotal)))
end

@inline _arch_hinv(G, q::Real, base::Real) = _arch_hinv_generic(G, q, base)

@inline function _arch_hfunc_coordinate(G, target::Real, base::Real)
    ct, cb = _arch_coordinate(G, target), _arch_coordinate(G, base)
    ctotal = _arch_combine(G, ct, cb)
    return exp(_arch_logderivative(G, ctotal) - _arch_logderivative(G, cb))
end

@inline function _arch_hinv_coordinate(G, q::Real, base::Real)
    cb = _arch_coordinate(G, base)
    ctotal = _arch_inverse_logderivative(G, log(float(q)) + _arch_logderivative(G, cb))
    return _arch_probability(G, _arch_difference(G, ctotal, cb))
end

@inline hfunc1(C::Copulas.ArchimedeanCopula{2}, u::Real, v::Real) = _clp(_arch_hfunc(C.G, _clp(u), _clp(v)))

@inline hfunc2(C::Copulas.ArchimedeanCopula{2}, u::Real, v::Real) = _clp(_arch_hfunc(C.G, _clp(v), _clp(u)))

@inline hfunc1(C::Copulas.ArchimedeanCopula{2}, uv::Tuple{<:Real,<:Real}) = hfunc1(C, uv[1], uv[2])

@inline hfunc2(C::Copulas.ArchimedeanCopula{2}, uv::Tuple{<:Real,<:Real}) = hfunc2(C, uv[1], uv[2])

@inline hinv1(C::Copulas.ArchimedeanCopula{2}, q::Real, v::Real) = _clp(_arch_hinv(C.G, _clp(q), _clp(v)))

@inline hinv2(C::Copulas.ArchimedeanCopula{2}, q::Real, u::Real) = _clp(_arch_hinv(C.G, _clp(q), _clp(u)))

# Generic numerical inverse retained as a correctness fallback for generators
# without a family specialization. New BB-family work should add dispatch below
# rather than modifying this routine.
function _inv_ϕ¹_generic(G, y::Real)
    yy = float(y)
    T = typeof(yy)
    _negative_derivative_magnitude(yy, "Archimedean")
    iszero(yy) && return T(Inf)
    yy == -T(Inf) && return zero(T)

    f(s) = Copulas.ϕ⁽¹⁾(G, s) - yy
    lo, flo = zero(T), f(zero(T))
    isfinite(flo) && abs(flo) <= 64eps(T) * max(one(T), abs(yy)) && return zero(T)

    hi = one(T)
    for _ in 1:128
        fhi = f(hi)
        if isfinite(fhi) && ((flo <= zero(T) <= fhi) || (fhi <= zero(T) <= flo))
            return Roots.find_zero(f, (lo, hi), Roots.Brent(); xatol=TOLX, ftol=TOLF, maxevals=MAXE)
        end
        hi *= T(2)
    end
    throw(DomainError(y, "The target lies outside the range of the generator derivative."))
end

@inline _inv_ϕ¹(G, y::Real) = _inv_ϕ¹_generic(G, y)

# Safeguarded Newton solver for strictly decreasing scalar equations. The
# helper is intentionally family-agnostic and will also serve BB generators
# whose derivative inversion is best posed in a transformed coordinate.
function _solve_decreasing_root(f, df, x0::T) where {T<:AbstractFloat}
    lo, hi = x0 - one(T), x0 + one(T)
    flo, fhi = f(lo), f(hi)
    for _ in 1:128
        flo >= zero(T) && break
        hi, fhi = lo, flo
        lo = 2lo - one(T)
        flo = f(lo)
    end
    for _ in 1:128
        fhi <= zero(T) && break
        lo, flo = hi, fhi
        hi = 2hi + one(T)
        fhi = f(hi)
    end
    flo >= zero(T) >= fhi || throw(DomainError(x0, "Could not bracket the monotone inverse."))

    x = clamp(x0, lo, hi)
    for _ in 1:64
        fx = f(x)
        candidate = x - fx / df(x)
        abs(candidate - x) <= T(16) * eps(T) * max(one(T), abs(candidate)) && return candidate
        (!isfinite(candidate) || !(lo < candidate < hi)) && (candidate = lo + (hi - lo) / 2)
        fc = f(candidate)
        if fc > zero(T)
            lo = candidate
        else
            hi = candidate
        end
        abs(hi - lo) <= T(16) * eps(T) * max(one(T), abs(candidate)) && return candidate
        x = candidate
    end
    return x
end

# BB2, BB3 and BB7 share L = log(1+s), so coordinate algebra, conditionals and the
# final reconstruction of s are implemented once.
const _Log1pCoordinateGenerator = Union{Copulas.BB2Generator,Copulas.BB3Generator,Copulas.BB7Generator}

@inline _arch_combine(::_Log1pCoordinateGenerator, a::Real, b::Real) = _logaddexp_minus_one(a, b)
@inline _arch_difference(::_Log1pCoordinateGenerator, total::Real, base::Real) = _logsubexp_plus_one(total, base)
@inline _arch_hfunc(G::_Log1pCoordinateGenerator, target::Real, base::Real) = _arch_hfunc_coordinate(G, target, base)
@inline _arch_hinv(G::_Log1pCoordinateGenerator, q::Real, base::Real) =_arch_hinv_coordinate(G, q, base)

# =====================================================================
# Direct generator-coordinate protocol
# =====================================================================

# BB8 and BB10 both use the original generator argument s as their
# stable internal coordinate.
const _DirectGeneratorCoordinate = Union{Copulas.BB8Generator, Copulas.BB10Generator,}

@inline _arch_combine(::_DirectGeneratorCoordinate, a::Real, b::Real,) = a + b
@inline function _arch_difference(::_DirectGeneratorCoordinate, total::Real, base::Real,)
    tt, bb = promote(float(total), float(base),)
    T = typeof(tt)

    if tt < bb
        tol = T(8) * eps(T) * max(abs(tt), abs(bb), one(T))
        bb - tt <= tol || throw(DomainError((total, base), "Expected total ≥ base in the direct generator coordinate.",))
        return zero(T)
    end

    return tt - bb
end

@inline _arch_hfunc(G::_DirectGeneratorCoordinate, target::Real, base::Real,) = _arch_hfunc_coordinate(G, target, base,)

@inline _arch_hinv(G::_DirectGeneratorCoordinate, q::Real, base::Real,) = _arch_hinv_coordinate(G, q, base,)

function _inv_ϕ¹(G::_DirectGeneratorCoordinate, y::Real,)
    m = _negative_derivative_magnitude(y,"BB8/BB10",)
    T = typeof(m)

    iszero(m) && return T(Inf)

    # Both families have finite |ϕ′(0)|, so m = Inf must be checked
    # against the admissible derivative range.
    return _arch_inverse_logderivative(G, log(m),)
end

function _inv_ϕ¹(G::_Log1pCoordinateGenerator, y::Real)
    m = _negative_derivative_magnitude(y, "BB2/BB3")
    T = typeof(m)
    iszero(m) && return T(Inf)

    L = _arch_inverse_logderivative(G, log(m))
    return isinf(L) ? L : expm1(L)
end