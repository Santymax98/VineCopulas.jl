# -----------------------------------------------------------------------------
# Pair-copula fitting and selection (private engine, public API remains fit)
# -----------------------------------------------------------------------------

# Families that natively admit both signs of monotone association and therefore
# do not need rotated duplicates in the default selection search.
#
# `preselect=true` in this first fitting layer only prunes rotation signs using
# empirical Kendall tau. It intentionally does NOT yet reproduce vinecopulib's
# additional symmetry/tail-shape family preselection heuristics.
@inline function _rotationless_family(FT)
    return FT <: Copulas.GaussianCopula ||
           FT <: Copulas.TCopula ||
           FT <: Copulas.FrankCopula
end

@inline function _base_association_sign(FT)
    FT <: Copulas.GumbelBarnettCopula && return :negative
    FT <: Copulas.AMHCopula && return :both
    _rotationless_family(FT) && return :both
    return :positive
end

@inline function _rotation_candidates(FT, τhat::Real, allow_rotations::Bool, preselect::Bool)
    (!allow_rotations || _rotationless_family(FT)) && return ((),)

    allrots = ((), (1,), (1, 2), (2,))
    !preselect && return allrots

    sgn = _base_association_sign(FT)
    # If the unrotated family spans both signs (currently AMH in the extended
    # family set), keep every orientation: sign alone cannot safely prune it.
    sgn === :both && return allrots

    if abs(τhat) <= 1e-10
        return allrots
    end

    target_positive = τhat > 0
    base_positive = sgn === :positive
    same_sign = target_positive == base_positive
    return same_sign ? ((), (1, 2)) : ((1,), (2,))
end

@inline function _rotation_from_flips(flips::Tuple)
    isempty(flips) && return 0
    flips == (1,) && return 90
    flips == (1, 2) && return 180
    flips == (2,) && return 270
    return -1
end

function _flip_pair_data(U::AbstractMatrix{<:Real}, flips::Tuple)
    isempty(flips) && return U
    X = copy(U)
    @inbounds for i in flips
        @views X[i, :] .= 1 .- X[i, :]
    end
    return X
end

function _short_family_name(C)
    B = C isa Copulas.SurvivalCopula ? C.C : C
    if B isa Copulas.GaussianCopula
        return "Gaussian"
    elseif B isa Copulas.TCopula
        return "Student"
    elseif B isa Copulas.IndependentCopula
        return "Independence"
    elseif B isa Copulas.ArchimedeanCopula
        s = String(nameof(typeof(B.G)))
        return replace(s, "Generator" => "")
    else
        s = String(nameof(typeof(B)))
        return replace(s, "Copula" => "")
    end
end

function _flatten_fit_params(nt::NamedTuple)
    names = String[]
    vals = Float64[]
    for (k, v) in pairs(nt)
        key = String(k)
        if v isa Number
            push!(names, key)
            push!(vals, Float64(v))
        elseif v isa AbstractMatrix
            nr, nc = size(v)
            if nr == nc
                @inbounds for j in 2:nc, i in 1:j-1
                    push!(names, "$(key)_$(i)_$(j)")
                    push!(vals, Float64(v[i, j]))
                end
            else
                @inbounds for j in axes(v, 2), i in axes(v, 1)
                    push!(names, "$(key)_$(i)_$(j)")
                    push!(vals, Float64(v[i, j]))
                end
            end
        elseif v isa AbstractVector
            @inbounds for i in eachindex(v)
                push!(names, "$(key)_$(i)")
                push!(vals, Float64(v[i]))
            end
        elseif v isa Tuple
            @inbounds for i in eachindex(v)
                v[i] isa Number || continue
                push!(names, "$(key)_$(i)")
                push!(vals, Float64(v[i]))
            end
        end
    end
    return names, vals
end

function _params_namedtuple(C::PairCopula, meta::NamedTuple)
    if haskey(meta, :θ̂) && meta.θ̂ isa NamedTuple
        return meta.θ̂
    end
    p = Distributions.params(C)
    return p isa NamedTuple ? p : (; parameters=collect(p))
end

struct _PairSelection
    copula::PairCopula
    family::String
    rotation::Int
    method::Symbol
    loglik::Float64
    npars::Int
    score::Float64
    converged::Bool
    iterations::Int
    theta::NamedTuple
end

