# ---------------------------------------------------------------------
# Bivariate extreme-value conditional primitives
#
# For x = -log(u), y = -log(v), s = x + y and t = x/s,
#
#     C(u,v) = exp(-sA(t)),
#     h₁(u,v) = C(u,v) [A(t) - tA′(t)] / v,
#     h₂(u,v) = C(u,v) [A(t) + (1-t)A′(t)] / u.
#
# Smooth families share the log-domain h-functions and a safeguarded
# Newton-bisection inverse in the unconstrained logit of the Pickands
# coordinate. LogTail reuses
# the analytic Gumbel inverse. Piecewise/singular tails delegate to the
# conditional distortions implemented in Copulas.jl; the generalized-quantile
# wrapper only repairs floating-point branch ties at atoms.
# ---------------------------------------------------------------------

const _EVDistortionTail = Union{
    Copulas.CuadrasAugeTail,
    Copulas.MOTail,
    Copulas.BC2Tail,
    Copulas.EmpiricalEVTail
}

@inline function _ev_conditional(C::Copulas.ExtremeValueCopula{2}, base::Real, dim::Int8)
    return Copulas.BivEVDistortion(C.tail, dim, base)
end

@inline function _ev_clean_factor(B::T, scale::T) where {T<:AbstractFloat}
    isnan(B) && throw(DomainError(B, "A Pickands conditional factor cannot be NaN."))
    tol = T(32)*eps(T)*max(one(T), abs(scale))
    B < -tol && throw(DomainError(B, "A Pickands conditional factor must be non-negative."))
    return max(B, zero(T))
end

@inline function _ev_clean_factor(B::Real, scale::Real)
    isnan(B) && throw(DomainError(B, "A Pickands conditional factor cannot be NaN."))
    B < zero(B) && throw(DomainError(B, "A Pickands conditional factor must be non-negative."))
    return B
end

@inline function _ev_logfactor(B::Real)
    iszero(B) && return oftype(B, -Inf)
    return log(B)
end

@inline function _ev_pickands_factors(tail, t::Real, A::Real, dA::Real)
    omt = one(t) - t
    scale = abs(A) + abs(t*dA) + abs(omt*dA)
    B1 = _ev_clean_factor(A - t*dA, scale)
    B2 = _ev_clean_factor(A + omt*dA, scale)
    return B1, B2
end

@inline function _ev_pickands_factors(tail::Copulas.GalambosTail, t::Real, A::Real, dA::Real)
    θ = tail.θ + zero(t)
    z = θ*(log(t) - log1p(-t))
    p = (θ + one(θ))/θ
    B1 = -expm1(-p*LogExpFunctions.log1pexp(-z))
    B2 = -expm1(-p*LogExpFunctions.log1pexp(z))
    return B1, B2
end

@inline function _ev_pickands_factors(tail::Copulas.HuslerReissTail, t::Real, A::Real, dA::Real)
    θ = tail.θ + zero(t)
    hθ = θ/(one(θ) + one(θ))
    z = log(t) - log1p(-t)
    a1 = inv(θ) + hθ*z
    a2 = inv(θ) - hθ*z
    N = Distributions.Normal()
    B1 = Distributions.cdf(N, a2)
    B2 = Distributions.cdf(N, a1)
    return B1, B2
end

@inline function _ev_pickands_factors(tail::Copulas.MixedTail, t::Real, A::Real, dA::Real)
    θ = tail.θ + zero(t)
    omt = one(t) - t
    B1 = one(t) - θ*t*t
    B2 = one(t) - θ*omt*omt
    return B1, B2
end

@inline function _ev_pickands_factors(tail::Copulas.AsymMixedTail, t::Real, A::Real, dA::Real)
    θ1, θ2 = tail.θ₁ + zero(t), tail.θ₂ + zero(t)
    omt = one(t) - t
    B1 = one(t) - θ1*t*t - 2θ2*t*t*t
    B2 = one(t) - (θ1 + 3θ2)*omt*omt + 2θ2*omt*omt*omt
    return B1, B2
end

