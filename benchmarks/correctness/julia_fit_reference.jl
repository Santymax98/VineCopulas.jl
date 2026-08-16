using DelimitedFiles
using TOML
using Distributions
using Copulas
using VineCopulas

const ROOT = @__DIR__
const DATA_DIR = joinpath(ROOT, "data")
const RESULTS_DIR = joinpath(ROOT, "results")
const SPECS = TOML.parsefile(joinpath(ROOT, "specs.toml"))

const COMMON_FAMILIES = (
    GaussianCopula,
    TCopula,
    ClaytonCopula,
    GumbelCopula,
    FrankCopula,
    JoeCopula,
)

const DEFAULT_FAMILIES_PARITY = (
    GaussianCopula,
    TCopula,
    ClaytonCopula,
    GumbelCopula,
    FrankCopula,
    JoeCopula,
    BB1Copula,
    BB6Copula,
    BB7Copula,
    BB8Copula,
)

function requested_modes()
    mode = lowercase(get(ENV, "PARITY_FIT_MODE", "common"))
    mode == "common" && return ("common",)
    mode == "default" && return ("default",)
    mode in ("both", "all") && return ("common", "default")
    error("PARITY_FIT_MODE must be common, default, or both")
end

function fit_config(mode::AbstractString)
    if mode == "common"
        return (families=COMMON_FAMILIES, criterion=:aic, include_independence=false)
    end
    return (families=DEFAULT_FAMILIES_PARITY, criterion=:bic, include_independence=true)
end

function fit_once(U, mode::AbstractString, structure)
    cfg = fit_config(mode)
    return fit(
        RVineCopula,
        U;
        structure=structure,
        trunc=structure === nothing ? size(U, 1) - 1 : nothing,
        family_set=cfg.families,
        pair_method=:mle,
        selection_criterion=cfg.criterion,
        tree_criterion=:tau,
        tree_algorithm=:kruskal,
        allow_rotations=true,
        preselect=false,
        include_independence=cfg.include_independence,
        threshold=0.0,
        strict=true,
    )
end

@inline function rotation_of(C)
    C isa Copulas.SurvivalCopula || return 0
    return VineCopulas._rotation_from_flips(VineCopulas._survival_flips(C))
end

base_pair(C) = C isa Copulas.SurvivalCopula ? C.C : C

_t_df(::Copulas.TCopula{D,NU,S}) where {D,NU,S} = Float64(NU)

function pair_params(C)
    B = base_pair(C)
    if B isa Copulas.IndependentCopula
        return Float64[]
    elseif B isa Copulas.GaussianCopula
        return [Float64(B.Σ[1, 2])]
    elseif B isa Copulas.TCopula
        return [Float64(B.Σ[1, 2]), _t_df(B)]
    end
    nt = Distributions.params(B)
    θ = nt isa NamedTuple ? nt : (; parameters=collect(nt))
    _, vals = VineCopulas._flatten_fit_params(θ)
    return Float64.(vals)
end

function canonical_edge(a::Int, b::Int, D, rotation::Int)
    cond = sort(Int[x for x in D])
    if a <= b
        return a, b, cond, rotation
    end
    rot = rotation == 90 ? 270 : rotation == 270 ? 90 : rotation
    return b, a, cond, rot
end

function clean_text(x)
    replace(replace(string(x), '\n' => ' '), ',' => ';')
end

function write_edge_rows(io, R, phase, dataset)
    for ve in VineCopulas.vine_edges(R)
        C = ve.copula
        rot = rotation_of(C)
        a, b = ve.conditioned
        ca, cb, cond, crot = canonical_edge(a, b, ve.conditioning, rot)
        pars = pair_params(C)
        p1 = length(pars) >= 1 ? string(pars[1]) : ""
        p2 = length(pars) >= 2 ? string(pars[2]) : ""
        println(io, join((
            phase, dataset, ve.tree, ve.index, ca, cb,
            join(cond, ':'), VineCopulas._short_family_name(C), crot, p1, p2
        ), ','))
    end
end


function _candidate_param_strings(fit)
    _, vals = VineCopulas._flatten_fit_params(fit.theta)
    p1 = length(vals) >= 1 ? string(Float64(vals[1])) : ""
    p2 = length(vals) >= 2 ? string(Float64(vals[2])) : ""
    return p1, p2
end

