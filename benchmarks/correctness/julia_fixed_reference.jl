using DelimitedFiles
using TOML
using Distributions
using Copulas
using VineCopulas

const ROOT = @__DIR__
const DATA_DIR = joinpath(ROOT, "data")
const RESULTS_DIR = joinpath(ROOT, "results")
const SPECS = TOML.parsefile(joinpath(ROOT, "specs.toml"))

function make_pair(family::AbstractString, rotation::Integer, pars)
    p = Float64.(pars)
    C = if family == "Independence"
        Copulas.IndependentCopula(2)
    elseif family == "Gaussian"
        GaussianCopula([1.0 p[1]; p[1] 1.0])
    elseif family == "Student"
        TCopula(p[2], [1.0 p[1]; p[1] 1.0])
    elseif family == "Clayton"
        ClaytonCopula(2, p[1])
    elseif family == "Gumbel"
        GumbelCopula(2, p[1])
    elseif family == "Frank"
        FrankCopula(2, p[1])
    elseif family == "Joe"
        JoeCopula(2, p[1])
    elseif family == "BB1"
        BB1Copula(2, p[1], p[2])
    elseif family == "BB6"
        BB6Copula(2, p[1], p[2])
    elseif family == "BB7"
        BB7Copula(2, p[1], p[2])
    elseif family == "BB8"
        BB8Copula(2, p[1], p[2])
    else
        error("unsupported family in correctness specs: $family")
    end

    rotation == 0 && return C
    family in ("Independence", "Gaussian", "Student", "Frank") &&
        error("rotation $rotation is not allowed for $family")
    flips = rotation == 90 ? (1,) :
            rotation == 180 ? (1, 2) :
            rotation == 270 ? (2,) :
            error("invalid rotation: $rotation")
    return SurvivalCopula(C, flips)
end

function make_vine(spec)
    ord = Int.(spec["order"])
    S = [Int.(row) for row in spec["struct_array"]]
    p = length(ord)
    q = length(S)
    levels = [Vector{VineCopulas.PairCopula}(undef, p - t) for t in 1:q]
    for es in spec["edges"]
        t = Int(es["tree"])
        e = Int(es["edge"])
        levels[t][e] = make_pair(String(es["family"]), Int(es["rotation"]), es["params"])
    end
    all(isassigned(levels[t], e) for t in 1:q for e in eachindex(levels[t])) ||
        error("incomplete vine specification")
    return RVineCopula(ord, S, levels; trunc=q)
end

read_nxp(path) = Matrix{Float64}(readdlm(path, ',', Float64))
read_pxn(path) = permutedims(read_nxp(path))

function pair_reference()
    X = read_nxp(joinpath(DATA_DIR, "pair_points.csv"))
    open(joinpath(RESULTS_DIR, "pair_julia.csv"), "w") do io
        println(io, "case,row,logpdf,h1,h2,hinv1,hinv2")
        for case in SPECS["pair_cases"]
            name = String(case["name"])
            C = make_pair(String(case["family"]), Int(case["rotation"]), case["params"])
            for i in axes(X, 1)
                u, v, q, base = X[i, 1], X[i, 2], X[i, 3], X[i, 4]
                vals = (
                    Distributions.logpdf(C, [u, v]),
                    hfunc1(C, u, v),
                    hfunc2(C, u, v),
                    hinv1(C, q, base),
                    hinv2(C, q, base),
                )
                all(isfinite, vals) || error("non-finite pair result for $name row $i: $vals")
                println(io, join((name, i, vals...), ','))
            end
        end
    end
end

function matrix_string(M)
    join((join(M[i, :], ':') for i in axes(M, 1)), ';')
end

function vine_reference()
    open(joinpath(RESULTS_DIR, "vine_julia.csv"), "w") do vio
        println(vio, "model,metric,row,dim,value")
        open(joinpath(RESULTS_DIR, "structure_julia.csv"), "w") do sio
            println(sio, "model,p,trunc,order,matrix")
            for spec in SPECS["vine_models"]
                name = String(spec["name"])
                R = make_vine(spec)
                U = read_pxn(joinpath(DATA_DIR, "vine_eval_$(name).csv"))
                Z = read_pxn(joinpath(DATA_DIR, "vine_z_$(name).csv"))

                ll = Distributions.logpdf(R, U)
                T = rosenblatt(R, U)
                X = inverse_rosenblatt(R, Z)
                all(isfinite, ll) || error("non-finite fixed-vine logpdf for $name")
                all(isfinite, T) || error("non-finite fixed-vine Rosenblatt for $name")
                all(isfinite, X) || error("non-finite fixed-vine inverse Rosenblatt for $name")

                for i in eachindex(ll)
                    println(vio, join((name, "logpdf", i, 0, ll[i]), ','))
                end
                for i in axes(T, 2), j in axes(T, 1)
                    println(vio, join((name, "rosenblatt", i, j, T[j, i]), ','))
                end
                for i in axes(X, 2), j in axes(X, 1)
                    println(vio, join((name, "inverse", i, j, X[j, i]), ','))
                end

                ord = join(collect(order(R)), ':')
                println(sio, join((name, length(R), truncation(R), ord, matrix_string(rvine_matrix(R))), ','))
            end
        end
    end
end

mkpath(RESULTS_DIR)
pair_reference()
vine_reference()
println("Wrote VineCopulas.jl fixed-model reference results.")
