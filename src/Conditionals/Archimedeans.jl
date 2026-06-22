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

function hfunc1(C::Copulas.ArchimedeanCopula{2}, uv::Tuple{<:Real,<:Real})
    u, v = _clp(uv[1]), _clp(uv[2])
    return _clp(_arch_hfunc(C.G, u, v))
end

function hfunc2(C::Copulas.ArchimedeanCopula{2}, uv::Tuple{<:Real,<:Real})
    u, v = _clp(uv[1]), _clp(uv[2])
    return _clp(_arch_hfunc(C.G, v, u))
end

function hinv1(C::Copulas.ArchimedeanCopula{2}, q::Real, v::Real)
    return _clp(_arch_hinv(C.G, _clp(q), _clp(v)))
end

function hinv2(C::Copulas.ArchimedeanCopula{2}, q::Real, u::Real)
    return _clp(_arch_hinv(C.G, _clp(q), _clp(u)))
end

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

# =====================================================================
# BB1
# =====================================================================

# BB1 has no useful closed-form inverse of ϕ'. It is solved numerically in
# z = log(s), where log|ϕ'| is smooth and strictly decreasing. The same stable
# coordinate protocol is shared with BB2 and future BB implementations.
@inline function _arch_coordinate(G::Copulas.BB1Generator, u::Real)
    θ, δ, uu = promote(float(G.θ), float(G.δ), float(u))
    return δ * LogExpFunctions.logexpm1(-θ * log(uu))
end

@inline function _arch_probability(G::Copulas.BB1Generator, z::Real)
    θ, δ, zz = promote(float(G.θ), float(G.δ), float(z))
    return exp(-LogExpFunctions.log1pexp(zz / δ) / θ)
end

@inline function _arch_logderivative(G::Copulas.BB1Generator, z::Real)
    θ, δ, zz = promote(float(G.θ), float(G.δ), float(z))
    a, b = inv(δ), inv(θ)
    return log(a) + log(b) + (a - one(zz)) * zz - (b + one(zz)) * LogExpFunctions.log1pexp(a * zz)
end

function _arch_inverse_logderivative(G::Copulas.BB1Generator, logm::Real)
    lm = float(logm)
    T = typeof(lm)
    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN."))
    lm == -T(Inf) && return T(Inf)
    lm == T(Inf) && return -T(Inf)

    θ, δ = T(G.θ), T(G.δ)
    θ > zero(T) || throw(DomainError(θ, "The BB1 generator requires θ > 0."))
    δ > one(T) || throw(DomainError(δ, "A genuine BB1 generator requires δ > 1; δ = 1 reduces to Clayton."))

    a, b = inv(δ), inv(θ)
    logab = log(a) + log(b)
    f(z) = logab + (a - one(T)) * z - (b + one(T)) * LogExpFunctions.log1pexp(a * z) - lm
    df(z) = (a - one(T)) - a * (b + one(T)) * LogExpFunctions.logistic(a * z)
    return _solve_decreasing_root(f, df, zero(T))
end

@inline _arch_combine(::Copulas.BB1Generator, a::Real, b::Real) = LogExpFunctions.logaddexp(a, b)
@inline function _arch_difference(::Copulas.BB1Generator, total::Real, base::Real)
    total >= base || throw(DomainError((total, base), "Expected total ≥ base."))
    total == base && return oftype(total - base, -Inf)
    return LogExpFunctions.logsubexp(total, base)
end
@inline _arch_hfunc(G::Copulas.BB1Generator, target::Real, base::Real) = _arch_hfunc_coordinate(G, target, base)
@inline _arch_hinv(G::Copulas.BB1Generator, q::Real, base::Real) = _arch_hinv_coordinate(G, q, base)

function _inv_ϕ¹(G::Copulas.BB1Generator, y::Real)
    m = _negative_derivative_magnitude(y, "BB1")
    T = typeof(m)
    iszero(m) && return T(Inf)
    isinf(m) && return zero(T)
    return exp(_arch_inverse_logderivative(G, log(m)))
end

# =====================================================================
# Clayton
# =====================================================================

# Clayton with θ < 0 has finite support. Direct conditional inversion avoids
# underflow in q*ϕ'(sbase) at the support boundary.
@inline function _arch_hinv(G::Copulas.ClaytonGenerator, q::Real, base::Real)
    θ, qq, bb = promote(float(G.θ), float(q), float(base))
    θ >= zero(θ) && return _arch_hinv_generic(G, qq, bb)
    -one(θ) <= θ || throw(DomainError(θ, "A bivariate Clayton generator requires θ ≥ -1."))

    qq, bb = clamp(qq, zero(qq), one(qq)), _clp(bb)
    θ == -one(θ) && return clamp(one(θ) - bb, zero(θ), one(θ))

    a = -θ / (one(θ) + θ)
    logb = -θ * log(bb)
    b = exp(logb)
    qa = iszero(qq) ? zero(qq) : exp(a * log(qq))
    z = max(-expm1(logb) + b * qa, zero(θ))
    iszero(z) && return zero(θ)
    return clamp(exp((-inv(θ)) * log(z)), zero(θ), one(θ))
end

