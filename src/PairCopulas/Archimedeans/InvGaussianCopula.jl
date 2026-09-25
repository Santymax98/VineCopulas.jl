# =====================================================================
# Inverse Gaussian
# =====================================================================

# For the bivariate inverse-Gaussian Archimedean copula, write
#     x = -log(u),    y = -log(v).
# For 0 < θ < ∞,
#     a = 1 + θx,
#     b = 1 + θy,
#     R = sqrt(a² + b² - 1),
# and
#     C(u,v) = exp((1-R)/θ).
# The limit θ = ∞ is
#     C(u,v) = exp(-sqrt(x²+y²)),
# i.e. the bivariate Gumbel copula with parameter 2.
# VineCopulas evaluates the bivariate primitives directly from the public
# copula parameter and does not depend on the generator representation used
# internally by Copulas.jl.

@inline function _ig_terms(C::Copulas.InvGaussianCopula{2}, u::Real, v::Real,)
    p = _vine_params(C)
    θ, uu, vv = promote(float(p.θ), float(u), float(v),)
    T = typeof(uu)
    θ >= zero(T) || throw(DomainError(θ, "An inverse-Gaussian copula requires θ ≥ 0.",))
    uu, vv = _clp(uu), _clp(vv)
    x, y = -log(uu), -log(vv)
    # θ = 0 is exact independence.
    if iszero(θ)
        return θ, uu, vv, x, y, one(T), one(T), one(T), zero(T), zero(T)
    end
    # For θ ≤ 1 use the original scale.  The expression for log C below
    # evaluates (1-R)/θ without cancellation:
    #   R² - 1 = θ[2(x+y) + θ(x²+y²)].
    if θ <= one(T)
        q = x * x + y * y
        s = x + y
        A = one(T) + θ * x
        B = one(T) + θ * y
        z = θ * (2 * s + θ * q)
        R = sqrt(one(T) + z)
        logC = -(2 * s + θ * q) / (one(T) + R)
        # In this representation the density contains R + θ.
        κ = θ
        return θ, uu, vv, x, y, A, B, R, logC, κ
    end

    # For large θ scale a, b, R by θ.  This avoids overflow and naturally
    # includes θ = ∞:
    #   λ = 1/θ,
    #   A = λ + x,
    #   B = λ + y,
    #   R = sqrt(A²+B²-λ²).
    # In this scale
    #   log C = λ - R,
    # and the density factor becomes R + 1.
    λ = isinf(θ) ? zero(T) : inv(θ)
    q = x * x + y * y
    s = x + y
    A = λ + x
    B = λ + y
    R = sqrt(λ * (λ + 2 * s) + q)
    # λ - R evaluated through the difference of squares.
    logC = -(2 * λ * s + q) / (R + λ)
    κ = one(T)
    return θ, uu, vv, x, y, A, B, R, logC, κ
end

@inline function _ig_logpdf_from_terms(θ, x, y, A, B, R, logC, κ,)
    T = typeof(x)
    iszero(θ) && return zero(T)
    # On either scale,
    #   c(u,v) = C * A*B*(R+κ)/(R³*u*v).
    # For θ ≤ 1, κ = θ and A,B,R are on the original scale.
    # For θ > 1, κ = 1 and they are scaled by θ.
    return logC + log(A) + log(B) + log(R + κ) - 3 * log(R) + x + y
end

@inline function _ig_hfunc_from_terms(θ, target, base, x, y, A, B, R, logC,)
    iszero(θ) && return target
    # h₁(u|v) = C * B/(R*v).
    # Using logs avoids explicitly constructing 1/v in the lower tail.
    return exp(logC + log(B) - log(R) + y)
end

@inline function _ig_pair_logpdf(C::Copulas.InvGaussianCopula{2}, u::Real, v::Real,)
    θ, _, _, x, y, A, B, R, logC, κ = _ig_terms(C, u, v)
    return _ig_logpdf_from_terms(θ, x, y, A, B, R, logC, κ)
end

@inline function _ig_hfunc(C::Copulas.InvGaussianCopula{2}, target::Real, base::Real,)
    θ, uu, vv, x, y, A, B, R, logC, _ = _ig_terms(C, target, base)
    return _ig_hfunc_from_terms(θ, uu, vv, x, y, A, B, R, logC)
end

