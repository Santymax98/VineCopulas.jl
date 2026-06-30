include("julia_helpers.jl")

using DelimitedFiles
using Distributions: logpdf, cdf
using Statistics
using Printf

const FAMILY = env_string("FAMILY", "gaussian")
const MODEL = env_string("MODEL", "D")
const p = env_int("P", 5)
const n = env_int("N", 10_000)
const trunc = env_int("TRUNC", p - 1)
const cdf_n = env_int("CDF_N", 10_000)
const randomized_cdf = env_bool("RANDOMIZED_CDF", false)

vine = make_vine(MODEL, FAMILY, p, trunc)
prefix = joinpath("benchmarks", "reference", "$(MODEL)_$(FAMILY)_p$(p)_n$(n)_trunc$(trunc)")

function read_csv_matrix(path::AbstractString)
    isfile(path) || error("Missing file: $path. Run benchmarks/r_reference.R first.")
    X = readdlm(path, ',', Float64; skipstart=1)
    return ndims(X) == 0 ? reshape([Float64(X)], 1, 1) : Matrix{Float64}(X)
end

function read_csv_vector(path::AbstractString)
    return vec(read_csv_matrix(path))
end

# R convention: n × p. Julia convention: p × n.
U_R = read_csv_matrix(prefix * "_U.csv")
Z_R = read_csv_matrix(prefix * "_Z.csv")
U = permutedims(U_R)
Z = permutedims(Z_R)

logdens_R = read_csv_vector(prefix * "_logdens.csv")
ros_R = read_csv_matrix(prefix * "_rosenblatt.csv")
inv_R = read_csv_matrix(prefix * "_inverse_rosenblatt.csv")
Ucdf_R = read_csv_matrix(prefix * "_Ucdf.csv")
cdf_R = read_csv_vector(prefix * "_cdf.csv")

logdens_J = logpdf(vine, U)
ros_J = permutedims(rosenblatt(vine, U))
inv_J = permutedims(inverse_rosenblatt(vine, Z))
cdf_J = cdf(vine, permutedims(Ucdf_R); N=cdf_n, randomized=randomized_cdf)

# Internal consistency checks are independent of rvinecopulib conventions.
ros_local = rosenblatt(vine, U)
inv_ros_local = inverse_rosenblatt(vine, ros_local)
ros_inv_local = rosenblatt(vine, inverse_rosenblatt(vine, Z))

function vector_report(name::AbstractString, julia_vals, ref_vals)
    jv = vec(julia_vals)
    rv = vec(ref_vals)
    length(jv) == length(rv) || error("Length mismatch for $name: $(length(jv)) vs $(length(rv))")
    diff = jv .- rv
    absdiff = abs.(diff)
    denom = max.(abs.(rv), eps(Float64))
    rel = absdiff ./ denom
    row = (
        name,
        maximum(absdiff),
        mean(absdiff),
        median(absdiff),
        maximum(rel),
        mean(rel),
        length(jv),
    )
    @printf("%-24s max_abs = %.6e | mean_abs = %.6e | median_abs = %.6e | max_rel = %.6e | mean_rel = %.6e | n = %d\n",
            row[1], row[2], row[3], row[4], row[5], row[6], row[7])
    return row
end

println("Validation against rvinecopulib")
println("family      = ", FAMILY)
println("model       = ", MODEL)
println("p           = ", p)
println("n           = ", n)
println("trunc       = ", trunc)
println("cdf_n       = ", cdf_n)
println("cdf_qmc_rand= ", randomized_cdf)
println("edge type   = ", maybe_edge_eltype(vine))
println()

rows = Any[]
push!(rows, vector_report("logpdf", logdens_J, logdens_R))
push!(rows, vector_report("rosenblatt", ros_J, ros_R))
push!(rows, vector_report("inverse_rosenblatt", inv_J, inv_R))
push!(rows, vector_report("cdf qmc", cdf_J, cdf_R))
println()
println("Internal consistency")
push!(rows, vector_report("inv(ros(U)) vs U", inv_ros_local, U))
push!(rows, vector_report("ros(inv(Z)) vs Z", ros_inv_local, Z))

outpath = "benchmarks/results/validate_julia_vs_r_$(MODEL)_$(FAMILY)_p$(p)_n$(n)_trunc$(trunc).csv"
write_rows(outpath,
    ("quantity", "max_abs", "mean_abs", "median_abs", "max_rel", "mean_rel", "n_values"),
    rows)
println("\nSaved: ", outpath)
println("\nNote: logpdf/Rosenblatt comparisons should be tight if conventions match. CDF comparisons are approximate because both sides use numerical quasi-Monte Carlo integration.")