@inline function _inv_ϕ¹(G::Copulas.ClaytonGenerator, y::Real)
    θ, m = promote(float(G.θ), _negative_derivative_magnitude(y, "Clayton"))
    iszero(θ) && throw(DomainError(θ, "A genuine Clayton generator requires θ ≠ 0."))

    if iszero(m)
        return θ < zero(θ) ? -inv(θ) : oftype(θ, Inf)
    end

    tol = 64eps(typeof(θ))
    m > one(m) + tol && throw(DomainError(y, "The target lies outside the range [ϕ'(0), 0]."))
    m >= one(m) - tol && return zero(θ)
    θ == -one(θ) && throw(DomainError(y, "For θ = -1, ϕ' has no interior inverse."))

    s = expm1((-θ / (one(θ) + θ)) * log(m)) / θ
    return max(s, zero(s))
end

# =====================================================================
# AMH
# =====================================================================

@inline function _inv_ϕ¹(G::Copulas.AMHGenerator, y::Real)
    θ, m = promote(float(G.θ), _negative_derivative_magnitude(y, "AMH"))
    T = typeof(θ)
    iszero(m) && return T(Inf)
    isinf(m) && throw(DomainError(y, "The target lies outside the range of the AMH derivative."))
    θ < one(T) || throw(DomainError(θ, "The AMH generator requires θ < 1."))

    mmax = inv(one(T) - θ)
    tol = 64eps(T) * max(one(T), mmax)
    m > mmax + tol && throw(DomainError(y, "The target lies outside the range [ϕ'(0), 0)."))
    m >= mmax - tol && return zero(T)

    B = 2m * θ + one(T) - θ
    D = max(B * B - 4m * m * θ * θ, zero(T))
    return max(log((B + sqrt(D)) / (2m)), zero(T))
end

# =====================================================================
# Gumbel
# =====================================================================

@inline function _inv_ϕ¹(G::Copulas.GumbelGenerator, y::Real)
    θ, m = promote(float(G.θ), _negative_derivative_magnitude(y, "Gumbel"))
    T = typeof(θ)
    iszero(m) && return T(Inf)
    isinf(m) && return zero(T)

    b = θ - one(T)
    b > zero(T) || throw(DomainError(θ, "A genuine Gumbel generator requires θ > 1."))
    logz = -log(θ * m) / b - log(b)
    return exp(θ * (log(b) + _log_lambertw_exp(logz)))
end

# =====================================================================
# Joe
# =====================================================================

function _inv_ϕ¹(G::Copulas.JoeGenerator, y::Real)
    θ, m = promote(float(G.θ), _negative_derivative_magnitude(y, "Joe"))
    T = typeof(θ)
    iszero(m) && return T(Inf)
    isinf(m) && return zero(T)

    α, logm = inv(θ), log(m)
    logα = log(α)
    equation(z) = logα - LogExpFunctions.log1pexp(z) - (α - one(T)) * LogExpFunctions.log1pexp(-z) - logm

    z = logm >= logα ? (logm - logα) / (α - one(T)) : logα - logm
    isfinite(z) || return z < zero(T) ? zero(T) : T(Inf)

    lo, hi = min(z, -one(T)), max(z, one(T))
    flo, fhi = equation(lo), equation(hi)
    for _ in 1:64
        flo >= zero(T) && break
        lo = 2lo - one(T)
        flo = equation(lo)
    end
    for _ in 1:64
        fhi <= zero(T) && break
        hi = 2hi + one(T)
        fhi = equation(hi)
    end

    z = clamp(z, lo, hi)
    for _ in 1:20
        fz = equation(z)
        abs(fz) <= 16eps(T) * (one(T) + abs(logm)) && break
        candidate = z - fz / (α - one(T) - α * LogExpFunctions.logistic(z))
        (!isfinite(candidate) || !(lo < candidate < hi)) && (candidate = lo + (hi - lo) / 2)
        if equation(candidate) > zero(T)
            lo = candidate
        else
            hi = candidate
        end
        z = candidate
    end
    return LogExpFunctions.log1pexp(z)
end

# =====================================================================
# Frank
# =====================================================================

function _inv_ϕ¹(G::Copulas.FrankGenerator, y::Real)
    θ, m = promote(float(G.θ), _negative_derivative_magnitude(y, "Frank"))
    T = typeof(θ)
    iszero(m) && return T(Inf)
    iszero(θ) && throw(DomainError(θ, "A genuine Frank generator requires θ ≠ 0."))

    y0 = -expm1(θ) / θ
    if isinf(m)
        y0 == -Inf && return zero(T)
        throw(DomainError(y, "The target lies outside the range of the Frank derivative."))
    end

    tol = 64eps(T) * max(one(T), abs(y0))
    y < y0 - tol && throw(DomainError(y, "The target lies outside the range [ϕ'(0), 0)."))
    y <= y0 + tol && return zero(T)

    denominator = one(T) - θ * y
    denominator > zero(T) || throw(DomainError(y, "The target lies outside the range of the Frank derivative."))
    logabs_expm1 = θ > zero(T) ? LogExpFunctions.log1mexp(-θ) : LogExpFunctions.logexpm1(-θ)
    logx = log(abs(θ)) + log(m) - logabs_expm1 - log(denominator)
    return max(-logx, zero(T))
end

# =====================================================================
# Gumbel-Barnett
# =====================================================================

