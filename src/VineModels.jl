# Statistical fitting and inference wrappers for sequential vine estimators.
# Their layouts are intentionally internal; use the public accessors below.

struct _VineFitSpec{T,K<:NamedTuple}
    target::T
    method::Symbol
    kwargs::K
end

struct VineModel{V<:AbstractVineCopula,D<:AbstractMatrix,S<:_VineFitSpec} <: StatsBase.StatisticalModel
    result::V
    data::D
    loglikelihood::Float64
    recipe::S
end

struct VineInference{M<:VineModel,V<:AbstractMatrix}
    model::M
    method::Symbol
    covariance::V
    nresamples::Int
end

function _canonical_vine_fit_kwargs(kwargs, weights)
    raw = (; kwargs...)
    # The candidate family domain is part of the estimator. Store the resolved
    # immutable tuple, not a caller-owned vector or a symbolic alias whose
    # meaning may change with package defaults.
    family_set = _resolve_family_set(get(raw, :family_set, :default))
    clean = merge(raw, (; family_set=Tuple(family_set)))
    haskey(clean, :trace) && (clean = Base.structdiff(clean, (; trace=nothing)))
    # The observation weights are stored validated and scaled to sum to n, the
    # vector every fit below the entry point saw, or left out when unweighted.
    clean = weights === nothing ? Base.structdiff(clean, (; weights=nothing)) : merge(clean, (; weights=weights))
    # Other mutable controls (order, structure, pair kwargs, etc.) are copied
    # so later caller mutation cannot change the meaning of a fitted model.
    return deepcopy(clean)
end

# The scaled observation weights of a fitted model, or `nothing`.
_model_weights(M::VineModel) = get(M.recipe.kwargs, :weights, nothing)

Copulas.fitted_distribution(M::VineModel) = M.result
Copulas.fitting_method(M::VineModel) = M.recipe.method
StatsBase.isfitted(::VineModel) = true
StatsBase.nobs(M::VineModel) = size(M.data, 2)
Distributions.loglikelihood(M::VineModel) = M.loglikelihood
StatsBase.deviance(M::VineModel) = -2M.loglikelihood
StatsBase.coefnames(M::VineModel) = _vine_parameter_metadata(M.result)[1]
StatsBase.coef(M::VineModel) = _vine_parameter_metadata(M.result)[2]
StatsBase.dof(M::VineModel) = length(StatsBase.coef(M))
StatsBase.aic(M::VineModel) = 2 * StatsBase.dof(M) - 2 * M.loglikelihood
StatsBase.bic(M::VineModel) = StatsBase.dof(M) * log(StatsBase.nobs(M)) - 2 * M.loglikelihood
function aicc(M::VineModel)
    k, n = StatsBase.dof(M), StatsBase.nobs(M)
    corr = n > k + 1 ? (2 * k * (k + 1)) / (n - k - 1) : Inf
    return StatsBase.aic(M) + corr
end

function hqc(M::VineModel)
    k, n = StatsBase.dof(M), StatsBase.nobs(M)
    return -2 * Distributions.loglikelihood(M) + 2 * k * log(log(max(n, 3)))
end

order(M::VineModel) = order(Copulas.fitted_distribution(M))
structure(M::VineModel) = structure(Copulas.fitted_distribution(M))
truncation(M::VineModel) = truncation(Copulas.fitted_distribution(M))
edges(M::VineModel) = edges(Copulas.fitted_distribution(M))
vine_edges(M::VineModel) = vine_edges(Copulas.fitted_distribution(M))

function Distributions.fit(::Type{VineModel}, ::Type{VT}, U; method::Symbol=:default, weights=nothing, kwargs...) where {VT<:AbstractVineCopula}
    effective = _check_vine_fit_method(method)
    C = Distributions.fit(VT, U; method=effective, weights=weights, kwargs...)
    X = _fit_data(U, length(C))
    # The stored `loglikelihood`, and hence `aic`, `bic` and `deviance`, are
    # the weighted ones; `nobs` stays n, the weight total.
    w = _fit_weights(weights, size(X, 2))
    spec = _VineFitSpec(VT, effective, _canonical_vine_fit_kwargs(kwargs, w))
    return VineModel(C, X, Float64(_weighted_loglikelihood(C, X, w)), spec)
