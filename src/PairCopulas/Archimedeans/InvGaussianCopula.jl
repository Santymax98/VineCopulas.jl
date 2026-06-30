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