function _inv_ϕ¹(G::Copulas.GumbelBarnettGenerator, y::Real)
    θ, m = promote(float(G.θ), _negative_derivative_magnitude(y, "Gumbel-Barnett"))
    T = typeof(θ)
    θ > zero(T) || throw(DomainError(θ, "A Gumbel-Barnett generator requires θ > 0."))
    iszero(m) && return T(Inf)
    isinf(m) && throw(DomainError(y, "The target lies outside the range of the generator derivative."))

    mmax = inv(θ)
    tol = 64eps(T) * max(one(T), mmax)
    m > mmax + tol && throw(DomainError(y, "The target lies outside the range [ϕ'(0), 0)."))
    m >= mmax - tol && return zero(T)

    x = _neg_lambertwm1_expneg(inv(θ) - log(m))
    return max(log(θ * x), zero(T))
end

# =====================================================================
# Inverse Gaussian
# =====================================================================

function _inv_ϕ¹(G::Copulas.InvGaussianGenerator, y::Real)
    yy = float(y)
    T = typeof(yy)
    m = _negative_derivative_magnitude(yy, "inverse-Gaussian")
    iszero(m) && return T(Inf)
    isinf(m) && return zero(T)

    if isinf(G.θ)
        a = real(LambertW.lambertw(inv(m), 0))
        return abs2(a) / T(2)
    end

    θ = T(G.θ)
    a = real(LambertW.lambertw(exp(inv(θ)) / m, 0))
    return (abs2(θ * a) - one(T)) / (T(2) * abs2(θ))
end

# =====================================================================
# BB2
# =====================================================================

# BB2 is evaluated in L = log(1+s). It implements a small reusable protocol:
# probability ↔ stable coordinate and log|ϕ'| ↔ stable coordinate. Future BB
# families can add methods to the same protocol instead of introducing new
# family-named helper APIs.

@inline function _arch_coordinate(G::Copulas.BB2Generator, u::Real)
    θ, δ, uu = promote(float(G.θ), float(G.δ), float(u))
    return δ * expm1(-θ * log(uu))
end

@inline function _arch_probability(G::Copulas.BB2Generator, L::Real)
    θ, δ, LL = promote(float(G.θ), float(G.δ), float(L))
    return exp(-log1p(LL / δ) / θ)
end

@inline function _arch_logderivative(G::Copulas.BB2Generator, L::Real)
    θ, δ, LL = promote(float(G.θ), float(G.δ), float(L))
    return -log(θ) - log(δ) - LL - (one(LL) + inv(θ)) * log1p(LL / δ)
end

function _arch_inverse_logderivative(G::Copulas.BB2Generator, logm::Real)
    lm = float(logm)
    T = typeof(lm)
    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN."))
    lm == -T(Inf) && return T(Inf)
    lm == T(Inf) && return zero(T)

    θ, δ = T(G.θ), T(G.δ)
    a = one(T) + inv(θ)
    logv = -log(a) + (δ + (a - one(T)) * log(δ) - log(θ) - lm) / a
    return max(a * exp(_log_lambertw_exp(logv)) - δ, zero(T))
end

# =====================================================================
# BB3
# =====================================================================

# BB3 is evaluated in the shared coordinate L = log(1+s). Its derivative
# inversion has no useful general closed form, but log|ϕ′| is strictly
# decreasing in z = log(L/δ), so the common safeguarded Newton solver applies.
@inline function _arch_coordinate(G::Copulas.BB3Generator, u::Real)
    θ, δ, uu = promote(float(G.θ), float(G.δ), float(u))
    x = -log(uu)
    iszero(x) && return zero(x)
    return δ * exp(θ * log(x))
end

@inline function _arch_probability(G::Copulas.BB3Generator, L::Real)
    θ, δ, LL = promote(float(G.θ), float(G.δ), float(L))
    LL >= zero(LL) || throw(DomainError(L, "The BB3 coordinate must be non-negative."))
    iszero(LL) && return one(LL)
    return exp(-exp((log(LL) - log(δ)) / θ))
end

@inline function _arch_logderivative(G::Copulas.BB3Generator, L::Real)
    θ, δ, LL = promote(float(G.θ), float(G.δ), float(L))
    LL >= zero(LL) || throw(DomainError(L, "The BB3 coordinate must be non-negative."))
    isinf(LL) && return -oftype(LL, Inf)

    if iszero(LL)
        return θ == one(θ) ? -log(δ) : oftype(LL, Inf)
    end

    p = inv(θ)
    z = log(LL) - log(δ)
    return -log(θ) - log(δ) + (p - one(p)) * z - LL - exp(p * z)
end

function _arch_inverse_logderivative(G::Copulas.BB3Generator, logm::Real)
    lm = float(logm)
    T = typeof(lm)
    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN."))
    lm == -T(Inf) && return T(Inf)

    θ, δ = T(G.θ), T(G.δ)
    θ >= one(T) || throw(DomainError(θ, "The BB3 generator requires θ ≥ 1."))
    δ > zero(T) || throw(DomainError(δ, "The BB3 generator requires δ > 0."))

    # When θ = 1, |ϕ′(0)| = 1/δ is finite and the equation is linear in L.
    if θ == one(T)
        maxlm = -log(δ)
        lm == T(Inf) && throw(DomainError(logm, "The target lies outside the range of the BB3 derivative."))

        tol = T(64) * eps(T) * max(one(T), abs(maxlm))
        lm > maxlm + tol && throw(DomainError(logm, "The target lies outside the range of the BB3 derivative."))
        lm >= maxlm - tol && return zero(T)
        return δ * (maxlm - lm) / (δ + one(T))
    end

    lm == T(Inf) && return zero(T)

    p = inv(θ)
    logprefactor = -log(θ) - log(δ)
    f(z) = logprefactor + (p - one(T)) * z - δ * exp(z) - exp(p * z) - lm
    df(z) = (p - one(T)) - δ * exp(z) - p * exp(p * z)

    z = _solve_decreasing_root(f, df, zero(T))
    return δ * exp(z)