end

Distributions.fit(::Type{VineModel}, ::Type{VT}, U, method; kwargs...) where {VT<:AbstractVineCopula} =
    Distributions.fit(VineModel, VT, U; method=method, kwargs...)

@inline _pair_template_base(C) = C isa _ReflectedPairCopula ? Copulas.basecopula(C) : C

function _selected_pair_family(C::PairCopula, family_set::Tuple)
    B = _pair_template_base(C)
    for FT in family_set
        B isa FT && return FT
    end
    throw(ArgumentError("selected pair family $(typeof(B)) is absent from the fitted model's family_set"))
end

function _refit_selected_pair(template::PairCopula, U::AbstractMatrix{<:Real};
    family_set::Tuple, pair_method::Symbol, pair_kwargs::NamedTuple, weights=nothing)
    template isa Copulas.IndependentCopula && return template
    B = _pair_template_base(template)
    B isa Copulas.IndependentCopula && return template
    flips = template isa _ReflectedPairCopula ? Copulas.flips(template) : ()
    X, w = _weighted_sample(_fit_data(U, 2), weights)
    fit = _fit_one_pair_family(_selected_pair_family(template, family_set), X, flips;
        weights=w, pair_method=pair_method, selection_criterion=:loglik, pair_kwargs=pair_kwargs)
    return fit.copula
end

function _refit_cvine(template::CVineCopula, X; family_set, pair_method, pair_kwargs, weights)
    p, n = size(X)
    ord, q = collect(order(template)), truncation(template)
    cond = [copy(@view X[j, :]) for j in 1:p]
    levels = Vector{Vector{PairCopula}}(undef, q)
    for t in 1:q
        root = ord[t]
        level = Vector{PairCopula}(undef, p - t)
        for (i, child) in enumerate(ord[(t + 1):p])
            C = _refit_selected_pair(template.edges[t][i], vcat(cond[root]', cond[child]'); family_set, pair_method, pair_kwargs, weights)
            level[i] = C
            t < q && _pair_hfunc2!(cond[child], C, cond[root], cond[child])
        end
        levels[t] = level
    end
    return CVineCopula(ord, [tuple(level...) for level in levels]; trunc=q)
end

function _refit_dvine(template::DVineCopula, X; family_set, pair_method, pair_kwargs, weights)
    p, n = size(X)
    ord, q = collect(order(template)), truncation(template)
    L = [copy(@view X[ord[j], :]) for j in 1:p]
    R = [copy(v) for v in L]
    levels = Vector{Vector{PairCopula}}(undef, q)
    for t in 1:q
        level = Vector{PairCopula}(undef, p - t)
        for i in 1:(p - t)
            C = _refit_selected_pair(template.edges[t][i], vcat(L[i]', R[i + t]'); family_set, pair_method, pair_kwargs, weights)
            level[i] = C
            t < q && _pair_hfuncs!(L[i], R[i + t], C, L[i], R[i + t])
        end
        levels[t] = level
    end
    return DVineCopula(ord, [tuple(level...) for level in levels]; trunc=q)
end

function _refit_rvine(template::RVineCopula, X; family_set, pair_method, pair_kwargs, weights)
    st, legacy = _standardize_fixed_rvine_structure(structure(template))
    if legacy
        fitted = _refit_dvine(_as_dvine(template), X; family_set, pair_method, pair_kwargs, weights)
        # Preserve the original public RVine representation even when the
        # optimized D-vine executor was used for the temporary refit.
        return RVineCopula(structure(template), edges(fitted))
    end
    p, n = size(X)
    ord, q = collect(st.order), truncation(st)
    S = [collect(st.struct_array[t]) for t in 1:q]
    states = Dict{Any,Vector{Float64}}(_state_key(v, Int[]) => copy(@view X[v, :]) for v in 1:p)
    levels = Vector{Vector{PairCopula}}(undef, q)
    for t in 1:q
        level = Vector{PairCopula}(undef, p - t)
        for e in 1:(p - t)
            a, b = ord[e], S[t][e]
            D = Int[S[r][e] for r in 1:(t - 1)]
            ua, ub = states[_state_key(a, D)], states[_state_key(b, D)]
            C = _refit_selected_pair(template.edges[t][e], vcat(ua', ub'); family_set, pair_method, pair_kwargs, weights)
            level[e] = C
            if t < q
                ha, hb = Vector{Float64}(undef, n), Vector{Float64}(undef, n)
                _pair_hfuncs!(ha, hb, C, ua, ub)
                states[_state_key(a, vcat(D, b))] = ha
                states[_state_key(b, vcat(D, a))] = hb
            end
        end
        levels[t] = level
    end
    return RVineCopula(ord, S, [tuple(level...) for level in levels]; trunc=q)
