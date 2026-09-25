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

const _EVFastSmoothTail = Union{
    Copulas.GalambosTail,
    Copulas.HuslerReissTail,
    Copulas.MixedTail,
    Copulas.AsymLogTail,
    Copulas.AsymGalambosTail,
    Copulas.AsymMixedTail,
    Copulas.tEVTail,
}

@inline function _ev_conditional(C::Copulas.ExtremeValueCopula{2}, base::Real, dim::Int8,)
    return Copulas.condition(C, Int(dim), base)
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

@inline function _ev_pickands_factors(C, t::Real, A::Real, dA::Real)
    omt = one(t) - t
    scale = abs(A) + abs(t*dA) + abs(omt*dA)
    B1 = _ev_clean_factor(A - t*dA, scale)
    B2 = _ev_clean_factor(A + omt*dA, scale)
    return B1, B2
end

@inline function _ev_pickands_factors(C::Copulas.ExtremeValueCopula{2,<:Copulas.GalambosTail}, t::Real, A::Real, dA::Real,)
    θ = _vine_params(C).θ + zero(t)
    iszero(θ) && return one(t), one(t)
    z = θ*(log(t) - log1p(-t))
    p = (θ + one(θ))/θ
    B1 = -expm1(-p*LogExpFunctions.log1pexp(-z))
    B2 = -expm1(-p*LogExpFunctions.log1pexp(z))
    return B1, B2
end

@inline function _ev_pickands_factors(C::Copulas.ExtremeValueCopula{2,<:Copulas.HuslerReissTail}, t::Real, A::Real, dA::Real,)
    p = _vine_params(C)
    θ = p.θ + zero(t)
    iszero(θ) && return one(t), one(t)
    hθ = θ/(one(θ) + one(θ))
    z = log(t) - log1p(-t)
    a1 = inv(θ) + hθ*z
    a2 = inv(θ) - hθ*z
    N = Distributions.Normal()
    B1 = Distributions.cdf(N, a2)
    B2 = Distributions.cdf(N, a1)
    return B1, B2
end

@inline function _ev_pickands_factors(C::Copulas.ExtremeValueCopula{2,<:Copulas.MixedTail}, t::Real, A::Real, dA::Real,)
    θ = _vine_params(C).θ + zero(t)
    omt = one(t) - t
    B1 = one(t) - θ*t*t
    B2 = one(t) - θ*omt*omt
    return B1, B2
end

@inline function _ev_pickands_factors(C::Copulas.ExtremeValueCopula{2,<:Copulas.AsymMixedTail}, t::Real, A::Real, dA::Real,)
    p = _vine_params(C)
    θ1 = p.θ₁ + zero(t)
    θ2 = p.θ₂ + zero(t)
    omt = one(t) - t
    B1 = one(t) - θ1*t*t - 2θ2*t*t*t
    B2 = one(t) - (θ1 + 3θ2)*omt*omt + 2θ2*omt*omt*omt
    return B1, B2
end

# ---------------------------------------------------------------------
# A, A' and conditional factors from public copula parameters.
# ---------------------------------------------------------------------

@inline function _ev_tev_parameters(C::Copulas.ExtremeValueCopula{2,<:Copulas.tEVTail}, t::Real,)
    p = _vine_params(C)
    ν = p.ν + zero(t)
    ρ = (hasproperty(p, :ρ) ? p.ρ : p.R[1, 2]) + zero(t)
    return ν, ρ
end

@inline function _ev_A_dA(C::Copulas.ExtremeValueCopula{2,<:Copulas.GalambosTail}, t::Real,)
    θ = _vine_params(C).θ + zero(t)
    if iszero(θ)
        A = one(t)
        dA = zero(t)
        return A, dA, one(t), one(t)
    end
    a = t
    b = one(t) - t
    L1 = -θ*log(a)
    L2 = -θ*log(b)
    M = max(L1, L2)
    E1 = exp(L1 - M)
    E2 = exp(L2 - M)
    S = E1 + E2
    B = exp(-M/θ) * S^(-inv(θ))
    A = one(t) - B
    D = E2/b - E1/a
    dA = B*(D/S)
    B1, B2 = _ev_pickands_factors(C, t, A, dA)
    return A, dA, B1, B2
