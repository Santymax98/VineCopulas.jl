# -----------------------------------------------------------------------------
# Pair-copula fitting and selection (Vine-owned engine; public API: select_paircopula)
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

@inline function _rotation_of(C)
    C isa _ReflectedPairCopula || return 0
    return _rotation_from_flips(Copulas.flips(C))
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
    B = C isa _ReflectedPairCopula ? Copulas.basecopula(C) : C
    if B isa Copulas.GaussianCopula
        return "Gaussian"
    elseif B isa Copulas.TCopula
        return "Student"
    elseif B isa Copulas.IndependentCopula
        return "Independence"
    else
        s = String(nameof(typeof(B)))
        # Older Copulas releases expose these public families as type aliases.
        if s == "ArchimedeanCopula"
            for name in (:Clayton, :Frank, :Gumbel, :Joe, :BB1, :BB2, :BB3,
                         :BB6, :BB7, :BB8, :BB9, :BB10, :AMH, :GumbelBarnett, :InvGaussian)
                FT = getproperty(Copulas, Symbol(name, :Copula))
                B isa FT && return String(name)
            end
        end
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

# The generic Copulas.jl fallback MLE uses an unconstrained transformed-space
# optimizer.  For weak one-parameter Archimedean dependence this can converge
# to the independence boundary even when the bounded likelihood has a clear
# interior optimum.  Use Brent directly on the finite vine-selection interval
# for the families where this behaviour has been observed.  This is
# derivative-free, deterministic, and keeps the optimization in exactly the
# same parameter domain used by vinecopulib.
function _fit_vine_scalar_bounded(constructor, U, lo::Real, hi::Real; xtol::Real=1.0e-10,)
    a = nextfloat(Float64(lo))
    b = prevfloat(Float64(hi))
    a < b || throw(ArgumentError("invalid scalar vine-fitting interval ($lo, $hi)"))

    objective(theta) = begin
        C = constructor(theta)
        ll = Float64(Distributions.loglikelihood(C, U))
        isfinite(ll) ? -ll : Inf
    end

    res = Optim.optimize(objective, a, b, Optim.Brent(); abs_tol=Float64(xtol),)
    theta = Float64(Optim.minimizer(res))
    C = constructor(theta)
    return C, (;θ̂=(; theta=theta), optimizer=Optim.summary(res), converged=Optim.converged(res), iterations=Optim.iterations(res),)
end

const _VINE_FRANK_LO = -35.0
const _VINE_FRANK_HI = 35.0

function _fit_vine_frank(U; xtol::Real=1.0e-10)
    C, meta = _fit_vine_scalar_bounded(theta -> Copulas.FrankCopula(2, theta), U, _VINE_FRANK_LO, _VINE_FRANK_HI; xtol=xtol)
    theta = Float64(meta.θ̂.theta)
    if iszero(theta) || C isa Copulas.IndependentCopula
        theta = sqrt(eps(Float64))
        C = Copulas.FrankCopula(2, theta)
    end
    return C, (; meta..., θ̂=Distributions.params(C))
end


# Student-t, Gumbel, and Joe use finite parameter ranges in vinecopulib.
# Copulas.jl intentionally exposes broader mathematical domains (notably
# Student-t nu > 0), but using those broader domains inside automatic vine
# selection changes the candidate model space and can change AIC/BIC family
# choices.  The local optimizers align *selection only* with vinecopulib while
# leaving direct family fits in Copulas.jl unchanged.
const _VINE_STUDENT_RHO_LO = -1.0
const _VINE_STUDENT_RHO_HI = 1.0
const _VINE_STUDENT_NU_LO = 2.0
const _VINE_STUDENT_NU_HI = 50.0
const _VINE_GUMBEL_LO = 1.0
const _VINE_GUMBEL_HI = 50.0
const _VINE_JOE_LO = 1.0
const _VINE_JOE_HI = 30.0

# Preserve Joe's transformed-space L-BFGS estimator without a wrapper copula.
function _fit_vine_joe(U; weights=nothing)
    if weights !== nothing
        weights isa AbstractVector{<:Real} || throw(ArgumentError("weights must be a vector of non-negative reals"))
        length(weights) == size(U, 2) || throw(DimensionMismatch("observation weights must match the data"))
        all(isfinite, weights) && all(w -> w >= 0, weights) && sum(weights) > 0 ||
            throw(ArgumentError("weights must be finite, non-negative, and not all zero"))
        weights = weights .* (size(U, 2) / sum(weights))
        kept = findall(!iszero, weights)
        U, weights = U[:, kept], weights[kept]
    end
    lo, hi = _VINE_JOE_LO, _VINE_JOE_HI
    x = clamp((1.5 - lo) / (hi - lo), eps(Float64), 1.0 - eps(Float64))
    alpha0 = [log(x) - log1p(-x)]
    candidate(alpha) = Copulas.JoeCopula(2, _vine_box_parameter(alpha[1], lo, hi))
    function objective(alpha)
        C = candidate(alpha)
        weights === nothing && return -Distributions.loglikelihood(C, U)
        length(weights) == size(U, 2) || throw(DimensionMismatch("observation weights must match the data"))
        return -sum(weights[i] * Distributions.logpdf(C, view(U, :, i)) for i in axes(U, 2))
    end
    gradient!(g, alpha) = ForwardDiff.gradient!(g, objective, alpha)
    res = Optim.optimize(objective, gradient!, alpha0, Optim.LBFGS())
    C = candidate(Optim.minimizer(res))
    return C, (; θ̂=(; θ=Distributions.params(C).θ))