end

# =====================================================================
# BB6
# =====================================================================

# BB6 is represented in the transformed coordinate
#
#     x = log(s^(1/δ)) = log(r),
#
# where r = s^(1/δ). In this coordinate, log|ϕ′| is smooth and strictly
# decreasing for every genuine BB6 generator (θ > 1 and δ > 1).

@inline function _arch_coordinate(G::Copulas.BB6Generator, u::Real)
    θ, uu = promote(float(G.θ), float(u))

    # logw = log((1-u)^θ)
    logw = θ * log1p(-uu)

    # x = log(-log(1 - (1-u)^θ))
    return _log_neglog1mexp(logw)
end

@inline function _arch_probability(G::Copulas.BB6Generator, x::Real)
    θ, xx = promote(float(G.θ), float(x))

    # logH = log(1 - exp(-exp(x)))
    logH = _log1mexp_negexp(xx)

    # u = 1 - H^(1/θ)
    return -expm1(logH / θ)
end

@inline function _arch_logderivative(G::Copulas.BB6Generator, x::Real,)
    θ, δ, xx = promote(float(G.θ), float(G.δ), float(x))
    T = typeof(xx)

    xx == -T(Inf) && return T(Inf)
    xx == T(Inf) && return -T(Inf)

    r = exp(xx)
    isinf(r) && return -T(Inf)

    a = inv(θ)
    logH = _log1mexp_negexp(xx)

    # log|ϕ′(s)| =
    #   -log θ - log δ
    #   + (1-δ)x
    #   - exp(x)
    #   + (1/θ-1)log(1-exp(-exp(x))).
    return -log(θ) -
           log(δ) +
           (one(T) - δ) * xx -
           r +
           (a - one(T)) * logH
end

function _arch_inverse_logderivative(G::Copulas.BB6Generator, logm::Real,)
    lm = float(logm)
    T = typeof(lm)

    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN."))

    lm == -T(Inf) && return T(Inf)
    lm == T(Inf) && return -T(Inf)

    θ, δ = T(G.θ), T(G.δ)

    θ > one(T) || throw(DomainError(θ, "A genuine BB6 generator requires θ > 1; θ = 1 reduces to Gumbel.",))
    δ > one(T) || throw(DomainError(δ, "A genuine BB6 generator requires δ > 1; δ = 1 reduces to Joe.",))

    a = inv(θ)

    f(x) = _arch_logderivative(G, x) - lm

    function df(x)
        x == -T(Inf) && return a - δ
        x == T(Inf) && return -T(Inf)

        r = exp(x)
        isinf(r) && return -T(Inf)

        logH = _log1mexp_negexp(x)

        # d/dx log(1-exp(-exp(x)))
        ratio = exp(x - r - logH)

        return one(T) - δ - r + (a - one(T)) * ratio
    end

    return _solve_decreasing_root(f, df, zero(T))
end

# In x = log(s^(1/δ)), the Archimedean sum s₁+s₂ becomes a scaled
# log-sum-exp operation.
@inline function _arch_combine(G::Copulas.BB6Generator, a::Real, b::Real,)
    δ, aa, bb = promote(float(G.δ), float(a), float(b))
    return LogExpFunctions.logaddexp(δ * aa, δ * bb) / δ
end

# Recover one summand from s_total - s_base in the same transformed
# coordinate. A microscopic order reversal is interpreted as a zero summand,
# analogously to the saturated conditional-probability handling for BB2.
@inline function _arch_difference(G::Copulas.BB6Generator, total::Real, base::Real,)
    δ, tt, bb = promote(float(G.δ), float(total), float(base))
    T = typeof(tt)

    stotal = δ * tt
    sbase = δ * bb

    if stotal < sbase
        tol = T(8) * eps(T) * max(abs(stotal), abs(sbase), one(T))

        sbase - stotal <= tol || throw(DomainError((total, base), "Expected total ≥ base in the BB6 coordinate.",))

        return -T(Inf)
    end

    stotal == sbase && return -T(Inf)

    return LogExpFunctions.logsubexp(stotal, sbase) / δ
end

@inline _arch_hfunc(G::Copulas.BB6Generator, target::Real, base::Real,) = _arch_hfunc_coordinate(G, target, base)

@inline _arch_hinv(G::Copulas.BB6Generator, q::Real, base::Real,) = _arch_hinv_coordinate(G, q, base)

function _inv_ϕ¹(G::Copulas.BB6Generator, y::Real)
    m = _negative_derivative_magnitude(y, "BB6")
    T = typeof(m)

    iszero(m) && return T(Inf)
    isinf(m) && return zero(T)

    x = _arch_inverse_logderivative(G, log(m))
    δ, xx = promote(float(G.δ), x)

    # s = exp(δx)
    return exp(δ * xx)
end

# =====================================================================
# BB7
# =====================================================================