end

@inline function _ev_A_dA(C::Copulas.ExtremeValueCopula{2,<:Copulas.HuslerReissTail}, t::Real,)
    p = _vine_params(C)
    θ = p.θ + zero(t)
    if iszero(θ)
        A = one(t)
        dA = zero(t)
        return A, dA, one(t), one(t)
    end
    omt = one(t) - t
    z = log(t) - log1p(-t)
    hθ = θ/(one(θ) + one(θ))
    a1 = inv(θ) + hθ*z
    a2 = inv(θ) - hθ*z
    N = Distributions.Normal()
    F1 = Distributions.cdf(N, a1)
    F2 = Distributions.cdf(N, a2)
    A = t*F1 + omt*F2
    dA = F1 - F2
    B1, B2 = _ev_pickands_factors(C, t, A, dA)
    return A, dA, B1, B2
end

@inline function _ev_A_dA(C::Copulas.ExtremeValueCopula{2,<:Copulas.MixedTail}, t::Real,)
    θ = _vine_params(C).θ + zero(t)
    A = one(t) - θ*t + θ*t*t
    dA = θ*(2t - one(t))
    B1, B2 = _ev_pickands_factors(C, t, A, dA)
    return A, dA, B1, B2
end

@inline function _ev_A_dA(C::Copulas.ExtremeValueCopula{2,<:Copulas.AsymLogTail}, t::Real,)
    p = _vine_params(C)
    α = p.α + zero(t)
    θ1 = p.θ₁ + zero(t)
    θ2 = p.θ₂ + zero(t)
    a = t
    b = one(t) - t
    r1 = (θ1*b)^α
    r2 = (θ2*a)^α
    R = r1 + r2
    root = R^inv(α)
    D = r2/a - r1/b
    A = root + (θ1 - θ2)*a + one(t) - θ1
    dA = R^(inv(α) - one(α))*D + θ1 - θ2
    B1, B2 = _ev_pickands_factors(C, t, A, dA)
    return A, dA, B1, B2
end

@inline function _ev_A_dA(C::Copulas.ExtremeValueCopula{2,<:Copulas.AsymGalambosTail}, t::Real,)
    p = _vine_params(C)
    α = p.α + zero(t)
    θ1 = p.θ₁ + zero(t)
    θ2 = p.θ₂ + zero(t)
    a = t
    b = one(t) - t
    # Let
    #   B = ((θ1*a)^(-α) + (θ2*b)^(-α))^(-1/α),
    # so A(t) = 1 - B.
    # Evaluate the negative powers through log-sum-exp to avoid
    # overflow/underflow in the tails.
    x1 = -α*log(θ1*a)
    x2 = -α*log(θ2*b)
    logsum = LogExpFunctions.logaddexp(x1, x2)
    w1 = exp(x1 - logsum)
    w2 = exp(x2 - logsum)
    B = exp(-logsum/α)
    A = one(t) - B
    g = w2/b - w1/a
    dA = B*g
    B1, B2 = _ev_pickands_factors(C, t, A, dA)
    return A, dA, B1, B2
end

@inline function _ev_A_dA(C::Copulas.ExtremeValueCopula{2,<:Copulas.tEVTail}, t::Real,)
    ν, ρ = _ev_tev_parameters(C, t)
    α = inv(ν)
    c = sqrt((one(ν) + ν) / (one(ρ) - ρ*ρ))
    a = t
    b = one(t) - t
    log_r = log(a) - log1p(-a)
    log_s = -log_r
    rα = exp(α*log_r)
    sα = exp(α*log_s)
    z1 = c*(rα - ρ)
    z2 = c*(sα - ρ)
    D = Distributions.TDist(ν + one(ν))
    F1 = Distributions.cdf(D, z1)
    F2 = Distributions.cdf(D, z2)
    A = a*F1 + b*F2
    # The density terms in d/dt[t F1 + (1-t) F2] cancel exactly.
    dA = F1 - F2
    # Consequently the two conditional Pickands factors simplify exactly.
    B1 = F2
    B2 = F1
    return A, dA, B1, B2