# ---------------------------------------------------------------------
# Conditional inverse
# For finite θ > 0,
#     q = C(u,v) * b/(R v).
# In the scaled variables
#     λ = 1/θ,
#     B = λ - log(v),
#     R = sqrt((λ-log u)² + B² - λ²),
# this becomes
#     q = exp(λ-R) * B/(R v),
# hence
#     R exp(R) = exp(λ) B/(qv).
# Therefore
#     R = W₀(exp(λ)B/(qv)).
# The helper _log_lambertw_exp evaluates this without necessarily
# constructing the exponentially large Lambert-W argument.
# ---------------------------------------------------------------------
@inline function _ig_hinv(C::Copulas.InvGaussianCopula{2}, q::Real, base::Real,)
    p = _vine_params(C)
    θ, qq, vv = promote(float(p.θ), float(q), float(base),)
    T = typeof(qq)

    θ >= zero(T) || throw(DomainError(θ, "An inverse-Gaussian copula requires θ ≥ 0.",))
    qq, vv = _clp(qq), _clp(vv)
    # Independence.
    iszero(θ) && return qq
    y = -log(vv)
    # θ = ∞ is exactly the bivariate Gumbel copula with parameter 2.
    # Reuse its stable analytic conditional inverse instead of letting the
    # scaled inverse-Gaussian reconstruction degenerate to 0/0 near u = 1.
    isinf(θ) && return _gumbel_hinv_from_theta(T(2), qq, vv)
    # Near independence, λ = 1/θ is too large for the Lambert-W
    # representation to be numerically attractive. Solve directly in
    #     x = -log(u)
    # with Newton iterations.
    if !isinf(θ) && θ <= sqrt(eps(T))
        logq = log(qq)
        x = -logq
        for _ in 1:8
            A = one(T) + θ * x
            B = one(T) + θ * y
            qxy = x * x + y * y
            sxy = x + y
            R = sqrt(one(T) + θ * (2 * sxy + θ * qxy))
            logC = -(2 * sxy + θ * qxy) / (one(T) + R)
            f = logC + log(B) - log(R) + y - logq
            # d/dx log h = -A/R - θA/R².
            df = -A / R - θ * A / (R * R)
            xnew = max(x - f / df, zero(T))
            abs(xnew - x) <=
                T(8) * eps(T) * max(one(T), abs(xnew)) && return exp(-xnew)
            x = xnew
        end
        return exp(-x)
    end
    # Scaled representation:
    #     λ = 1/θ,
    #     B = λ - log(v).
    # The conditional equation gives
    #     R exp(R) = exp(λ) B / (qv),
    # hence
    #     R = W₀(exp(logz)),
    # with
    #     logz = λ + log(B) - log(q) - log(v).
    λ = isinf(θ) ? zero(T) : inv(θ)
    B = λ + y
    logz = λ + log(B) - log(qq) + y
    # Fast ordinary path: construct the Lambert-W argument directly whenever
    # it is representable. This avoids the log(W) -> exp(log(W)) roundtrip.
    logmax = log(floatmax(T))
    R = if logz < logmax - T(2)
        T(real(LambertW.lambertw(exp(logz), 0)))
    else
        # Extreme-tail fallback. W₀(exp(logz)) itself remains moderate even
        # when exp(logz) is not representable.
        exp(_log_lambertw_exp(logz))
    end
    isinf(R) && return zero(T)
    # We need
    #     D = R² - B² = x² + 2λx.
    # For ordinary probabilities direct factorization is both cheaper and
    # sufficiently accurate. Near q = 1, R and B nearly coincide, so switch
    # to a cancellation-safe reconstruction.
    gap = R - B
    scale = max(abs(R), abs(B), one(T))
    if gap > sqrt(eps(T)) * scale
        # Well separated: direct factorization is accurate and cheapest.
        D = gap * (R + B)
    else
        # When R ≈ B, subtracting them loses the information needed to
        # recover a target close to one.  From
        #     q = exp(B-R) * B/R
        # write d = R-B ≥ 0. Then d satisfies
        #     d + log1p(d/B) = -log(q).
        # Solve this scalar equation locally and reconstruct
        #     R²-B² = d(2B+d)
        # without cancellation.
        r = -log(qq)
        d = r / (one(T) + inv(B))
        for _ in 1:3
            f = d + log1p(d / B) - r
            df = one(T) + inv(B + d)
            d = max(d - f / df, zero(T))
        end
        D = d * (2 * B + d)
    end
    # Recover x from
    #     x² + 2λx = D
    # using the stable positive quadratic root.
    A = sqrt(λ * λ + D)
    x = D / (A + λ)
    return exp(-x)
end

@inline _pair_logpdf(C::Copulas.InvGaussianCopula{2}, u::Real, v::Real, ::Vector{Float64},) = _ig_pair_logpdf(C, u, v)
@inline hfunc1(C::Copulas.InvGaussianCopula{2}, u::Real, v::Real,) = _clp(_ig_hfunc(C, u, v))
@inline hfunc2(C::Copulas.InvGaussianCopula{2}, u::Real, v::Real,) = _clp(_ig_hfunc(C, v, u))
@inline hinv1(C::Copulas.InvGaussianCopula{2}, q::Real, v::Real,) = _clp(_ig_hinv(C, q, v))
@inline hinv2(C::Copulas.InvGaussianCopula{2}, q::Real, u::Real,) = _clp(_ig_hinv(C, q, u))

@inline function _pair_hfuncs(C::Copulas.InvGaussianCopula{2}, u::Real, v::Real,)
    θ, uu, vv, x, y, A, B, R, logC, _ = _ig_terms(C, u, v)
    iszero(θ) && return uu, vv
    h1 = exp(logC + log(B) - log(R) + y)
    h2 = exp(logC + log(A) - log(R) + x)
    return _clp(h1), _clp(h2)
end

@inline function _pair_step(C::Copulas.InvGaussianCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    θ, uu, vv, x, y, A, B, R, logC, κ = _ig_terms(C, u, v)
    if iszero(θ)
        return zero(typeof(uu)), uu, vv
    end
    logc = _ig_logpdf_from_terms(θ, x, y, A, B, R, logC, κ)
    h1 = exp(logC + log(B) - log(R) + y)
    h2 = exp(logC + log(A) - log(R) + x)
    return logc, _clp(h1), _clp(h2)
end

@inline function _pair_logpdf_h1(C::Copulas.InvGaussianCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    θ, uu, _, x, y, A, B, R, logC, κ = _ig_terms(C, u, v)
    if iszero(θ)
        return zero(typeof(uu)), uu
    end
    logc = _ig_logpdf_from_terms(θ, x, y, A, B, R, logC, κ)
    h1 = exp(logC + log(B) - log(R) + y)
    return logc, _clp(h1)
end

@inline function _pair_logpdf_h2(C::Copulas.InvGaussianCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    θ, _, vv, x, y, A, B, R, logC, κ = _ig_terms(C, u, v)
    if iszero(θ)
        return zero(typeof(vv)), vv
    end
    logc = _ig_logpdf_from_terms(θ, x, y, A, B, R, logC, κ)
    h2 = exp(logC + log(A) - log(R) + x)
    return logc, _clp(h2)
end