@inline function _criterion_score(ll::Real, k::Integer, n::Integer, criterion::Symbol)
    _check_selection_criterion(criterion)
    criterion === :loglik && return -Float64(ll)
    criterion === :aic && return -2.0 * ll + 2.0 * k
    return -2.0 * ll + k * log(n)
end

# Pair-family selection follows the conventional vine-copula parameterization
# used by vinecopulib: the *base* Clayton family has positive dependence and
# negative association is represented by 90/270-degree rotations.  Copulas.jl
# intentionally supports the larger bivariate Clayton domain theta in (-1,Inf);
# direct `fit(ClaytonCopula, ...)` keeps that behavior.  Restricting only the
# selection candidate prevents the generic unconstrained MLE from wandering
# into a negative-theta finite-support region (and yielding -Inf likelihood)
# while keeping the family/rotation search comparable to standard vine tools.
const _VINE_CLAYTON_LO = 1.0e-10
const _VINE_CLAYTON_HI = 28.0

struct _VinePositiveClayton{C<:PairCopula} <: Copulas.Copula{2}
    C::C
end

function _VinePositiveClayton(d::Integer, theta::Real)
    d == 2 || throw(DimensionMismatch("vine pair-copulas are bivariate"))
    (_VINE_CLAYTON_LO < theta < _VINE_CLAYTON_HI) ||
        throw(ArgumentError("vine-selection Clayton theta must lie in ($_VINE_CLAYTON_LO, $_VINE_CLAYTON_HI)"))
    return _VinePositiveClayton(Copulas.ClaytonCopula(2, theta))
end

Distributions.params(C::_VinePositiveClayton) = (; theta=Float64(C.C.G.θ))
Distributions._logpdf(C::_VinePositiveClayton, u) = Distributions.logpdf(C.C, u)

Copulas._example(::Type{_VinePositiveClayton}, d::Int) = _VinePositiveClayton(d, 1.0)
function Copulas._unbound_params(::Type{_VinePositiveClayton}, d::Int, theta::NamedTuple)
    d == 2 || throw(DimensionMismatch("vine pair-copulas are bivariate"))
    x = (Float64(theta.theta) - _VINE_CLAYTON_LO) / (_VINE_CLAYTON_HI - _VINE_CLAYTON_LO)
    x = clamp(x, eps(Float64), 1.0 - eps(Float64))
    return [log(x) - log1p(-x)]
end
function Copulas._rebound_params(::Type{_VinePositiveClayton}, d::Int, alpha::AbstractVector)
    d == 2 || throw(DimensionMismatch("vine pair-copulas are bivariate"))
    length(alpha) == 1 || throw(DimensionMismatch("Clayton has one parameter"))
    sigma = inv(one(alpha[1]) + exp(-alpha[1]))
    # Keep the transformed parameter strictly inside the open interval even
    # when `exp` under/overflows and the logistic saturates at exactly 0 or 1.
    margin = oftype(sigma, eps(Float64))
    s = margin + (one(sigma) - 2margin) * sigma
    theta = _VINE_CLAYTON_LO + (_VINE_CLAYTON_HI - _VINE_CLAYTON_LO) * s
    return (; theta=theta)
end
Copulas._available_fitting_methods(::Type{_VinePositiveClayton}, d) = d == 2 ? (:mle,) : Tuple{}()

# The generic Copulas.jl fallback MLE uses an unconstrained transformed-space
# optimizer.  For weak one-parameter Archimedean dependence this can converge
# to the independence boundary even when the bounded likelihood has a clear
# interior optimum.  Use Brent directly on the finite vine-selection interval
# for the wrappers where this behaviour has been observed.  This is
# derivative-free, deterministic, and keeps the optimization in exactly the
# same parameter domain used by vinecopulib.
function _fit_vine_scalar_bounded(
    WT::Type,
    U,
    lo::Real,
    hi::Real;
    xtol::Real=1.0e-10,
)
    a = nextfloat(Float64(lo))
    b = prevfloat(Float64(hi))
    a < b || throw(ArgumentError("invalid scalar vine-fitting interval ($lo, $hi)"))

    objective(theta) = begin
        C = WT(2, theta)
        ll = Float64(Distributions.loglikelihood(C, U))
        isfinite(ll) ? -ll : Inf
    end

    res = Optim.optimize(
        objective,
        a,
        b,
        Optim.Brent();
        abs_tol=Float64(xtol),
    )
    theta = Float64(Optim.minimizer(res))
    C = WT(2, theta)
    return C, (;
        θ̂=(; theta=theta),
        optimizer=Optim.summary(res),
        converged=Optim.converged(res),
        iterations=Optim.iterations(res),
    )
