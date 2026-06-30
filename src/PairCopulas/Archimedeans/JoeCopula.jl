# ---------------------------------------------------------------------
# JoeCopula pair-copula density hook
# ---------------------------------------------------------------------
# This family currently uses the Archimedean generator formula implemented in
# _arch_pair_logpdf_generic. The separate method is intentional: it gives this
# rvinecopulib-compatible family a stable place for a closed-form density
# implementation without touching the vine engines.

@inline _arch_pair_logpdf(G::Copulas.JoeGenerator, u::Real, v::Real) = _arch_pair_logpdf_generic(G, u, v)

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