end

@inline function _ev_A_dA(C::Copulas.ExtremeValueCopula{2,<:Copulas.AsymMixedTail}, t::Real,)
    p = _vine_params(C)
    θ1 = p.θ₁ + zero(t)
    θ2 = p.θ₂ + zero(t)
    A = one(t) - (θ1 + θ2)*t + θ1*t*t + θ2*t*t*t
    dA = -(θ1 + θ2) + 2θ1*t + 3θ2*t*t
    B1, B2 = _ev_pickands_factors(C, t, A, dA)
    return A, dA, B1, B2
end

# ---------------------------------------------------------------------
# Fused A, A', A'' kernels used by the safeguarded inverse.
# ---------------------------------------------------------------------

@inline function _ev_A_dA_d2A(C::Copulas.ExtremeValueCopula{2,<:Copulas.GalambosTail}, t::Real,)
    θ = _vine_params(C).θ + zero(t)
    if iszero(θ)
        return one(t), zero(t), zero(t)
    end
    a = t
    b = one(t) - t
    L1 = -θ*log(a)
    L2 = -θ*log(b)
    M = max(L1, L2)
    E1 = exp(L1 - M)
    E2 = exp(L2 - M)
    S = E1 + E2
    B = exp(-M/θ) * S^(-inv(θ))
    A = one(t) - B
    inva = inv(a)
    invb = inv(b)
    D = E2*invb - E1*inva
    dA = B*(D/S)
    term1 = (E2*invb^2 + E1*inva^2)/S
    term2 = (D/S)^2
    d2A = (one(θ) + θ)*B*(term1 - term2)
    return A, dA, d2A
end

@inline function _ev_A_dA_d2A(C::Copulas.ExtremeValueCopula{2,<:Copulas.HuslerReissTail}, t::Real,)
    p = _vine_params(C)
    θ = p.θ + zero(t)
    if iszero(θ)
        return one(t), zero(t), zero(t)
    end
    omt = one(t) - t
    z = log(t) - log1p(-t)
    hθ = θ/(one(θ) + one(θ))
    a1 = inv(θ) + hθ*z
    a2 = inv(θ) - hθ*z
    N = Distributions.Normal()
    F1 = Distributions.cdf(N, a1)
    F2 = Distributions.cdf(N, a2)
    A = t*F1 + omt*F2
    dA = F1 - F2
    ϕ1 = Distributions.pdf(N, a1)
    ϕ2 = Distributions.pdf(N, a2)
    d2A = θ*(ϕ1 + ϕ2)/(2t*omt)
    return A, dA, d2A
end

@inline function _ev_A_dA_d2A(C::Copulas.ExtremeValueCopula{2,<:Copulas.MixedTail}, t::Real,)
    θ = _vine_params(C).θ + zero(t)
    A = one(t) - θ*t + θ*t*t
    dA = θ*(2t - one(t))
    d2A = 2θ
    return A, dA, d2A
end

@inline function _ev_A_dA_d2A(C::Copulas.ExtremeValueCopula{2,<:Copulas.AsymLogTail}, t::Real,)
    p = _vine_params(C)
    α = p.α + zero(t)
    θ1 = p.θ₁ + zero(t)
    θ2 = p.θ₂ + zero(t)
    a = t
    b = one(t) - t
    r1 = (θ1*b)^α
    r2 = (θ2*a)^α
    R = r1 + r2
    root = R^inv(α)
    D = r2/a - r1/b
    A = root + (θ1 - θ2)*a + one(t) - θ1
    dA = R^(inv(α) - one(α))*D + θ1 - θ2
    # Equivalent to
    #   (α-1) R^(1/α-2) (R E - D²),
    # but using the exact simplification
    #   R E - D² = r1*r2 / (a² b²)
    # avoids cancellation.
    d2A = (α - one(α)) * R^(inv(α) - (one(α) + one(α))) * r1*r2/(a*a*b*b)
    return A, dA, d2A
end