@inline function _ev_A_dA(tail, t::Real)
    A = Copulas.A(tail, t)
    dA = Copulas.dA(tail, t)
    B1, B2 = _ev_pickands_factors(tail, t, A, dA)
    return A, dA, B1, B2
end

# Copulas.jl's generic fused helper clamps the Pickands coordinate to
# [1e-12, 1-1e-12]. Polynomial tails can be evaluated exactly beyond that
# artificial Float64-scale boundary, which is essential for BigFloat inverses.
@inline function _ev_A_dA(tail::Copulas.MixedTail, t::Real)
    θ = tail.θ + zero(t)
    A = one(t) - θ*t + θ*t*t
    dA = θ*(2t - one(t))
    B1, B2 = _ev_pickands_factors(tail, t, A, dA)
    return A, dA, B1, B2
end

@inline function _ev_A_dA(tail::Copulas.AsymMixedTail, t::Real)
    θ1, θ2 = tail.θ₁ + zero(t), tail.θ₂ + zero(t)
    A = one(t) - (θ1 + θ2)*t + θ1*t*t + θ2*t*t*t
    dA = -(θ1 + θ2) + 2θ1*t + 3θ2*t*t
    B1, B2 = _ev_pickands_factors(tail, t, A, dA)
    return A, dA, B1, B2
end

# Centralize the use of Copulas.jl's fused Pickands derivative fast path.
# Polynomial tails override it to avoid Copulas.jl's fixed 1e-12 clamp.
@inline _ev_A_dA_d2A(tail, t::Real) = Copulas._A_dA_d²A(tail, t)

@inline function _ev_A_dA_d2A(tail::Copulas.MixedTail, t::Real)
    θ = tail.θ + zero(t)
    A = one(t) - θ*t + θ*t*t
    dA = θ*(2t - one(t))
    return A, dA, 2θ
end

@inline function _ev_A_dA_d2A(tail::Copulas.AsymMixedTail, t::Real)
    θ1, θ2 = tail.θ₁ + zero(t), tail.θ₂ + zero(t)
    A = one(t) - (θ1 + θ2)*t + θ1*t*t + θ2*t*t*t
    dA = -(θ1 + θ2) + 2θ1*t + 3θ2*t*t
    return A, dA, 2θ1 + 6θ2*t
end

@inline function _ev_loghfuncs(C::Copulas.ExtremeValueCopula{2}, u::Real, v::Real)
    x, y = -log(u), -log(v)
    s = x + y
    t = x/s
    A, _, B1, B2 = _ev_A_dA(C.tail, t)
    logC = -s*A
    return logC + y + _ev_logfactor(B1), logC + x + _ev_logfactor(B2)
end

@inline function _ev_hfunc1(C::Copulas.ExtremeValueCopula{2}, u::Real, v::Real)
    logh1, _ = _ev_loghfuncs(C, u, v)
    return exp(logh1)
end

@inline function _ev_hfunc2(C::Copulas.ExtremeValueCopula{2}, u::Real, v::Real)
    _, logh2 = _ev_loghfuncs(C, u, v)
    return exp(logh2)
end

@inline function _ev_hfunc1(C::Copulas.ExtremeValueCopula{2,TT}, u::Real, v::Real) where {TT<:_EVDistortionTail}
    return Distributions.cdf(_ev_conditional(C, v, Int8(2)), u)
end

@inline function _ev_hfunc2(C::Copulas.ExtremeValueCopula{2,TT}, u::Real, v::Real) where {TT<:_EVDistortionTail}
    return Distributions.cdf(_ev_conditional(C, u, Int8(1)), v)
end

function hfunc1(C::Copulas.ExtremeValueCopula{2}, uv::Tuple{<:Real,<:Real})
    u, v = _clp(uv[1]), _clp(uv[2])
    return _clp(_ev_hfunc1(C, u, v))
end

function hfunc2(C::Copulas.ExtremeValueCopula{2}, uv::Tuple{<:Real,<:Real})
    u, v = _clp(uv[1]), _clp(uv[2])
    return _clp(_ev_hfunc2(C, u, v))
end

