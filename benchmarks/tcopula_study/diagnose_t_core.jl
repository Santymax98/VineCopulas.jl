using VineCopulas
using BenchmarkTools
using StatsFuns

p_ref = Ref(0.3)
x_ref = Ref(0.7)
ν_ref = Ref(4.0)

println("Core Student-t scalar functions")
println()

println("StatsFuns.tdistcdf")
@btime StatsFuns.tdistcdf($(ν_ref)[], $(x_ref)[])

println("StatsFuns.tdistpdf")
@btime StatsFuns.tdistpdf($(ν_ref)[], $(x_ref)[])

println("StatsFuns.tdistinvcdf")
@btime StatsFuns.tdistinvcdf($(ν_ref)[], $(p_ref)[])

println("VineCopulas._t_quantile")
@btime VineCopulas._t_quantile(Val(4), $(p_ref)[])

println("VineCopulas._t_cdf")
@btime VineCopulas._t_cdf(Val(4), $(x_ref)[])
