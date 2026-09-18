# Statistical comparison of `fit(RVineCopula, U; groups=g)` against the
# unconstrained fit on block-structured Gaussian data. Prints, per setting:
#
# - the tree-1 objective Σ_{e ∈ T₁} |τ̂_e| of both fits and the gap (the
#   constrained objective is at most the unconstrained one, by construction);
# - the log-likelihood of both fits at truncation 1 and at full depth;
# - the share of seeds on which plain Dißmann's tree 1 already has every block
#   connected (the constraint changes nothing on those);
# - the cost of a wrong partition, one that cuts across the blocks.
#
# Run from the repository root:
#
#     julia --project=benchmarks benchmarks/fitting/grouped_tree1.jl
#
# Settings: WITHIN / CROSS (block and cross-block Gaussian correlations,
# comma-separated lists), N (sample size list), SEEDS (number of seeds).

using Random
using Statistics
using Distributions
using Copulas
using VineCopulas

parse_list(s) = parse.(Float64, split(s, ","))
withins = parse_list(get(ENV, "WITHIN", "0.4,0.5,0.7"))
crosses = parse_list(get(ENV, "CROSS", "0.05,0.3,0.45"))
ns = parse.(Int, split(get(ENV, "N", "100,500"), ","))
nseeds = parse(Int, get(ENV, "SEEDS", "20"))

const P = 6
const G = [1, 1, 1, 2, 2, 2]
const WRONG = [1, 2, 1, 2, 1, 2]
const FAMS = (GaussianCopula,)

function block_data(rng, n, within, cross)
    Σ = Matrix{Float64}(1.0 * (1:P .== (1:P)'))
    for i in 1:P, j in 1:P
        i == j && continue
        Σ[i, j] = ((i <= 3) == (j <= 3)) ? within : cross
    end
    return rand(rng, GaussianCopula(Σ), n)
end

function tree1_edges(vc::RVineCopula)
    ord = collect(order(vc))
    S1 = vc.structure.struct_array[1]
    return [minmax(ord[e], S1[e]) for e in eachindex(S1)]
end

function weight_matrix(U)
    W = zeros(P, P)
    for j in 2:P, i in 1:(j - 1)
        W[i, j] = W[j, i] = abs(VineCopulas._kendall_tau_b(U[i, :], U[j, :]))
    end
    return W
end

objective(W, E) = sum(W[i, j] for (i, j) in E)
blocks_connected(E, g) = all(count(e -> g[e[1]] == k && g[e[2]] == k, E) == count(==(k), g) - 1 for k in unique(g))
loglik(R, U) = sum(logpdf(R, U))

println(rpad("within", 7), rpad("cross", 6), rpad("n", 6),
        rpad("obj free", 10), rpad("obj groups", 12), rpad("gap", 8),
        rpad("ll1 free", 11), rpad("ll1 groups", 12), rpad("ll1 wrong", 11),
        rpad("ll free", 11), rpad("ll groups", 12), rpad("ll wrong", 11),
        "free connected")
for within in withins, cross in crosses, n in ns
    obj_free = Float64[]; obj_g = Float64[]
    ll1_free = Float64[]; ll1_g = Float64[]; ll1_w = Float64[]
    ll_free = Float64[]; ll_g = Float64[]; ll_w = Float64[]
    connected = 0
    for s in 1:nseeds
        U = block_data(MersenneTwister(1000 * s), n, within, cross)
        W = weight_matrix(U)
        R1f = fit(RVineCopula, U; family_set=FAMS, trunc=1)
        R1g = fit(RVineCopula, U; family_set=FAMS, trunc=1, groups=G)
        R1w = fit(RVineCopula, U; family_set=FAMS, trunc=1, groups=WRONG)
        Rf = fit(RVineCopula, U; family_set=FAMS)
        Rg = fit(RVineCopula, U; family_set=FAMS, groups=G)
        Rw = fit(RVineCopula, U; family_set=FAMS, groups=WRONG)
        Ef = tree1_edges(R1f)
        push!(obj_free, objective(W, Ef)); push!(obj_g, objective(W, tree1_edges(R1g)))
        push!(ll1_free, loglik(R1f, U)); push!(ll1_g, loglik(R1g, U)); push!(ll1_w, loglik(R1w, U))
        push!(ll_free, loglik(Rf, U)); push!(ll_g, loglik(Rg, U)); push!(ll_w, loglik(Rw, U))
        connected += blocks_connected(Ef, G)
    end
    f(x) = rpad(string(round(mean(x); digits=3)), 11)
    println(rpad(within, 7), rpad(cross, 6), rpad(n, 6),
            rpad(round(mean(obj_free); digits=3), 10), rpad(round(mean(obj_g); digits=3), 12), rpad(round(mean(obj_free .- obj_g); digits=3), 8),
            f(ll1_free), rpad(string(round(mean(ll1_g); digits=3)), 12), f(ll1_w),
            f(ll_free), rpad(string(round(mean(ll_g); digits=3)), 12), f(ll_w),
            "$(connected)/$(nseeds)")
end
