using DelimitedFiles
using Statistics
using Printf

include(joinpath(@__DIR__, "..", "julia_helpers.jl"))

family = get(ENV, "FAMILY", "gaussian")
model = get(ENV, "MODEL", "D")
p = parse(Int, get(ENV, "P", "2"))
n = parse(Int, get(ENV, "N", "10000"))
trunc = parse(Int, get(ENV, "TRUNC", "1"))

p == 2 || error("This diagnostic is only for p=2.")
trunc == 1 || error("This diagnostic is only for trunc=1.")

prefix = joinpath("benchmarks", "reference", "$(model)_$(family)_p$(p)_n$(n)_trunc$(trunc)")

U_R = Matrix{Float64}(readdlm(prefix * "_U.csv", ',', skipstart=1))
Z_R = Matrix{Float64}(readdlm(prefix * "_Z.csv", ',', skipstart=1))
ros_R = Matrix{Float64}(readdlm(prefix * "_rosenblatt.csv", ',', skipstart=1))
inv_R = Matrix{Float64}(readdlm(prefix * "_inverse_rosenblatt.csv", ',', skipstart=1))

pc = paircopula(family)
vine = make_vine(model, family, p, trunc)

U_J = permutedims(U_R)
Z_J = permutedims(Z_R)

ros_J = permutedims(rosenblatt(vine, U_J))
inv_J = permutedims(inverse_rosenblatt(vine, Z_J))

u1 = U_R[:, 1]
u2 = U_R[:, 2]

z1 = Z_R[:, 1]
z2 = Z_R[:, 2]

# hfunc1(C,u,v) = C_{1|2}(u | v)
# hfunc2(C,u,v) = C_{2|1}(v | u)

cand_A = hcat(u1, [hfunc2(pc, u1[i], u2[i]) for i in eachindex(u1)])
cand_B = hcat([hfunc1(pc, u1[i], u2[i]) for i in eachindex(u1)], u2)
cand_C = hcat(u2, [hfunc1(pc, u1[i], u2[i]) for i in eachindex(u1)])
cand_D = hcat([hfunc2(pc, u1[i], u2[i]) for i in eachindex(u1)], u1)

inv_A = hcat(z1, [hinv2(pc, z2[i], z1[i]) for i in eachindex(z1)])
inv_B = hcat([hinv1(pc, z1[i], z2[i]) for i in eachindex(z1)], z2)
inv_C = hcat([hinv1(pc, z2[i], z1[i]) for i in eachindex(z1)], z1)
inv_D = hcat(z2, [hinv2(pc, z1[i], z2[i]) for i in eachindex(z1)])

ros_local = rosenblatt(vine, U_J)
inv_ros_local = inverse_rosenblatt(vine, ros_local)
ros_inv_local = rosenblatt(vine, inverse_rosenblatt(vine, Z_J))

function report(name, A, B)
    d = abs.(A .- B)
    @printf("%-34s max_abs = %.6e | mean_abs = %.6e | median_abs = %.6e\n",
            name, maximum(d), mean(d), median(vec(d)))
end

println("Rosenblatt convention diagnostic")
println("family = ", family)
println("model  = ", model)
println("p      = ", p)
println("n      = ", n)
println("trunc  = ", trunc)
println("edge   = ", typeof(pc))
println()

println("Direct package comparison")
report("ours rosenblatt vs R", ros_J, ros_R)
report("ours inverse vs R", inv_J, inv_R)
println()

println("Rosenblatt candidates vs rvinecopulib")
report("A = (u1, hfunc2(u1,u2))", cand_A, ros_R)
report("B = (hfunc1(u1,u2), u2)", cand_B, ros_R)
report("C = (u2, hfunc1(u1,u2))", cand_C, ros_R)
report("D = (hfunc2(u1,u2), u1)", cand_D, ros_R)
println()

println("Inverse candidates vs rvinecopulib inverse")
report("inv A", inv_A, inv_R)
report("inv B", inv_B, inv_R)
report("inv C", inv_C, inv_R)
report("inv D", inv_D, inv_R)
println()

println("Internal consistency")
report("inv(ros(U)) vs U", inv_ros_local, U_J)
report("ros(inv(Z)) vs Z", ros_inv_local, Z_J)