end

# For bivariate Gaussian pair-copula selection, maximize the copula
# likelihood directly in rho.  The public Copulas.jl Gaussian `:mle` currently
# obtains a correlation matrix from a fitted normal-score MvNormal model; the
# two estimators need not coincide in finite samples and can therefore change
# an AIC/BIC family choice.
const _VINE_GAUSSIAN_RHO_LO = -1.0
const _VINE_GAUSSIAN_RHO_HI = 1.0
const _VINE_FRANK_LO = -35.0
const _VINE_FRANK_HI = 35.0

function _fit_vine_gaussian(U; xtol::Real=1.0e-10)
    C, meta = _fit_vine_scalar_bounded(
        Copulas.GaussianCopula,
        U,
        _VINE_GAUSSIAN_RHO_LO,
        _VINE_GAUSSIAN_RHO_HI;
        xtol=xtol,
    )

    rho = Float64(meta.θ̂.theta)
    # `GaussianCopula(2, 0)` is canonicalized by Copulas.jl to the independent
    # copula.  Keep this candidate identifiable as Gaussian for family
    # selection by using the nearest practically equivalent interior value.
    if iszero(rho)
        rho = eps(Float64)
        C = Copulas.GaussianCopula(2, rho)
    end

    return C, (; meta..., θ̂=Distributions.params(C))
end


function _fit_vine_frank(U; xtol::Real=1.0e-10)
    C, meta = _fit_vine_scalar_bounded(
        Copulas.FrankCopula, U, _VINE_FRANK_LO, _VINE_FRANK_HI; xtol=xtol
    )
    theta = Float64(meta.θ̂.theta)
    if iszero(theta) || C isa Copulas.IndependentCopula
        theta = sqrt(eps(Float64))
        C = Copulas.FrankCopula(2, theta)
    end
    return C, (; meta..., θ̂=Distributions.params(C))
end

function Copulas._fit(
    ::Type{_VinePositiveClayton}, U, ::Val{:mle}; xtol::Real=1.0e-10
)
    return _fit_vine_scalar_bounded(
        _VinePositiveClayton, U, _VINE_CLAYTON_LO, _VINE_CLAYTON_HI; xtol=xtol
    )
end

# Student-t, Gumbel, and Joe use finite parameter ranges in vinecopulib.
# Copulas.jl intentionally exposes broader mathematical domains (notably
# Student-t nu > 0), but using those broader domains inside automatic vine
# selection changes the candidate model space and can change AIC/BIC family
# choices.  The wrappers below align *selection only* with vinecopulib while
# leaving direct family fits in Copulas.jl unchanged.
const _VINE_STUDENT_RHO_LO = -1.0
const _VINE_STUDENT_RHO_HI = 1.0
const _VINE_STUDENT_NU_LO = 2.0
const _VINE_STUDENT_NU_HI = 50.0
const _VINE_GUMBEL_LO = 1.0
const _VINE_GUMBEL_HI = 50.0
const _VINE_JOE_LO = 1.0
const _VINE_JOE_HI = 30.0

@inline function _vine_bounded_unbound(theta::Real, lo::Real, hi::Real)
    x = (Float64(theta) - lo) / (hi - lo)
    x = clamp(x, eps(Float64), 1.0 - eps(Float64))
    return [log(x) - log1p(-x)]
end

@inline function _vine_bounded_rebound(alpha::AbstractVector, lo::Real, hi::Real)
    length(alpha) == 1 || throw(DimensionMismatch("one-parameter pair-copula expected"))
    sigma = inv(one(alpha[1]) + exp(-alpha[1]))
    margin = oftype(sigma, eps(Float64))
    s = margin + (one(sigma) - 2margin) * sigma
    return lo + (hi - lo) * s
end

struct _VineBoundedStudent{C<:PairCopula} <: Copulas.Copula{2}
    C::C