end

# Refit the model's structure, families and rotations on `U`, whose columns
# carry the observation weights `weights` (`nothing` when the model is
# unweighted). A bootstrap resample of a weighted fit is a resample of the
# (observation, weight) pairs, so each drawn column keeps its own weight.
function _refit(M::VineModel, U, weights=nothing)
    X = _fit_data(U, length(M.result))
    kw = M.recipe.kwargs
    common = (; family_set=kw.family_set, pair_method=get(kw, :pair_method, :default),
              pair_kwargs=get(kw, :pair_kwargs, NamedTuple()), weights=weights)
    C = M.result isa CVineCopula ? _refit_cvine(M.result, X; common...) :
        M.result isa DVineCopula ? _refit_dvine(M.result, X; common...) :
        _refit_rvine(M.result, X; common...)
    spec = _VineFitSpec(M.recipe.target, M.recipe.method, _canonical_vine_fit_kwargs(kw, weights))
    return VineModel(C, X, Float64(_weighted_loglikelihood(C, X, weights)), spec)
end

function Copulas.infer(M::VineModel; method::Symbol=:default, nresamples::Integer=200, rng=Random.default_rng())
    selected = method === :default ? :bootstrap : method
    selected === :bootstrap || throw(ArgumentError("vine inference supports only method=:bootstrap; sequential fitting is not joint maximum likelihood"))
    nresamples > 1 || throw(ArgumentError("nresamples must be greater than one"))
    p, n, B = StatsBase.dof(M), StatsBase.nobs(M), Int(nresamples)
    p == 0 && return VineInference(M, :bootstrap, LinearAlgebra.Symmetric(zeros(Float64, 0, 0)), B)
    w = _model_weights(M)
    estimates = Matrix{Float64}(undef, B, p)
    for b in 1:B
        idx = rand(rng, 1:n, n)
        sample = @view M.data[:, idx]
        estimates[b, :] .= StatsBase.coef(_refit(M, sample, w === nothing ? nothing : w[idx]))
    end
    V = Statistics.cov(estimates; corrected=true)
    all(isfinite, V) || throw(ArgumentError("bootstrap inference produced a non-finite covariance matrix"))
    V = (Matrix(V) + Matrix(V)') / 2
    size(V) == (p, p) || throw(ArgumentError("bootstrap covariance has incorrect dimensions"))
    return VineInference(M, :bootstrap, LinearAlgebra.Symmetric(V), B)
end

StatsBase.vcov(I::VineInference) = I.covariance
StatsBase.stderror(I::VineInference) = sqrt.(LinearAlgebra.diag(StatsBase.vcov(I)))
function StatsBase.confint(I::VineInference; level::Real=0.95)
    0 < level < 1 || throw(ArgumentError("level must lie strictly between zero and one"))
    z = Distributions.quantile(Distributions.Normal(), 1 - (1 - level) / 2)
    θ, se = StatsBase.coef(I.model), StatsBase.stderror(I)
    return θ .- z .* se, θ .+ z .* se
end

function edge_table(M::VineModel)
    [(
        tree=e.tree, edge=e.index, conditioned=e.conditioned, conditioning=e.conditioning,
        family=_short_family_name(e.copula), rotation=_rotation_of(e.copula),
        parameters=_vine_params(e.copula),
    ) for e in vine_edges(M)]
end

@inline _edge_signature(e::VineEdge) = (e.tree, Tuple(sort(collect(e.conditioned))), Tuple(sort(collect(e.conditioning))))

function _is_cvine_topology(vc::AbstractVineCopula)
    p, q = length(vc), truncation(vc)
    remaining, roots = collect(1:p), Int[]
    actual = Set(_edge_signature(e) for e in vine_edges(vc))
    for t in 1:q
        level = [e for e in vine_edges(vc) if e.tree == t]
        common = reduce(intersect, (Set(e.conditioned) for e in level))
        candidates = sort!(collect(intersect(common, Set(remaining))))
        isempty(candidates) && return false
        root = first(candidates)
        push!(roots, root); deleteat!(remaining, findfirst(==(root), remaining))
    end
    expected = Set{Tuple{Int,Tuple{Int,Int},Tuple}}()
    for t in 1:q, child in roots[(t + 1):end]
        push!(expected, (t, minmax(roots[t], child), Tuple(sort(roots[1:(t - 1)]))))
    end
    # Complete the inactive order deterministically when truncated.
    append!(roots, remaining)
    empty!(expected)
    for t in 1:q, child in roots[(t + 1):end]
        push!(expected, (t, minmax(roots[t], child), Tuple(sort(roots[1:(t - 1)]))))
    end
    return actual == expected
end

function _is_dvine_topology(vc::AbstractVineCopula)
    p, q = length(vc), truncation(vc)
    tree1 = [e for e in vine_edges(vc) if e.tree == 1]
    degree = zeros(Int, p); adjacency = [Int[] for _ in 1:p]
    for e in tree1
        a, b = e.conditioned
        degree[a] += 1; degree[b] += 1
        push!(adjacency[a], b); push!(adjacency[b], a)
    end
    count(==(1), degree) == 2 || return false
    firstnode = findfirst(==(1), degree)
    ord, previous, current = Int[], 0, firstnode
    while current != 0
        push!(ord, current)
        next = findfirst(!=(previous), adjacency[current])
        previous, current = current, isnothing(next) ? 0 : adjacency[current][next]
    end
    length(ord) == p || return false
    actual = Set(_edge_signature(e) for e in vine_edges(vc))
    expected = Set{Tuple{Int,Tuple{Int,Int},Tuple}}()
    for t in 1:q, i in 1:(p - t)
        push!(expected, (t, minmax(ord[i], ord[i + t]), Tuple(sort(ord[(i + 1):(i + t - 1)]))))
    end
    return actual == expected
end

"""
    vine_kind(vine_or_model)

Classify the active vine topology. `:cvine_dvine` is returned when the same
topology belongs to both subclasses (in particular in small dimensions), so
the result never confuses the constructor with a mathematical classification.
"""
function vine_kind(vc::AbstractVineCopula)
    c, d = _is_cvine_topology(vc), _is_dvine_topology(vc)
    c && d && return :cvine_dvine
    c && return :cvine
    d && return :dvine
    return :general_rvine
end
vine_kind(M::VineModel) = vine_kind(Copulas.fitted_distribution(M))

function Base.show(io::IO, M::VineModel)
    C = Copulas.fitted_distribution(M)
    println(io, "VineModel: ", nameof(typeof(C)))
    println(io, "  dimension:       ", length(C))
    println(io, "  observations:    ", StatsBase.nobs(M))
    _model_weights(M) === nothing ||
        println(io, "  weights:         yes, scaled to sum to the number of observations")
    println(io, "  method:          ", Copulas.fitting_method(M))
    println(io, "  topology class:  ", vine_kind(C))
    println(io, "  truncation:      ", truncation(C))
    println(io, "  order:           ", collect(order(C)))
    println(io, "  pair copulas:    ", length(vine_edges(C)))
    println(io, "  parameters:      ", StatsBase.dof(M))
    println(io, "  loglikelihood:   ", M.loglikelihood)
    println(io, "  AIC:             ", StatsBase.aic(M))
    print(io, "  BIC:             ", StatsBase.bic(M))
end

function Base.show(io::IO, I::VineInference)
    println(io, "VineInference")
    println(io, "  method:              ", I.method)
    println(io, "  conditional model:   fixed structure/families/rotations")
    println(io, "  replicates:          ", I.nresamples)
    print(io, "  parameters:          ", StatsBase.dof(I.model))
end
