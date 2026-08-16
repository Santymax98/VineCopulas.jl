using DelimitedFiles
using Random
using Copulas

function envint(name, default)
    parse(Int, get(ENV, name, string(default)))
end

n = envint("N", 1_000)
p = envint("P", 5)
p >= 3 || error("P must be at least 3")
n >= 50 || error("N must be at least 50")

outdir = joinpath(@__DIR__, "data")
mkpath(outdir)
rng = MersenneTwister(20260816)

pair_gaussian = rand(rng, GaussianCopula(2, 0.55), n)'
pair_clayton = rand(rng, ClaytonCopula(2, 1.5), n)'

rho = 0.65
Sigma = [rho^abs(i-j) for i in 1:p, j in 1:p]
vine_data = rand(rng, GaussianCopula(Sigma), n)'

writedlm(joinpath(outdir, "pair_gaussian.csv"), pair_gaussian, ',')
writedlm(joinpath(outdir, "pair_clayton.csv"), pair_clayton, ',')
writedlm(joinpath(outdir, "vine_gaussian_ar1.csv"), vine_data, ',')

println("Generated fitting benchmark data: N=$n, P=$p")