end
function _VineBoundedStudent(d::Integer, rho::Real, nu::Real)
    d == 2 || throw(DimensionMismatch("vine pair-copulas are bivariate"))
    (_VINE_STUDENT_RHO_LO < rho < _VINE_STUDENT_RHO_HI) ||
        throw(ArgumentError("vine-selection Student rho must lie in ($_VINE_STUDENT_RHO_LO, $_VINE_STUDENT_RHO_HI)"))
    (_VINE_STUDENT_NU_LO < nu < _VINE_STUDENT_NU_HI) ||
        throw(ArgumentError("vine-selection Student nu must lie in ($_VINE_STUDENT_NU_LO, $_VINE_STUDENT_NU_HI)"))
    Sigma = [one(rho) rho; rho one(rho)]
    return _VineBoundedStudent(Copulas.TCopula(nu, Sigma))
end
Distributions.params(C::_VineBoundedStudent) = begin
    p = Distributions.params(C.C)
    (; rho = Float64(p.Σ[1, 2]), nu = Float64(p.ν))
end
Distributions._logpdf(C::_VineBoundedStudent, u) = Distributions.logpdf(C.C, u)
Copulas._example(::Type{_VineBoundedStudent}, d::Int) = _VineBoundedStudent(d, 0.2, 5.0)
function Copulas._unbound_params(::Type{_VineBoundedStudent}, d::Int, theta::NamedTuple)
    d == 2 || throw(DimensionMismatch("vine pair-copulas are bivariate"))
    return vcat(
        _vine_bounded_unbound(theta.rho, _VINE_STUDENT_RHO_LO, _VINE_STUDENT_RHO_HI),
        _vine_bounded_unbound(theta.nu, _VINE_STUDENT_NU_LO, _VINE_STUDENT_NU_HI),
    )
end
function Copulas._rebound_params(::Type{_VineBoundedStudent}, d::Int, alpha::AbstractVector)
    d == 2 || throw(DimensionMismatch("vine pair-copulas are bivariate"))
    length(alpha) == 2 || throw(DimensionMismatch("Student pair-copula has two parameters"))
    rho = _vine_bounded_rebound(@view(alpha[1:1]), _VINE_STUDENT_RHO_LO, _VINE_STUDENT_RHO_HI)
    nu = _vine_bounded_rebound(@view(alpha[2:2]), _VINE_STUDENT_NU_LO, _VINE_STUDENT_NU_HI)
    return (; rho=rho, nu=nu)
end
Copulas._available_fitting_methods(::Type{_VineBoundedStudent}, d) = d == 2 ? (:mle,) : Tuple{}()

struct _VineBoundedGumbel{C<:PairCopula} <: Copulas.Copula{2}
    C::C
end
function _VineBoundedGumbel(d::Integer, theta::Real)
    d == 2 || throw(DimensionMismatch("vine pair-copulas are bivariate"))
    (_VINE_GUMBEL_LO < theta < _VINE_GUMBEL_HI) ||
        throw(ArgumentError("vine-selection Gumbel theta must lie in ($_VINE_GUMBEL_LO, $_VINE_GUMBEL_HI)"))
    return _VineBoundedGumbel(Copulas.GumbelCopula(2, theta))
end
Distributions.params(C::_VineBoundedGumbel) = (; theta=Float64(C.C.G.θ))
Distributions._logpdf(C::_VineBoundedGumbel, u) = Distributions.logpdf(C.C, u)
Copulas._example(::Type{_VineBoundedGumbel}, d::Int) = _VineBoundedGumbel(d, 1.5)
Copulas._unbound_params(::Type{_VineBoundedGumbel}, d::Int, theta::NamedTuple) =
    _vine_bounded_unbound(theta.theta, _VINE_GUMBEL_LO, _VINE_GUMBEL_HI)
Copulas._rebound_params(::Type{_VineBoundedGumbel}, d::Int, alpha::AbstractVector) =
    (; theta=_vine_bounded_rebound(alpha, _VINE_GUMBEL_LO, _VINE_GUMBEL_HI))
Copulas._available_fitting_methods(::Type{_VineBoundedGumbel}, d) = d == 2 ? (:mle,) : Tuple{}()

function Copulas._fit(
    ::Type{_VineBoundedGumbel}, U, ::Val{:mle}; xtol::Real=1.0e-10
)
    return _fit_vine_scalar_bounded(
        _VineBoundedGumbel, U, _VINE_GUMBEL_LO, _VINE_GUMBEL_HI; xtol=xtol
    )
