using DelimitedFiles
using Statistics
using Distributions
using Copulas
using VineCopulas

const COMMON = (GaussianCopula, TCopula, ClaytonCopula, GumbelCopula, FrankCopula, JoeCopula)
const DEFAULT = DEFAULT_PAIR_FAMILIES

mode = Symbol(get(ENV, "MODE", "common"))
repeats = parse(Int, get(ENV, "REPEATS", "3"))
families = mode === :common ? COMMON : mode === :default ? DEFAULT : error("MODE must be common or default")
criterion = mode === :common ? :aic : :bic
include_independence = mode === :default

datadir = joinpath(@__DIR__, "data")
outdir = joinpath(@__DIR__, "results")
mkpath(outdir)

function timed(f)
    f() # warm-up
    times = Float64[]
    result = nothing
    for _ in 1:repeats
        push!(times, @elapsed result = f())
    end
    return result, median(times), minimum(times)
end

function pair_fit(U)
    fit(PairCopula, U;
        family_set=families,
        pair_method=:mle,
        selection_criterion=criterion,
        allow_rotations=true,
        preselect=false,
        include_independence=include_independence,
        strict=true)
end

function fixed_structure(p::Int)
    order = collect(1:p)
    struct_array = [collect((t + 1):p) for t in 1:(p - 1)]
    RVineStructure(order, struct_array; trunc=p - 1)
end

function vine_fit(U; structure=nothing)
    fit(RVineCopula, U;
        structure=structure,
        trunc=structure === nothing ? size(U,1)-1 : nothing,
        family_set=families,
        pair_method=:mle,
        selection_criterion=criterion,
        tree_criterion=:tau,
        tree_algorithm=:kruskal,
        allow_rotations=true,
        preselect=false,
        include_independence=include_independence,
        threshold=0.0,
        strict=true)
end

function clean_error(err)
    replace(sprint(showerror, err), ',' => ';', '\n' => ' ')
end

function write_result(io, scope, dataset, U, f)
    try
        model, med, best = timed(f)
        ll = Distributions.loglikelihood(model, U)
        println(io, join(("VineCopulas.jl", scope, dataset, mode, size(U,2), size(U,1), med, best, ll, npars(model), "ok", ""), ','))
    catch err
        println(io, join(("VineCopulas.jl", scope, dataset, mode, size(U,2), size(U,1), "", "", "", "", "error", clean_error(err)), ','))
    end
end

open(joinpath(outdir, "julia_$(mode).csv"), "w") do io
    println(io, "engine,scope,dataset,mode,n,p,median_sec,min_sec,loglik,npars,status,error")

    for name in ("pair_gaussian", "pair_clayton")
        U = permutedims(Matrix{Float64}(readdlm(joinpath(datadir, "$name.csv"), ',', Float64)))
        write_result(io, "pair_selection", name, U, () -> pair_fit(U))
    end

    U = permutedims(Matrix{Float64}(readdlm(joinpath(datadir, "vine_gaussian_ar1.csv"), ',', Float64)))
    st = fixed_structure(size(U, 1))
    write_result(io, "fixed_vine", "gaussian_ar1", U, () -> vine_fit(U; structure=st))
    write_result(io, "automatic_vine", "gaussian_ar1", U, () -> vine_fit(U))
end