# BB7 uses the shared coordinate
#
#     L = log(1+s).
#
# For a genuine BB7 generator θ > 1 because θ = 1 is reduced to Clayton
# by the Copulas.jl constructor.

@inline function _arch_coordinate(G::Copulas.BB7Generator, u::Real)
    θ, δ, uu = promote(float(G.θ), float(G.δ), float(u))

    zero(uu) < uu <= one(uu) || throw(DomainError(u, "The BB7 probability must belong to (0, 1].",))
    isone(uu) && return zero(uu)

    # L = -δ log(1 - (1-u)^θ)
    return -δ * LogExpFunctions.log1mexp(θ * log1p(-uu),)
end

@inline function _arch_probability(G::Copulas.BB7Generator, L::Real)
    θ, δ, LL = promote(float(G.θ), float(G.δ), float(L))

    LL >= zero(LL) || throw(DomainError(L, "The BB7 log1p coordinate must be non-negative.",))

    iszero(LL) && return one(LL)
    isinf(LL) && return zero(LL)

    # H = 1 - exp(-L/δ)
    logH = LogExpFunctions.log1mexp(-LL / δ)

    # u = 1 - H^(1/θ)
    return -expm1(logH / θ)
end

@inline function _arch_logderivative(G::Copulas.BB7Generator,L::Real,)
    θ, δ, LL = promote(float(G.θ), float(G.δ), float(L))
    T = typeof(LL)

    LL >= zero(LL) || throw(DomainError(L, "The BB7 log1p coordinate must be non-negative.",))

    iszero(LL) && return T(Inf)
    isinf(LL) && return -T(Inf)

    a = inv(θ)
    x = log(LL) - log(δ)
    logH = _log1mexp_negexp(x)

    # log|ϕ′(s)| = -log θ - log δ + (1/θ - 1) log(1 - exp(-L/δ)) - (1 + 1/δ)L.
    return -log(θ) - log(δ) + (a - one(T)) * logH - (one(T) + inv(δ)) * LL
end

function _arch_inverse_logderivative(G::Copulas.BB7Generator, logm::Real,)
    lm = float(logm)
    T = typeof(lm)

    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN."))

    lm == -T(Inf) && return T(Inf)
    lm == T(Inf) && return zero(T)

    θ, δ = T(G.θ), T(G.δ)

    θ > one(T) || throw(DomainError(θ, "A genuine BB7 generator requires θ > 1; θ = 1 reduces to Clayton.",))

    δ > zero(T) || throw(DomainError(δ, "The BB7 generator requires δ > 0.",))

    a = inv(θ)
    logprefactor = -log(θ) - log(δ)

    # Solve in x = log(L/δ). In this coordinate,
    #   L = δ exp(x)
    # and log|ϕ′| is smooth and strictly decreasing.
    function f(x)
        r = exp(x)
        logH = _log1mexp_negexp(x)

        return logprefactor + (a - one(T)) * logH - (δ + one(T)) * r - lm
    end

    function df(x)
        x == -T(Inf) && return a - one(T)
        x == T(Inf) && return -T(Inf)

        r = exp(x)
        isinf(r) && return -T(Inf)

        logH = _log1mexp_negexp(x)

        # d/dx log(1-exp(-exp(x)))
        ratio = exp(x - r - logH)

        return (a - one(T)) * ratio - (δ + one(T)) * r
    end

    x = _solve_decreasing_root(f, df, zero(T))

    # Return L, the coordinate expected by the shared protocol.
    return δ * exp(x)
end

# BB2, BB3 and BB7 share L = log(1+s), so coordinate algebra, conditionals and the
# final reconstruction of s are implemented once.
const _Log1pCoordinateGenerator = Union{Copulas.BB2Generator,Copulas.BB3Generator,Copulas.BB7Generator}

@inline _arch_combine(::_Log1pCoordinateGenerator, a::Real, b::Real) = _logaddexp_minus_one(a, b)
@inline _arch_difference(::_Log1pCoordinateGenerator, total::Real, base::Real) = _logsubexp_plus_one(total, base)
@inline _arch_hfunc(G::_Log1pCoordinateGenerator, target::Real, base::Real) = _arch_hfunc_coordinate(G, target, base)
@inline _arch_hinv(G::_Log1pCoordinateGenerator, q::Real, base::Real) =_arch_hinv_coordinate(G, q, base)

# =====================================================================
# BB8
# =====================================================================

# BB8 uses the original generator coordinate
#
#     s = ϕ⁻¹(u).
#
# Therefore, Archimedean composition is ordinary addition in this
# coordinate. A genuine BB8 generator has 0 < δ < 1 because δ = 1 is
# reduced to Joe by the Copulas.jl constructor.

@inline function _arch_coordinate(G::Copulas.BB8Generator, u::Real)
    ϑ, δ, uu = promote(float(G.ϑ), float(G.δ), float(u))

    zero(uu) < uu <= one(uu) ||
        throw(DomainError(u, "The BB8 probability must belong to (0, 1].",))

    isone(uu) && return zero(uu)

    # η = 1 - (1-δ)^ϑ
    logη = log(-expm1(ϑ * log1p(-δ)))

    # numerator = 1 - (1-δu)^ϑ
    lognumerator = log(-expm1(ϑ * log1p(-δ * uu)),)

    # s = -log(numerator / η)
    return logη - lognumerator
end