end

struct _VineBoundedJoe{C<:PairCopula} <: Copulas.Copula{2}
    C::C
end
function _VineBoundedJoe(d::Integer, theta::Real)
    d == 2 || throw(DimensionMismatch("vine pair-copulas are bivariate"))
    (_VINE_JOE_LO < theta < _VINE_JOE_HI) ||
        throw(ArgumentError("vine-selection Joe theta must lie in ($_VINE_JOE_LO, $_VINE_JOE_HI)"))
    return _VineBoundedJoe(Copulas.JoeCopula(2, theta))
end
Distributions.params(C::_VineBoundedJoe) = (; theta=Float64(C.C.G.θ))
Distributions._logpdf(C::_VineBoundedJoe, u) = Distributions.logpdf(C.C, u)
Copulas._example(::Type{_VineBoundedJoe}, d::Int) = _VineBoundedJoe(d, 1.5)
Copulas._unbound_params(::Type{_VineBoundedJoe}, d::Int, theta::NamedTuple) =
    _vine_bounded_unbound(theta.theta, _VINE_JOE_LO, _VINE_JOE_HI)
Copulas._rebound_params(::Type{_VineBoundedJoe}, d::Int, alpha::AbstractVector) =
    (; theta=_vine_bounded_rebound(alpha, _VINE_JOE_LO, _VINE_JOE_HI))
Copulas._available_fitting_methods(::Type{_VineBoundedJoe}, d) = d == 2 ? (:mle,) : Tuple{}()


# BB1/BB6/BB7/BB8 use the finite parameter boxes from vinecopulib during
# automatic selection.  The public Copulas.jl constructors and direct fits are
# not restricted by these bounds; this only aligns the candidate model space
# used by the vine selector and by the external correctness gate.
const _VINE_BB1_LO = (0.0, 1.0)
const _VINE_BB1_HI = (7.0, 7.0)
const _VINE_BB6_LO = (1.0, 1.0)
const _VINE_BB6_HI = (6.0, 8.0)
const _VINE_BB7_LO = (1.0, 0.01)
const _VINE_BB7_HI = (6.0, 25.0)
const _VINE_BB8_LO = (1.0, 1.0e-4)
const _VINE_BB8_HI = (8.0, 1.0)

@inline function _vine_box_alpha(frac::Real)
    f = clamp(Float64(frac), 1.0e-8, 1.0 - 1.0e-8)
    return log(f) - log1p(-f)
end

@inline function _vine_box_parameter(alpha::Real, lo::Real, hi::Real)
    sigma = inv(one(alpha) + exp(-alpha))
    margin = oftype(sigma, eps(Float64))
    s = margin + (one(sigma) - 2margin) * sigma
    return Float64(lo) + (Float64(hi) - Float64(lo)) * s
end

function _fit_vine_two_parameter_bounded(
    FT,
    U,
    lo::NTuple{2,<:Real},
    hi::NTuple{2,<:Real};
    starts=((0.1, 0.1), (0.25, 0.5), (0.5, 0.25), (0.5, 0.5), (0.75, 0.75)),
    xtol::Real=1.0e-8,
)
    all(lo[i] < hi[i] for i in 1:2) ||
        throw(ArgumentError("invalid two-parameter vine-fitting box: $lo -- $hi"))

    function candidate(alpha)
        p1 = _vine_box_parameter(alpha[1], lo[1], hi[1])
        p2 = _vine_box_parameter(alpha[2], lo[2], hi[2])
        return FT(2, p1, p2)
    end

    function objective(alpha)
        ll = Float64(Distributions.loglikelihood(candidate(alpha), U))
        return isfinite(ll) ? -ll : Inf
    end

    best_res = nothing
    best_value = Inf
    options = Optim.Options(
        x_abstol=Float64(xtol),
        f_abstol=Float64(xtol),
        iterations=1_500,
        show_trace=false,
    )

    for frac in starts
        alpha0 = [_vine_box_alpha(frac[1]), _vine_box_alpha(frac[2])]
        value0 = objective(alpha0)
        isfinite(value0) || continue
        res = Optim.optimize(objective, alpha0, Optim.NelderMead(), options)
        value = Float64(Optim.minimum(res))
        if isfinite(value) && value < best_value
            best_value = value
            best_res = res
        end
    end

    best_res === nothing && throw(ErrorException(
        "no finite likelihood found for $FT inside the vine-selection parameter box"
    ))

    C = candidate(Optim.minimizer(best_res))
    theta = Distributions.params(C)
    ll = Float64(Distributions.loglikelihood(C, U))
    isfinite(ll) || throw(ErrorException("non-finite optimized likelihood for $FT"))
    return C, (;
        θ̂=theta,
        optimizer=Optim.summary(best_res),
        converged=Optim.converged(best_res),
        iterations=Optim.iterations(best_res),
    )