function write_candidate_family_rows(io, pdata, phase, dataset, tree, edge, a, b, D, mode)
    cfg = fit_config(mode)
    families = cfg.families

    for FT in families
        try
            fit = VineCopulas._select_pair(
                pdata;
                family_set=(FT,),
                pair_method=:mle,
                selection_criterion=cfg.criterion,
                allow_rotations=true,
                preselect=false,
                include_independence=false,
                strict=true,
            )
            ca, cb, cond, crot = canonical_edge(a, b, D, fit.rotation)
            p1, p2 = _candidate_param_strings(fit)
            println(io, join((
                phase, dataset, tree, edge, ca, cb, join(cond, ':'),
                fit.family, crot, fit.loglik, fit.score, fit.npars,
                cfg.criterion, p1, p2, "ok", ""
            ), ','))
        catch err
            ca, cb, cond, _ = canonical_edge(a, b, D, 0)
            println(io, join((
                phase, dataset, tree, edge, ca, cb, join(cond, ':'),
                string(FT), "", "", "", "", cfg.criterion, "", "",
                "error", clean_text(sprint(showerror, err))
            ), ','))
        end
    end

    if cfg.include_independence
        fit = VineCopulas._independence_selection(Matrix{Float64}(pdata), cfg.criterion)
        ca, cb, cond, crot = canonical_edge(a, b, D, fit.rotation)
        println(io, join((
            phase, dataset, tree, edge, ca, cb, join(cond, ':'),
            fit.family, crot, fit.loglik, fit.score, fit.npars,
            cfg.criterion, "", "", "ok", ""
        ), ','))
    end
end

function write_candidate_rows(io, R, U, phase, dataset, mode)
    p, n = size(U)
    states = Dict{Any,Vector{Float64}}()
    for v in 1:p
        states[VineCopulas._state_key(v, Int[])] = copy(@view U[v, :])
    end

    ves = collect(VineCopulas.vine_edges(R))
    isempty(ves) && return
    q = maximum(ve.tree for ve in ves)

    for t in 1:q
        level = sort([ve for ve in ves if ve.tree == t]; by=ve -> ve.index)
        for ve in level
            a, b = ve.conditioned
            D = Int[x for x in ve.conditioning]
            ua = states[VineCopulas._state_key(a, D)]
            ub = states[VineCopulas._state_key(b, D)]
            pdata = Matrix{Float64}(undef, 2, n)
            pdata[1, :] .= ua
            pdata[2, :] .= ub

            write_candidate_family_rows(
                io, pdata, phase, dataset, ve.tree, ve.index, a, b, D, mode
            )

            if t < q
                C = ve.copula
                ha = Vector{Float64}(undef, n)
                hb = Vector{Float64}(undef, n)
                @inbounds for col in 1:n
                    ha[col] = hfunc1(C, ua[col], ub[col])
                    hb[col] = hfunc2(C, ua[col], ub[col])
                end
                states[VineCopulas._state_key(a, vcat(D, b))] = ha
                states[VineCopulas._state_key(b, vcat(D, a))] = hb
            end
        end
    end
end

function main()
    source = only(filter(v -> get(v, "fit_source", false), SPECS["vine_models"]))
    name = String(source["name"])
    X = Matrix{Float64}(readdlm(joinpath(DATA_DIR, "fit_data_$(name).csv"), ',', Float64))
    nmax = parse(Int, get(ENV, "PARITY_N", "800"))
    n = nmax > 0 ? min(nmax, size(X, 1)) : size(X, 1)
    U = permutedims(@view X[1:n, :])
    ord = Int.(source["order"])
    S = [Int.(row) for row in source["struct_array"]]
    st = RVineStructure(ord, S; trunc=length(S))

    mkpath(RESULTS_DIR)
    open(joinpath(RESULTS_DIR, "fit_summary_julia.csv"), "w") do sio
        println(sio, "phase,dataset,n,status,loglik,aic,bic,npars,order,error")
        open(joinpath(RESULTS_DIR, "fit_edges_julia.csv"), "w") do eio
            println(eio, "phase,dataset,tree,edge,a,b,conditioning,family,rotation,p1,p2")
            open(joinpath(RESULTS_DIR, "fit_candidates_julia.csv"), "w") do cio
                println(cio, "phase,dataset,tree,edge,a,b,conditioning,family,rotation,loglik,score,npars,criterion,p1,p2,status,error")
                for mode in requested_modes(), kind in ("fixed", "dissmann")
                    phase = "$(kind)_$(mode)"
                    try
                        R = fit_once(U, mode, kind == "fixed" ? st : nothing)
                        ll = Float64(Distributions.loglikelihood(R, U))
                        k = VineCopulas.npars(R)
                        aic = -2.0 * ll + 2.0 * k
                        bic = -2.0 * ll + k * log(n)
                        println(sio, join((phase, name, n, "ok", ll, aic, bic, k, join(collect(order(R)), ':'), ""), ','))
                        write_edge_rows(eio, R, phase, name)
                        if kind == "dissmann"
                            try
                                write_candidate_rows(cio, R, U, phase, name, mode)
                            catch diag_err
                                @warn "candidate-score diagnostic failed" phase exception=(diag_err, catch_backtrace())
                            end
                        end
                    catch err
                        println(sio, join((phase, name, n, "error", "", "", "", "", "", clean_text(sprint(showerror, err))), ','))
                    end
                end
            end
        end
    end
    println("Wrote VineCopulas.jl fitting/selection parity results.")
end

main()