end

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

function _fit_vine_two_parameter_bounded(constructor, U, lo::NTuple{2,<:Real}, hi::NTuple{2,<:Real};
    starts=((0.1, 0.1), (0.25, 0.5), (0.5, 0.25), (0.5, 0.5), (0.75, 0.75)), xtol::Real=1.0e-8,)
    all(lo[i] < hi[i] for i in 1:2) || throw(ArgumentError("invalid two-parameter vine-fitting box: $lo -- $hi"))
    function candidate(alpha)
        p1 = _vine_box_parameter(alpha[1], lo[1], hi[1])
        p2 = _vine_box_parameter(alpha[2], lo[2], hi[2])
        return constructor(p1, p2)
    end
    function objective(alpha)
        ll = Float64(Distributions.loglikelihood(candidate(alpha), U))
        return isfinite(ll) ? -ll : Inf
    end
    best_res = nothing
    best_value = Inf
    options = Optim.Options(x_abstol=Float64(xtol), f_abstol=Float64(xtol), iterations=1_500, show_trace=false,)
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
        "no finite likelihood found for $constructor inside the vine-selection parameter box"
    ))
    C = candidate(Optim.minimizer(best_res))
    theta = Distributions.params(C)
    ll = Float64(Distributions.loglikelihood(C, U))
    isfinite(ll) || throw(ErrorException("non-finite optimized likelihood for $constructor"))
    return C, (;θ̂=theta, optimizer=Optim.summary(best_res), converged=Optim.converged(best_res), iterations=Optim.iterations(best_res),)
end

function _fit_vine_bb(FT, U; xtol::Real=1.0e-8)
    constructor(theta, delta) = FT(2, theta, delta)
    if FT <: Copulas.BB1Copula
        starts = ((0.02, 0.02), (0.1, 0.1), (0.25, 0.5), (0.5, 0.25), (0.5, 0.5))
        return _fit_vine_two_parameter_bounded(constructor, U, _VINE_BB1_LO, _VINE_BB1_HI; starts, xtol)
    elseif FT <: Copulas.BB6Copula
        starts = ((0.02, 0.02), (0.1, 0.1), (0.25, 0.5), (0.5, 0.25), (0.5, 0.5))
        return _fit_vine_two_parameter_bounded(constructor, U, _VINE_BB6_LO, _VINE_BB6_HI; starts, xtol)
    elseif FT <: Copulas.BB7Copula
        starts = ((0.02, 0.04), (0.1, 0.1), (0.25, 0.5), (0.5, 0.25), (0.5, 0.5))
        return _fit_vine_two_parameter_bounded(constructor, U, _VINE_BB7_LO, _VINE_BB7_HI; starts, xtol)
    elseif FT <: Copulas.BB8Copula
        starts = ((0.02, 0.98), (0.1, 0.9), (0.25, 0.5), (0.5, 0.75), (0.5, 0.5))
        return _fit_vine_two_parameter_bounded(constructor, U, _VINE_BB8_LO, _VINE_BB8_HI; starts, xtol)
    end
    throw(ArgumentError("$FT is not a bounded default BB family"))
end