@inline function _ev_promote_inputs(C::Copulas.ExtremeValueCopula{2}, q::Real, base::Real)
    vals = promote(float(q), float(base), values(Distributions.params(C.tail))...)
    return vals[1], vals[2]
end

@inline _ev_t_from_logit(z::Real) = _clp(LogExpFunctions.logistic(z))

# Safeguarded Newton-bisection solver for a strictly decreasing equation in
# the unconstrained logit coordinate z ∈ ℝ. The callback returns (f, f′),
# avoiding duplicate evaluations of A, A′ and A′′ inside each iteration.
function _ev_solve_logit(fdf, x0::T) where {T<:AbstractFloat}
    lo, hi = x0 - one(T), x0 + one(T)
    flo, _ = fdf(lo)
    fhi, _ = fdf(hi)

    for _ in 1:128
        flo >= zero(T) && break
        hi, fhi = lo, flo
        lo = 2lo - one(T)
        flo, _ = fdf(lo)
    end

    for _ in 1:128
        fhi <= zero(T) && break
        lo, flo = hi, fhi
        hi = 2hi + one(T)
        fhi, _ = fdf(hi)
    end

    flo >= zero(T) >= fhi || throw(DomainError(x0, "Could not bracket the extreme-value conditional inverse."))

    x = clamp(x0, lo, hi)
    fx, _ = fdf(x)
    isnan(fx) && throw(DomainError(x, "The extreme-value inverse equation evaluated to NaN."))
    best_x, best_absf = x, abs(fx)

    maxiter = max(96, precision(x0) + 32)
    for _ in 1:maxiter
        fx, dfx = fdf(x)
        isnan(fx) && throw(DomainError(x, "The extreme-value inverse equation evaluated to NaN."))
        iszero(fx) && return x

        if abs(fx) < best_absf
            best_x, best_absf = x, abs(fx)
        end

        candidate = if isfinite(fx) && isfinite(dfx) && !iszero(dfx)
            x - fx/dfx
        else
            lo + (hi - lo)/T(2)
        end

        (!isfinite(candidate) || !(lo < candidate < hi)) && (candidate = lo + (hi - lo)/T(2))

        # A rejected Newton step may be replaced by the current midpoint,
        # which can equal x even when the root is still far away. Therefore
        # convergence is determined from the residual or the bracket width,
        # never from candidate - x alone.
        fc, _ = fdf(candidate)
        isnan(fc) && throw(DomainError(candidate, "The extreme-value inverse equation evaluated to NaN."))
        iszero(fc) && return candidate

        if abs(fc) < best_absf
            best_x, best_absf = candidate, abs(fc)
        end

        if fc > zero(T)
            lo = candidate
        else
            hi = candidate
        end

        abs(hi - lo) <= T(16)*eps(T)*max(one(T), abs(candidate)) && return best_x
        x = candidate
    end

    return best_x
end

@inline function _ev_g1(C::Copulas.ExtremeValueCopula{2}, t::Real, logv::Real, logq::Real)
    A, dA, d2A = _ev_A_dA_d2A(C.tail, t)
    omt = one(t) - t
    B1, B2 = _ev_pickands_factors(C.tail, t, A, dA)
    g = logv*((A - omt)/omt) + _ev_logfactor(B1) - logq
    dg = iszero(B1) ? oftype(g, -Inf) : logv*B2/(omt*omt) - t*d2A/B1
    return g, dg
end

@inline function _ev_g2(C::Copulas.ExtremeValueCopula{2}, t::Real, logu::Real, logq::Real)
    A, dA, d2A = _ev_A_dA_d2A(C.tail, t)
    omt = one(t) - t
    B1, B2 = _ev_pickands_factors(C.tail, t, A, dA)
    g = logu*((A - t)/t) + _ev_logfactor(B2) - logq
    dg = iszero(B2) ? oftype(g, Inf) : -logu*B1/(t*t) + omt*d2A/B2
    return g, dg
end