@inline function _ev_A_dA_d2A(C::Copulas.ExtremeValueCopula{2,<:Copulas.AsymGalambosTail}, t::Real,)
    p = _vine_params(C)
    α = p.α + zero(t)
    θ1 = p.θ₁ + zero(t)
    θ2 = p.θ₂ + zero(t)
    a = t
    b = one(t) - t
    x1 = -α*log(θ1*a)
    x2 = -α*log(θ2*b)
    logsum = LogExpFunctions.logaddexp(x1, x2)
    w1 = exp(x1 - logsum)
    w2 = exp(x2 - logsum)
    B = exp(-logsum/α)
    A = one(t) - B
    g = w2/b - w1/a
    dA = B*g
    # Copulas.jl writes this as
    #   (1+α)B[w2/b² + w1/a² - (w2/b - w1/a)²].
    # Since w1+w2=1, the bracket simplifies exactly to
    #   w1*w2/(a²*b²),
    # avoiding cancellation near the boundaries.
    d2A = (one(α) + α) * B * w1*w2/(a*a*b*b)
    return A, dA, d2A
end

@inline function _ev_A_dA_d2A(C::Copulas.ExtremeValueCopula{2,<:Copulas.tEVTail}, t::Real,)
    ν, ρ = _ev_tev_parameters(C, t)
    α = inv(ν)
    c = sqrt((one(ν) + ν) / (one(ρ) - ρ*ρ))
    a = t
    b = one(t) - t
    log_r = log(a) - log1p(-a)
    log_s = -log_r
    rα = exp(α*log_r)
    sα = exp(α*log_s)
    z1 = c*(rα - ρ)
    z2 = c*(sα - ρ)
    D = Distributions.TDist(ν + one(ν))
    F1 = Distributions.cdf(D, z1)
    F2 = Distributions.cdf(D, z2)
    A = a*F1 + b*F2
    dA = F1 - F2
    # Since
    #   a*f1*z1' + b*f2*z2' = 0,
    # we may evaluate
    #   A'' = f1*z1' - f2*z2'
    # from whichever side is numerically better.  Near t=0 use z1;
    # near t=1 use z2.
    if a <= b
        rαm1 = exp((α - one(α))*log_r)
        dz1 = c*α*rαm1/(b*b)
        f1 = Distributions.pdf(D, z1)
        d2A = f1*dz1/b
    else
        sαm1 = exp((α - one(α))*log_s)
        dz2 = -c*α*sαm1/(a*a)
        f2 = Distributions.pdf(D, z2)
        d2A = -f2*dz2/a
    end
    return A, dA, d2A
end

@inline function _ev_A_dA_d2A(C::Copulas.ExtremeValueCopula{2,<:Copulas.AsymMixedTail}, t::Real,)
    p = _vine_params(C)
    θ1 = p.θ₁ + zero(t)
    θ2 = p.θ₂ + zero(t)
    A = one(t) - (θ1 + θ2)*t + θ1*t*t + θ2*t*t*t
    dA = -(θ1 + θ2) + 2θ1*t + 3θ2*t*t
    d2A = 2θ1 + 6θ2*t
    return A, dA, d2A
end

# Only use the local smooth kernels away from singular/limit parameter values.
@inline _ev_fast_eligible(::Copulas.ExtremeValueCopula{2}) = false
@inline function _ev_fast_eligible(C::Copulas.ExtremeValueCopula{2,<:Copulas.GalambosTail},)
    θ = _vine_params(C).θ
    return isfinite(θ) && θ > zero(θ)
end

@inline function _ev_fast_eligible(C::Copulas.ExtremeValueCopula{2,<:Copulas.HuslerReissTail},)
    p = _vine_params(C)
    hasproperty(p, :θ) || return false
    θ = p.θ
    return isfinite(θ) && θ > zero(θ)
end

@inline _ev_fast_eligible(::Copulas.ExtremeValueCopula{2,<:Copulas.MixedTail},) = true
@inline function _ev_fast_eligible(C::Copulas.ExtremeValueCopula{2,<:Copulas.AsymGalambosTail},)
    p = _vine_params(C)
    α = p.α
    θ1 = p.θ₁
    θ2 = p.θ₂
    return isfinite(α) &&
           isfinite(θ1) &&
           isfinite(θ2) &&
           α > zero(α) &&
           θ1 > zero(θ1) &&
           θ2 > zero(θ2)