@inline function _arch_probability(G::Copulas.BB8Generator, s::Real)
    ϑ, δ, ss = promote(float(G.ϑ), float(G.δ), float(s))

    ss >= zero(ss) || throw(DomainError(s, "The BB8 generator coordinate must be non-negative.",))

    iszero(ss) && return one(ss)
    isinf(ss) && return zero(ss)

    η = -expm1(ϑ * log1p(-δ))
    q = η * exp(-ss)

    # ϕ(s) = [1 - (1-q)^(1/ϑ)] / δ
    return -expm1(log1p(-q) / ϑ) / δ
end

@inline function _arch_logderivative(G::Copulas.BB8Generator, s::Real,)
    ϑ, δ, ss = promote(float(G.ϑ), float(G.δ), float(s))
    T = typeof(ss)

    ss >= zero(ss) || throw(DomainError(s, "The BB8 generator coordinate must be non-negative.",))
    isinf(ss) && return -T(Inf)

    η = -expm1(ϑ * log1p(-δ))
    q = η * exp(-ss)
    a = inv(ϑ)

    # log|ϕ′(s)| =
    #   log η - log δ - log ϑ
    #   - s
    #   + (1/ϑ - 1)log(1 - ηe^(-s)).
    return log(η) - log(δ) - log(ϑ) - ss + (a - one(T)) * log1p(-q)
end

function _arch_inverse_logderivative(G::Copulas.BB8Generator, logm::Real,)
    lm = float(logm)
    T = typeof(lm)

    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN."))

    ϑ, δ = T(G.ϑ), T(G.δ)

    ϑ >= one(T) || throw(DomainError(ϑ, "The BB8 generator requires ϑ ≥ 1.",))

    zero(T) < δ < one(T) || throw(DomainError(δ, "A genuine BB8 generator requires 0 < δ < 1; δ = 1 reduces to Joe.",))

    maxlm = _arch_logderivative(G, zero(T))
    tol = T(64) * eps(T) * max(one(T), abs(maxlm))

    # Unlike BB1, BB3, BB6 and BB7, BB8 has a finite derivative
    # magnitude at s = 0.
    lm == T(Inf) && throw(DomainError(logm, "The target lies outside the range of the BB8 derivative.",))

    lm > maxlm + tol && throw(DomainError(logm, "The target lies outside the range of the BB8 derivative.",))

    lm >= maxlm - tol && return zero(T)
    lm == -T(Inf) && return T(Inf)

    # For ϑ = 1, BB8 reduces to the independence generator:
    #
    #     ϕ(s) = exp(-s),  log|ϕ′(s)| = -s.
    if ϑ == one(T)
        return -lm
    end

    # Solve in z = log(s), so the constrained coordinate s ≥ 0
    # becomes an unconstrained real variable.
    function f(z)
        s = exp(z)
        return _arch_logderivative(G, s) - lm
    end

    function df(z)
        z == -T(Inf) && return zero(T)
        z == T(Inf) && return -T(Inf)

        s = exp(z)
        isinf(s) && return -T(Inf)

        η = -expm1(ϑ * log1p(-δ))
        q = η * exp(-s)
        a = inv(ϑ)

        # d/ds log|ϕ′(s)| = -1 + (1/ϑ - 1) q/(1-q).
        dlogm_ds = -one(T) + (a - one(T)) * q / (one(T) - q)
        return s * dlogm_ds
    end

    z = _solve_decreasing_root(f, df, zero(T))
    return exp(z)
end

# BB8 uses s itself as coordinate.
@inline _arch_combine(::Copulas.BB8Generator, a::Real, b::Real,) = a + b

@inline function _arch_difference(::Copulas.BB8Generator, total::Real, base::Real,)
    tt, bb = promote(float(total), float(base))
    T = typeof(tt)

    if tt < bb
        tol = T(8) * eps(T) * max(abs(tt), abs(bb), one(T))
        bb - tt <= tol || throw(DomainError((total, base), "Expected total ≥ base in the BB8 coordinate.",))
        return zero(T)
    end

    return tt - bb
end

@inline _arch_hfunc(G::Copulas.BB8Generator, target::Real, base::Real,) = _arch_hfunc_coordinate(G, target, base)

@inline _arch_hinv(G::Copulas.BB8Generator, q::Real, base::Real,) = _arch_hinv_coordinate(G, q, base)

function _inv_ϕ¹(G::Copulas.BB8Generator, y::Real)
    m = _negative_derivative_magnitude(y, "BB8")
    T = typeof(m)

    iszero(m) && return T(Inf)

    # Do not map m = Inf to zero automatically: BB8 has a finite
    # derivative magnitude at s = 0, so Inf is outside its range.
    return _arch_inverse_logderivative(G, log(m))
end

# =====================================================================
# BB9
# =====================================================================

# BB9 is represented in the shifted logarithmic coordinate
#
#     x = log(s + c),    c = δ^(-θ).
#
# Since s ≥ 0, the coordinate domain is
#
#     x ≥ log(c) = -θ log(δ).
#
# In this coordinate, log|ϕ′| is smooth and strictly decreasing.

@inline function _bb9_logc(G::Copulas.BB9Generator)
    θ, δ = promote(float(G.θ), float(G.δ))
    return -θ * log(δ)
end