@inline function _ev_g1_logit(C::Copulas.ExtremeValueCopula{2}, z::Real, logv::Real, logq::Real)
    rawt = LogExpFunctions.logistic(z)
    iszero(rawt) && return -logq, zero(z)
    isone(rawt) && return oftype(z, -Inf), zero(z)

    t = _clp(rawt)
    g, dgdt = _ev_g1(C, t, logv, logq)
    return g, dgdt*t*(one(t) - t)
end

@inline function _ev_neg_g2_logit(C::Copulas.ExtremeValueCopula{2}, z::Real, logu::Real, logq::Real)
    rawt = LogExpFunctions.logistic(z)
    iszero(rawt) && return oftype(z, Inf), zero(z)
    isone(rawt) && return logq, zero(z)

    t = _clp(rawt)
    g, dgdt = _ev_g2(C, t, logu, logq)
    return -g, -dgdt*t*(one(t) - t)
end

function _ev_hinv1_numeric(C::Copulas.ExtremeValueCopula{2}, q::Real, v::Real)
    qq, vv = _ev_promote_inputs(C, q, v)
    T = typeof(qq)
    T <: AbstractFloat || throw(ArgumentError("Numerical extreme-value inversion requires floating-point inputs."))

    logq, logv = log(qq), log(vv)
    z = _ev_solve_logit(x -> _ev_g1_logit(C, x, logv, logq), zero(T))
    ratio = exp(z)
    return isinf(ratio) ? zero(T) : exp(logv*ratio)
end

function _ev_hinv2_numeric(C::Copulas.ExtremeValueCopula{2}, q::Real, u::Real)
    qq, uu = _ev_promote_inputs(C, q, u)
    T = typeof(qq)
    T <: AbstractFloat || throw(ArgumentError("Numerical extreme-value inversion requires floating-point inputs."))

    logq, logu = log(qq), log(uu)
    z = _ev_solve_logit(x -> _ev_neg_g2_logit(C, x, logu, logq), zero(T))
    ratio = exp(-z)
    return isinf(ratio) ? zero(T) : exp(logu*ratio)
end

function _ev_generalized_quantile(D, q::Real)
    z = float(Distributions.quantile(D, q))
    for _ in 1:256
        Distributions.cdf(D, z) >= q && return z
        z < one(z) || return z
        z = nextfloat(z)
    end
    throw(ErrorException("Copulas.jl returned a conditional quantile below the requested probability."))
end

@inline function _ev_hinv1(C::Copulas.ExtremeValueCopula{2,TT}, q::Real, v::Real) where {TT<:_EVDistortionTail}
    return _ev_generalized_quantile(_ev_conditional(C, v, Int8(2)), q)
end

@inline function _ev_hinv2(C::Copulas.ExtremeValueCopula{2,TT}, q::Real, u::Real) where {TT<:_EVDistortionTail}
    return _ev_generalized_quantile(_ev_conditional(C, u, Int8(1)), q)
end

@inline function _ev_hinv1(C::Copulas.ExtremeValueCopula{2,TT}, q::Real, v::Real) where {TT<:Copulas.LogTail}
    return _arch_hinv(Copulas.GumbelGenerator(C.tail.θ), q, v)
end

@inline function _ev_hinv2(C::Copulas.ExtremeValueCopula{2,TT}, q::Real, u::Real) where {TT<:Copulas.LogTail}
    return _arch_hinv(Copulas.GumbelGenerator(C.tail.θ), q, u)
end

@inline _ev_hinv1(C::Copulas.ExtremeValueCopula{2}, q::Real, v::Real) = _ev_hinv1_numeric(C, q, v)
@inline _ev_hinv2(C::Copulas.ExtremeValueCopula{2}, q::Real, u::Real) = _ev_hinv2_numeric(C, q, u)

function hinv1(C::Copulas.ExtremeValueCopula{2}, q::Real, v::Real)
    q, v = _clp(q), _clp(v)
    return _clp(_ev_hinv1(C, q, v))
end

function hinv2(C::Copulas.ExtremeValueCopula{2}, q::Real, u::Real)
    q, u = _clp(q), _clp(u)
    return _clp(_ev_hinv2(C, q, u))
end