end

@inline function _ev_fast_eligible(C::Copulas.ExtremeValueCopula{2,<:Copulas.AsymLogTail},)
    p = _vine_params(C)
    α = p.α
    θ1 = p.θ₁
    θ2 = p.θ₂
    return isfinite(α) &&
           isfinite(θ1) &&
           isfinite(θ2) &&
           α > one(α) &&
           θ1 > zero(θ1) &&
           θ2 > zero(θ2)
end

@inline function _ev_fast_eligible(C::Copulas.ExtremeValueCopula{2,<:Copulas.tEVTail},)
    p = _vine_params(C)
    ν = p.ν
    ρ = hasproperty(p, :ρ) ? p.ρ : p.R[1, 2]
    return isfinite(ν) &&
           isfinite(ρ) &&
           ν > zero(ν) &&
           -one(ρ) < ρ < one(ρ)
end

@inline _ev_fast_eligible(::Copulas.ExtremeValueCopula{2,<:Copulas.AsymMixedTail},) = true
@inline function _ev_loghfuncs(C::Copulas.ExtremeValueCopula{2}, u::Real, v::Real)
    x, y = -log(u), -log(v)
    s = x + y
    t = x/s
    A, _, B1, B2 = _ev_A_dA(C, t)
    logC = -s*A
    return logC + y + _ev_logfactor(B1), logC + x + _ev_logfactor(B2)
end

@inline _ev_hfunc1(C::Copulas.ExtremeValueCopula{2}, u::Real, v::Real,) = Distributions.cdf(_ev_conditional(C, v, Int8(2)), u)
@inline _ev_hfunc2(C::Copulas.ExtremeValueCopula{2}, u::Real, v::Real,) = Distributions.cdf(_ev_conditional(C, u, Int8(1)), v)

@inline function _ev_hfunc1(C::Copulas.ExtremeValueCopula{2,TT}, u::Real, v::Real,) where {TT<:_EVFastSmoothTail}
    _ev_fast_eligible(C) || return Distributions.cdf(_ev_conditional(C, v, Int8(2)), u)
    logh1, _ = _ev_loghfuncs(C, u, v)
    return exp(logh1)
end

@inline function _ev_hfunc2(C::Copulas.ExtremeValueCopula{2,TT}, u::Real, v::Real,) where {TT<:_EVFastSmoothTail}
    _ev_fast_eligible(C) || return Distributions.cdf(_ev_conditional(C, u, Int8(1)), v)
    _, logh2 = _ev_loghfuncs(C, u, v)
    return exp(logh2)
end

# Smooth extreme-value families can produce both h-functions from one Pickands
# evaluation. Singular/distortion tails retain their Copulas.jl conditional
# path because atoms require generalized conditional distributions.
@inline function _pair_hfuncs(C::Copulas.ExtremeValueCopula{2}, u::Real, v::Real,)
    uu, vv = _clp(u), _clp(v)
    return _clp(_ev_hfunc1(C, uu, vv)), _clp(_ev_hfunc2(C, uu, vv))
end

@inline function _pair_hfuncs(C::Copulas.ExtremeValueCopula{2,TT}, u::Real, v::Real,) where {TT<:_EVFastSmoothTail}
    uu, vv = _clp(u), _clp(v)
    if !_ev_fast_eligible(C)
        return _clp(_ev_hfunc1(C, uu, vv)), _clp(_ev_hfunc2(C, uu, vv))
    end
    logh1, logh2 = _ev_loghfuncs(C, uu, vv)
    return _clp(exp(logh1)), _clp(exp(logh2))
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
    vals = promote(float(q), float(base), values(_vine_params(C))...)
    return vals[1], vals[2]
end