@inline function _arch_coordinate(G::Copulas.BB9Generator, u::Real)
    θ, δ, uu = promote(float(G.θ), float(G.δ), float(u))

    zero(uu) < uu <= one(uu) || throw(DomainError(u, "The BB9 probability must belong to (0, 1].",))

    # s + c = (1/δ - log(u))^θ
    # Therefore:
    # x = log(s+c) = θ log(1/δ - log(u)).
    return θ * log(inv(δ) - log(uu))
end

@inline function _arch_probability(G::Copulas.BB9Generator, x::Real,)
    θ, δ, xx = promote(float(G.θ), float(G.δ), float(x))
    T = typeof(xx)

    logc = -θ * log(δ)
    tol = T(8) * eps(T) * max(abs(xx), abs(logc), one(T))

    xx >= logc - tol || throw(DomainError(x, "The BB9 shifted-log coordinate is below log(c).",))

    isinf(xx) && return zero(T)

    # ϕ(s) = exp(1/δ - (s+c)^(1/θ))
    # Since x = log(s+c):
    # (s+c)^(1/θ) = exp(x/θ).
    return exp(inv(δ) - exp(xx / θ))
end

@inline function _arch_logderivative(G::Copulas.BB9Generator, x::Real,)
    θ, δ, xx = promote(float(G.θ), float(G.δ), float(x))
    T = typeof(xx)

    logc = -θ * log(δ)
    tol = T(8) * eps(T) * max(abs(xx), abs(logc), one(T))

    xx >= logc - tol || throw(DomainError(x, "The BB9 shifted-log coordinate is below log(c).",))
    isinf(xx) && return -T(Inf)
    a = inv(θ)

    # log|ϕ′(s)| = -log θ + (1/θ - 1)x + 1/δ - exp(x/θ).
    return -log(θ) + (a - one(T)) * xx + inv(δ) - exp(a * xx)
end

function _arch_inverse_logderivative(G::Copulas.BB9Generator, logm::Real,)
    lm = float(logm)
    T = typeof(lm)

    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN."))

    θ, δ = T(G.θ), T(G.δ)
    θ >= one(T) || throw(DomainError(θ, "The BB9 generator requires θ ≥ 1.",))

    δ > zero(T) || throw(DomainError(δ, "The BB9 generator requires δ > 0.",))

    logc = -θ * log(δ)
    maxlm = _arch_logderivative(G, logc)

    tol = T(64) * eps(T) * max(one(T), abs(maxlm))

    # BB9 has a finite derivative magnitude at s = 0.
    lm == T(Inf) && throw(DomainError(logm, "The target lies outside the range of the BB9 derivative.",))
    lm > maxlm + tol && throw(DomainError(logm, "The target lies outside the range of the BB9 derivative.",))
    lm >= maxlm - tol && return logc
    lm == -T(Inf) && return T(Inf)

    # Let
    #     y = (s+c)^(1/θ) = exp(x/θ).
    # Then:
    #     logm = -log θ + (1-θ)log(y) + 1/δ - y.
    # For θ = 1 this becomes linear in y.
    if θ == one(T)
        y = inv(δ) - lm
        y > zero(T) || throw(DomainError(logm, "The target lies outside the range of the BB9 derivative.",))
        return log(y)
    end

    # For k = θ-1 > 0:
    #     y + k log(y) = 1/δ - log θ - logm.
    # Hence:
    #     y = k W(exp(B/k)/k),
    # evaluated through the existing log-domain Lambert-W helper.
    k = θ - one(T)
    B = inv(δ) - log(θ) - lm
    logv = B / k - log(k)

    logy = log(k) + _log_lambertw_exp(logv)

    # x = θ log(y).
    return θ * logy
end

# In the coordinate x = log(s+c),
#
#     s = exp(x) - c.
#
# Therefore:
#
#     s₁ + s₂ + c = exp(x₁) + exp(x₂) - c.
@inline function _arch_combine(G::Copulas.BB9Generator, a::Real, b::Real,)
    aa, bb = promote(float(a), float(b))
    logc = oftype(aa, _bb9_logc(G))

    total = LogExpFunctions.logaddexp(aa, bb)
    total >= logc || throw(DomainError((a, b), "Invalid BB9 coordinates.",))

    return LogExpFunctions.logsubexp(total, logc)
end

# Recover the target coordinate from
#
#     s_target = s_total - s_base.
#
# In shifted-log coordinates:
#
#     exp(x_target)
#       = exp(x_total) - exp(x_base) + c.
@inline function _arch_difference(G::Copulas.BB9Generator, total::Real, base::Real,)
    tt, bb = promote(float(total), float(base))
    T = typeof(tt)
    logc = T(_bb9_logc(G))

    if tt < bb 
        tol = T(8) * eps(T) * max(abs(tt), abs(bb), one(T))
        bb - tt <= tol || throw(DomainError((total, base), "Expected total ≥ base in the BB9 coordinate.",))
        return logc
    end

    tt == bb && return logc
    # log(exp(tt) - exp(bb) + exp(logc))
    d = tt - bb

    return tt + log(-expm1(-d) + exp(logc - tt),)
end

@inline _arch_hfunc(G::Copulas.BB9Generator, target::Real, base::Real,) = _arch_hfunc_coordinate(G, target, base)
@inline _arch_hinv(G::Copulas.BB9Generator, q::Real, base::Real,) = _arch_hinv_coordinate(G, q, base)