end

function _fit_vine_bb(FT, U; xtol::Real=1.0e-8)
    if FT <: Copulas.BB1Copula
        starts = ((0.02, 0.02), (0.1, 0.1), (0.25, 0.5), (0.5, 0.25), (0.5, 0.5))
        return _fit_vine_two_parameter_bounded(FT, U, _VINE_BB1_LO, _VINE_BB1_HI; starts, xtol)
    elseif FT <: Copulas.BB6Copula
        starts = ((0.02, 0.02), (0.1, 0.1), (0.25, 0.5), (0.5, 0.25), (0.5, 0.5))
        return _fit_vine_two_parameter_bounded(FT, U, _VINE_BB6_LO, _VINE_BB6_HI; starts, xtol)
    elseif FT <: Copulas.BB7Copula
        starts = ((0.02, 0.04), (0.1, 0.1), (0.25, 0.5), (0.5, 0.25), (0.5, 0.5))
        return _fit_vine_two_parameter_bounded(FT, U, _VINE_BB7_LO, _VINE_BB7_HI; starts, xtol)
    elseif FT <: Copulas.BB8Copula
        starts = ((0.02, 0.98), (0.1, 0.9), (0.25, 0.5), (0.5, 0.75), (0.5, 0.5))
        return _fit_vine_two_parameter_bounded(FT, U, _VINE_BB8_LO, _VINE_BB8_HI; starts, xtol)
    end
    throw(ArgumentError("$FT is not a bounded default BB family"))
end

function _fit_one_pair_family(
    FT,
    U::Matrix{Float64},
    flips::Tuple;
    pair_method::Symbol,
    selection_criterion::Symbol,
    pair_kwargs::NamedTuple,
)
    Uf = _flip_pair_data(U, flips)
    method = Copulas._find_method(FT, 2, pair_method)

    # Automatic vine selection uses pair-specific MLE domains/solvers where
    # an exact bivariate copula likelihood or a vinecopulib-aligned finite
    # parameter domain is required.
    if FT <: Copulas.GaussianCopula && method === :mle
        C0, meta = _fit_vine_gaussian(Uf; pair_kwargs...)
    elseif FT <: Copulas.TCopula && method === :mle
        W, meta = Copulas._fit(_VineBoundedStudent, Uf, Val{:mle}(); pair_kwargs...)
        C0 = W.C
        meta = (; meta..., θ̂=Distributions.params(C0))
    elseif FT <: Copulas.ClaytonCopula && method === :mle
        W, meta = Copulas._fit(_VinePositiveClayton, Uf, Val{:mle}(); pair_kwargs...)
        C0 = W.C
        meta = (; meta..., θ̂=(; θ=C0.G.θ))
    elseif FT <: Copulas.FrankCopula && method === :mle
        C0, meta = _fit_vine_frank(Uf; pair_kwargs...)
    elseif FT <: Copulas.GumbelCopula && method === :mle
        W, meta = Copulas._fit(_VineBoundedGumbel, Uf, Val{:mle}(); pair_kwargs...)
        C0 = W.C
        meta = (; meta..., θ̂=(; θ=C0.G.θ))
    elseif FT <: Copulas.JoeCopula && method === :mle
        W, meta = Copulas._fit(_VineBoundedJoe, Uf, Val{:mle}(); pair_kwargs...)
        C0 = W.C
        meta = (; meta..., θ̂=(; θ=C0.G.θ))
    elseif method === :mle && (
        FT <: Copulas.BB1Copula || FT <: Copulas.BB6Copula ||
        FT <: Copulas.BB7Copula || FT <: Copulas.BB8Copula
    )
        C0, meta = _fit_vine_bb(FT, Uf; pair_kwargs...)
    else
        C0, meta = Copulas._fit(FT, Uf, Val{method}(); pair_kwargs...)
    end

    C0 isa PairCopula || throw(ArgumentError(
        "family $FT did not produce a bivariate copula when fitted to 2×n data"
    ))
    C = isempty(flips) ? C0 : Copulas.SurvivalCopula(C0, flips)

    # A rotation is fitted by reflecting the data and fitting the unrotated
    # base family. Its likelihood is therefore exactly the base likelihood on
    # the reflected sample (the reflection has unit Jacobian). Evaluate the
    # score in that numerically safer representation instead of re-evaluating
    # a SurvivalCopula wrapper on the original sample. This matters for BB
    # families near their selection boundaries.
    ll = Float64(Distributions.loglikelihood(C0, Uf))
    isfinite(ll) || throw(ErrorException("non-finite pair-copula loglikelihood for $FT"))

    θ = _params_namedtuple(C0, meta)
    _, vals = _flatten_fit_params(θ)
    all(isfinite, vals) || throw(ErrorException("non-finite fitted parameters for $FT"))

    k = length(vals)
    score = _criterion_score(ll, k, size(U, 2), selection_criterion)
    isfinite(score) || throw(ErrorException("non-finite selection score for $FT"))
    return _PairSelection(
        C,
        _short_family_name(C),
        _rotation_from_flips(flips),
        method,
        ll,
        k,
        score,
        get(meta, :converged, true),
        Int(get(meta, :iterations, 0)),
        θ,
    )