@inline function _ev_promote_inputs(C::Copulas.ExtremeValueCopula{2,<:Copulas.tEVTail}, q::Real, base::Real,)
    p = _vine_params(C)
    ρ = hasproperty(p, :ρ) ? p.ρ : p.R[1, 2]
    vals = promote(float(q), float(base), float(p.ν), float(ρ))
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
    A, dA, d2A = _ev_A_dA_d2A(C, t)
    omt = one(t) - t
    B1, B2 = _ev_pickands_factors(C, t, A, dA)
    g = logv*((A - omt)/omt) + _ev_logfactor(B1) - logq
    dg = iszero(B1) ? oftype(g, -Inf) : logv*B2/(omt*omt) - t*d2A/B1
    return g, dg
end

@inline function _ev_g2(C::Copulas.ExtremeValueCopula{2}, t::Real, logu::Real, logq::Real)
    A, dA, d2A = _ev_A_dA_d2A(C, t)
    omt = one(t) - t
    B1, B2 = _ev_pickands_factors(C, t, A, dA)
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

# LogTail is exactly the bivariate Gumbel-Hougaard copula.  Keep its
# conditional inverse analytic, but derive it directly from the public
# copula parameter instead of going through Copulas.jl generator internals.
#
# With y = -log(base), b = θ - 1 and r = (x^θ + y^θ)^(1/θ),
#     q = exp(y-r) * (y/r)^b,
# hence
#     r + b*log(r) = y + b*log(y) - log(q).
# This equation is inverted with the principal Lambert-W branch.
@inline _ev_log_hinv(C::Copulas.ExtremeValueCopula{2,<:Copulas.LogTail}, q::Real, base::Real,) = _gumbel_hinv_from_theta(_vine_params(C).θ, q, base)
@inline function _ev_hinv1(C::Copulas.ExtremeValueCopula{2,<:Copulas.LogTail}, q::Real, v::Real,)
    θ = _vine_params(C).θ
    if isfinite(θ)
        return _ev_log_hinv(C, q, v)
    end
    return _ev_generalized_quantile(_ev_conditional(C, v, Int8(2)), q,)
end

@inline function _ev_hinv2(C::Copulas.ExtremeValueCopula{2,<:Copulas.LogTail}, q::Real, u::Real,)
    θ = _vine_params(C).θ
    if isfinite(θ)
        return _ev_log_hinv(C, q, u)
    end
    return _ev_generalized_quantile(_ev_conditional(C, u, Int8(1)), q,)
end

@inline _ev_hinv1(C::Copulas.ExtremeValueCopula{2,TT}, q::Real, v::Real) where {TT<:_EVDistortionTail} = _ev_generalized_quantile(_ev_conditional(C, v, Int8(2)), q)
@inline _ev_hinv2(C::Copulas.ExtremeValueCopula{2,TT}, q::Real, u::Real) where {TT<:_EVDistortionTail} = _ev_generalized_quantile(_ev_conditional(C, u, Int8(1)), q)
@inline _ev_hinv1(C::Copulas.ExtremeValueCopula{2}, q::Real, v::Real,) = _ev_generalized_quantile(_ev_conditional(C, v, Int8(2)), q)
@inline _ev_hinv2(C::Copulas.ExtremeValueCopula{2}, q::Real, u::Real,) = _ev_generalized_quantile(_ev_conditional(C, u, Int8(1)), q)

@inline function _ev_hinv1(C::Copulas.ExtremeValueCopula{2,TT}, q::Real, v::Real,) where {TT<:_EVFastSmoothTail}
    _ev_fast_eligible(C) || return _ev_generalized_quantile(_ev_conditional(C, v, Int8(2)), q)
    return _ev_hinv1_numeric(C, q, v)
end

@inline function _ev_hinv2(C::Copulas.ExtremeValueCopula{2,TT}, q::Real, u::Real,) where {TT<:_EVFastSmoothTail}
    _ev_fast_eligible(C) || return _ev_generalized_quantile(_ev_conditional(C, u, Int8(1)), q)
    return _ev_hinv2_numeric(C, q, u)
end

function hinv1(C::Copulas.ExtremeValueCopula{2}, q::Real, v::Real)
    q, v = _clp(q), _clp(v)
    return _clp(_ev_hinv1(C, q, v))
end

function hinv2(C::Copulas.ExtremeValueCopula{2}, q::Real, u::Real)
    q, u = _clp(q), _clp(u)
    return _clp(_ev_hinv2(C, q, u))
end
