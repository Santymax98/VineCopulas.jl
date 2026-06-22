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

@inline _arch_combine(::Copulas.BB2Generator, a::Real, b::Real) = _logaddexp_minus_one(a, b)
@inline _arch_difference(::Copulas.BB2Generator, total::Real, base::Real) = _logsubexp_plus_one(total, base)
@inline _arch_hfunc(G::Copulas.BB2Generator, target::Real, base::Real) = _arch_hfunc_coordinate(G, target, base)
@inline _arch_hinv(G::Copulas.BB2Generator, q::Real, base::Real) = _arch_hinv_coordinate(G, q, base)

function _inv_ϕ¹(G::Copulas.BB2Generator, y::Real)
    m = _negative_derivative_magnitude(y, "BB2")
    T = typeof(m)
    iszero(m) && return T(Inf)
    isinf(m) && return zero(T)
    L = _arch_inverse_logderivative(G, log(m))
    return isinf(L) ? L : expm1(L)
end