end

function _independence_selection(U::Matrix{Float64}, criterion::Symbol)
    C = Copulas.IndependentCopula(2)
    ll = 0.0
    return _PairSelection(
        C, "Independence", 0, :none, ll, 0,
        _criterion_score(ll, 0, size(U, 2), criterion),
        true, 0, (;),
    )
end

function _select_pair(
    U0::AbstractMatrix{<:Real};
    family_set=:default,
    pair_method::Symbol=:default,
    selection_criterion::Symbol=:bic,
    allow_rotations::Bool=true,
    preselect::Bool=true,
    include_independence::Bool=true,
    pair_kwargs::NamedTuple=NamedTuple(),
    strict::Bool=false,
    trace::Bool=false,
    force_independence::Bool=false,
)
    U = _fit_data(U0, 2)
    _check_selection_criterion(selection_criterion)
    force_independence && return _independence_selection(U, selection_criterion)

    families = _resolve_family_set(family_set)
    τhat = _kendall_tau_b(view(U, 1, :), view(U, 2, :))

    best = include_independence ? _independence_selection(U, selection_criterion) : nothing
    nsuccessful = 0

    for FT in families
        (FT isa Type || FT isa UnionAll) ||
            throw(ArgumentError("family_set entries must be copula types; got $FT"))
        FT <: Copulas.Copula ||
            throw(ArgumentError("family $FT is not a Copulas.jl copula type"))

        for flips in _rotation_candidates(FT, τhat, allow_rotations, preselect)
            try
                fit = _fit_one_pair_family(
                    FT, U, flips;
                    pair_method=pair_method,
                    selection_criterion=selection_criterion,
                    pair_kwargs=pair_kwargs,
                )
                nsuccessful += 1
                if trace
                    println(
                        "pair candidate: family=$(fit.family), rotation=$(fit.rotation), ",
                        "method=$(fit.method), ll=$(fit.loglik), score=$(fit.score)"
                    )
                end
                if best === nothing || fit.score < best.score
                    best = fit
                end
            catch err
                strict && rethrow()
                trace && println("pair candidate failed: family=$FT flips=$flips error=$err")
            end
        end
    end

    if !isempty(families) && nsuccessful == 0
        throw(ErrorException(
            "all non-independence pair-copula candidates failed; " *
            "rerun with strict=true or trace=true for diagnostics"
        ))
    end
    best === nothing && throw(ErrorException(
        "no pair-copula candidate was available"
    ))
    return best
end

# Exact public abstract-pair fitting hook.
Copulas._available_fitting_methods(::Type{PairCopula}, d) =
    d == 2 ? (:select,) : Tuple{}()