function _inv_ϕ¹(G::Copulas.BB9Generator, y::Real)
    m = _negative_derivative_magnitude(y, "BB9")
    T = typeof(m)

    iszero(m) && return T(Inf)

    # BB9 has finite |ϕ′(0)|, so m = Inf is outside its range
    # and must be handled by _arch_inverse_logderivative.
    x = _arch_inverse_logderivative(G, log(m))

    isinf(x) && return x

    θ, δ, xx = promote(float(G.θ), float(G.δ), x)
    logc = -θ * log(δ)

    # Stable reconstruction: s = exp(x) - exp(logc) = exp(logc) * expm1(x-logc).
    return exp(logc) * expm1(xx - logc)
end

# =====================================================================
# BB10
# =====================================================================

# BB10 uses the original generator coordinate
#
#     s = ϕ⁻¹(u).
#
# Hence Archimedean composition is ordinary addition. The proper
# absolutely continuous parameter domain used here is
#
#     θ > 0,    0 ≤ δ < 1.
#
# Copulas.jl reduces θ = 1 to AMH. The boundary δ = 1 is singular.

@inline function _arch_coordinate(G::Copulas.BB10Generator, u::Real,)
    θ, δ, uu = promote(float(G.θ), float(G.δ), float(u),)
    T = typeof(uu)

    zero(T) < uu <= one(T) || throw(DomainError(u, "The BB10 probability must belong to (0, 1].",))
    zero(T) <= δ < one(T) || throw(DomainError(δ, "The proper BB10 domain requires 0 ≤ δ < 1.",))
    isone(uu) && return zero(T)

    # s = log(δ + (1-δ)u^(-θ))
    # evaluated as a log-sum-exp to avoid constructing u^(-θ).
    logδ = iszero(δ) ? -T(Inf) : log(δ)
    logtail = log1p(-δ) - θ * log(uu)

    return LogExpFunctions.logaddexp(logδ, logtail,)
end

@inline function _arch_probability(G::Copulas.BB10Generator, s::Real,)
    θ, δ, ss = promote(float(G.θ), float(G.δ), float(s),)
    T = typeof(ss)

    ss >= zero(T) || throw(DomainError(s, "The BB10 generator coordinate must be non-negative.",))

    zero(T) <= δ < one(T) || throw(DomainError(δ, "The proper BB10 domain requires 0 ≤ δ < 1.",))
    iszero(ss) && return one(T)
    isinf(ss) && return zero(T)

    # log(exp(s)-δ) = s + log(1-δ exp(-s)).
    q = δ * exp(-ss)
    logden = ss + log1p(-q)

    return exp((log1p(-δ) - logden) / θ,)
end

@inline function _arch_logderivative(G::Copulas.BB10Generator, s::Real,)
    θ, δ, ss = promote(float(G.θ), float(G.δ), float(s),)
    T = typeof(ss)

    ss >= zero(T) || throw(DomainError(s, "The BB10 generator coordinate must be non-negative.",))
    zero(T) <= δ < one(T) || throw(DomainError(δ, "The proper BB10 domain requires 0 ≤ δ < 1.",))
    isinf(ss) && return -T(Inf)

    a = inv(θ)
    q = δ * exp(-ss)

    # log|ϕ′(s)| = -log θ + (1/θ)log(1-δ) - s/θ - (1+1/θ)log(1-δ exp(-s)).
    return -log(θ) + a * log1p(-δ) - a * ss - (one(T) + a) * log1p(-q)
end

function _arch_inverse_logderivative(G::Copulas.BB10Generator, logm::Real,)
    lm = float(logm)
    T = typeof(lm)

    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN.",))
    θ, δ = T(G.θ), T(G.δ)
    θ > zero(T) || throw(DomainError(θ, "The BB10 generator requires θ > 0.",))

    zero(T) <= δ < one(T) || throw(DomainError(δ, "The proper BB10 domain requires 0 ≤ δ < 1.",))

    # At s = 0:
    #     |ϕ′(0)| = 1 / [θ(1-δ)].
    maxlm = -log(θ) - log1p(-δ)

    tol = T(64) * eps(T) * max(one(T), abs(maxlm))

    lm == T(Inf) && throw(DomainError(logm, "The target lies outside the range of the BB10 derivative.",))
    lm > maxlm + tol && throw(DomainError(logm, "The target lies outside the range of the BB10 derivative.",))
    lm >= maxlm - tol && return zero(T)
    lm == -T(Inf) && return T(Inf)

    # When δ = 0:
    #     ϕ(s) = exp(-s/θ),
    #     log|ϕ′(s)| = -log θ - s/θ.
    if iszero(δ) return max(-θ * (lm + log(θ)), zero(T),) end

    # Solve in z = log(s), converting the constrained domain s ≥ 0
    # into an unconstrained real coordinate.
    function f(z)
        s = exp(z)
        return _arch_logderivative(G, s) - lm
    end

    function df(z)
        z == -T(Inf) && return zero(T)
        z == T(Inf) && return -T(Inf)

        s = exp(z)
        isinf(s) && return -T(Inf)

        a = inv(θ)
        q = δ * exp(-s)

        # d/ds log|ϕ′(s)| =
        #   -1/θ - (1+1/θ) q/(1-q).
        dlogm_ds = -a - (one(T) + a) * q / (one(T) - q)
        return s * dlogm_ds
    end
    z = _solve_decreasing_root(f, df, zero(T),)
    return exp(z)
end

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