function _fit_one_pair_family(FT, U::Matrix{Float64}, flips::Tuple; pair_method::Symbol, selection_criterion::Symbol, pair_kwargs::NamedTuple,)
    Uf = _flip_pair_data(U, flips)
    method = pair_method === :default ? :mle : pair_method

    # Automatic vine selection uses pair-specific MLE domains/solvers where
    # an exact bivariate copula likelihood or a vinecopulib-aligned finite
    # parameter domain is required.
    if FT <: Copulas.GaussianCopula && method === :mle
        C0 = Distributions.fit(FT, Uf; method=:mle, pair_kwargs...)
        meta = (; θ̂=Distributions.params(C0))
    elseif FT <: Copulas.TCopula && method === :mle
        C0, meta = _fit_vine_two_parameter_bounded(
            (rho, nu) -> Copulas.TCopula(nu, [1.0 rho; rho 1.0]), Uf,
            (_VINE_STUDENT_RHO_LO, _VINE_STUDENT_NU_LO),
            (_VINE_STUDENT_RHO_HI, _VINE_STUDENT_NU_HI);
            pair_kwargs...,
        )
        meta = (; meta..., θ̂=Distributions.params(C0))
    elseif FT <: Copulas.ClaytonCopula && method === :mle
        C0, meta = _fit_vine_scalar_bounded(theta -> Copulas.ClaytonCopula(2, theta), Uf, _VINE_CLAYTON_LO, _VINE_CLAYTON_HI; pair_kwargs...,)
        meta = (; meta..., θ̂=(; θ=Distributions.params(C0).θ))
    elseif FT <: Copulas.FrankCopula && method === :mle
        C0, meta = _fit_vine_frank(Uf; pair_kwargs...)
    elseif FT <: Copulas.GumbelCopula && method === :mle
        C0, meta = _fit_vine_scalar_bounded(theta -> Copulas.GumbelCopula(2, theta), Uf, _VINE_GUMBEL_LO, _VINE_GUMBEL_HI; pair_kwargs...,)
        meta = (; meta..., θ̂=(; θ=Distributions.params(C0).θ))
    elseif FT <: Copulas.JoeCopula && method === :mle
        C0, meta = _fit_vine_joe(Uf; pair_kwargs...)
    elseif method === :mle && (
        FT <: Copulas.BB1Copula || FT <: Copulas.BB6Copula ||
        FT <: Copulas.BB7Copula || FT <: Copulas.BB8Copula
    )
        C0, meta = _fit_vine_bb(FT, Uf; pair_kwargs...)
    else
        if pair_method === :default
            M = Distributions.fit(Copulas.CopulaModel, FT, Uf; method=:default, pair_kwargs...)
            C0 = Copulas.fitted_distribution(M)
            method = Copulas.fitting_method(M)
        else
            C0 = Distributions.fit(FT, Uf; method=pair_method, pair_kwargs...)
            method = pair_method
        end
        meta = (;)
    end

    C0 isa PairCopula || throw(ArgumentError("family $FT did not produce a bivariate copula when fitted to 2×n data"))
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
    return _PairSelection(C, _short_family_name(C), _rotation_from_flips(flips), method, ll, k, score,
        get(meta, :converged, true), Int(get(meta, :iterations, 0)), θ,)
end

function _independence_selection(U::Matrix{Float64}, criterion::Symbol)
    C = Copulas.IndependentCopula(2)
    ll = 0.0
    return _PairSelection(C, "Independence", 0, :none, ll, 0, _criterion_score(ll, 0, size(U, 2), criterion), true, 0, (;),)
end

function _select_pair(U0::AbstractMatrix{<:Real}; family_set=:default, pair_method::Symbol=:default, selection_criterion::Symbol=:bic,
    allow_rotations::Bool=true, preselect::Bool=true, include_independence::Bool=true, pair_kwargs::NamedTuple=NamedTuple(),
    strict::Bool=false, trace::Bool=false, force_independence::Bool=false,)

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
                fit = _fit_one_pair_family(FT, U, flips; pair_method=pair_method, selection_criterion=selection_criterion, pair_kwargs=pair_kwargs,)
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

"""
    select_paircopula(U; family_set=:default, pair_method=:default,
                      selection_criterion=:bic, allow_rotations=true,
                      preselect=true, include_independence=true,
                      pair_kwargs=NamedTuple(), strict=false, trace=false)

Fit candidate bivariate copula families to U, optionally evaluate their
0/90/180/270-degree rotations, and select the best candidate by :loglik,
:aic, or :bic. Returns the selected Copulas.Copula{2}.

The default candidate set is DEFAULT_PAIR_FAMILIES. Use family_set=:all or an
explicit collection of Copulas.jl family types to change the candidates.
"""
function select_paircopula(U::AbstractMatrix{<:Real}; family_set=:default, pair_method::Symbol=:default, selection_criterion::Symbol=:bic,
                           allow_rotations::Bool=true, preselect::Bool=true, include_independence::Bool=true,
                           pair_kwargs::NamedTuple=NamedTuple(), strict::Bool=false, trace::Bool=false,)
                           return _select_pair(U; family_set, pair_method, selection_criterion, allow_rotations,
                                               preselect, include_independence, pair_kwargs, strict, trace,).copula
end

# -----------------------------------------------------------------------------
# Pair orientation helper for graph -> matrix conversion
# -----------------------------------------------------------------------------

# Most default families are exchangeable before rotation. For such families,
# swapping arguments only swaps the reflected coordinates.
@inline function _exchangeable_base(C)
    return C isa Copulas.GaussianCopula ||
           C isa Copulas.TCopula ||
           C isa Copulas.IndependentCopula ||
           C isa Copulas.ArchimedeanCopula
end

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

function _swap_pair(S::_ReflectedPairCopula)
    B = Copulas.basecopula(S)

    if _exchangeable_base(B)
        flips = Copulas.flips(S)
        swapped = Tuple(sort(Int[3 - i for i in flips]))

        isempty(swapped) && return B
        swapped == (1,)   && return Copulas.Rotated90Copula(B)
        swapped == (1, 2) && return Copulas.Rotated180Copula(B)
        swapped == (2,)   && return Copulas.Rotated270Copula(B)

        throw(ArgumentError(
            "unsupported bivariate reflection pattern $swapped"
        ))
    end

    return _SwappedPairCopula(S)
end

_swap_pair(C::PairCopula) = _exchangeable_base(C) ? C : _SwappedPairCopula(C)