function Copulas._fit(
    ::Type{PairCopula},
    U,
    ::Val{:select};
    family_set=:default,
    pair_method::Symbol=:default,
    selection_criterion::Symbol=:bic,
    allow_rotations::Bool=true,
    preselect::Bool=true,
    include_independence::Bool=true,
    pair_kwargs::NamedTuple=NamedTuple(),
    strict::Bool=false,
    trace::Bool=false,
    full_metadata::Bool=true,
)
    fit = _select_pair(
        U;
        family_set=family_set,
        pair_method=pair_method,
        selection_criterion=selection_criterion,
        allow_rotations=allow_rotations,
        preselect=preselect,
        include_independence=include_independence,
        pair_kwargs=pair_kwargs,
        strict=strict,
        trace=trace,
    )

    full_metadata || return fit.copula, (;)
    return fit.copula, (
        θ̂=fit.theta,
        selected_family=fit.family,
        rotation=fit.rotation,
        pair_method=fit.method,
        selection_criterion=selection_criterion,
        selected_score=fit.score,
        family_set=family_set,
        allow_rotations=allow_rotations,
        preselect=preselect,
        include_independence=include_independence,
        candidate_failures=nothing,  # keep full model lightweight by default
        converged=fit.converged,
        iterations=fit.iterations,
    )
end

# -----------------------------------------------------------------------------
# Pair orientation helper for graph -> matrix conversion
# -----------------------------------------------------------------------------

# Most default families are exchangeable before rotation. For such families,
# swapping arguments only swaps the SurvivalCopula flip indices.
@inline function _exchangeable_base(C)
    return C isa Copulas.GaussianCopula ||
           C isa Copulas.TCopula ||
           C isa Copulas.IndependentCopula ||
           C isa Copulas.ArchimedeanCopula
end

@inline _survival_flips(::Copulas.SurvivalCopula{D,CT,F}) where {D,CT,F} = F

struct _SwappedPairCopula{C<:PairCopula} <: Copulas.Copula{2}
    C::C
end

Distributions.params(S::_SwappedPairCopula) = Distributions.params(S.C)

function Distributions._logpdf(S::_SwappedPairCopula, u)
    length(u) == 2 || throw(DimensionMismatch("a swapped pair copula is bivariate"))
    return Distributions.logpdf(S.C, [u[2], u[1]])
end

@inline hfunc1(S::_SwappedPairCopula, u::Real, v::Real) = hfunc2(S.C, v, u)
@inline hfunc2(S::_SwappedPairCopula, u::Real, v::Real) = hfunc1(S.C, v, u)

@inline function _pair_logpdf(S::_SwappedPairCopula, u::Real, v::Real, buf::Vector{Float64})
    return _pair_logpdf(S.C, v, u, buf)
end

@inline function _pair_hfuncs(S::_SwappedPairCopula, u::Real, v::Real)
    base_h1, base_h2 = _pair_hfuncs(S.C, v, u)
    return base_h2, base_h1
end

@inline function _pair_step(S::_SwappedPairCopula, u::Real, v::Real, buf::Vector{Float64})
    logc, base_h1, base_h2 = _pair_step(S.C, v, u, buf)
    return logc, base_h2, base_h1
end

@inline function _pair_logpdf_h1(S::_SwappedPairCopula, u::Real, v::Real, buf::Vector{Float64})
    logc, base_h2 = _pair_logpdf_h2(S.C, v, u, buf)
    return logc, base_h2
end

@inline function _pair_logpdf_h2(S::_SwappedPairCopula, u::Real, v::Real, buf::Vector{Float64})
    logc, base_h1 = _pair_logpdf_h1(S.C, v, u, buf)
    return logc, base_h1
end

@inline hinv1(S::_SwappedPairCopula, q::Real, v::Real) = hinv2(S.C, q, v)
@inline hinv2(S::_SwappedPairCopula, q::Real, u::Real) = hinv1(S.C, q, u)
_swap_pair(S::_SwappedPairCopula) = S.C

function _swap_pair(S::Copulas.SurvivalCopula)
    if _exchangeable_base(S.C)
        flips = _survival_flips(S)
        swapped = Tuple(sort(Int[3 - i for i in flips]))
        return Copulas.SurvivalCopula(S.C, swapped)
    end
    return _SwappedPairCopula(S)
end

_swap_pair(C::PairCopula) = _exchangeable_base(C) ? C : _SwappedPairCopula(C)
