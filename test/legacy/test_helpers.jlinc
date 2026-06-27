using Test
using Random
using Distributions
using Copulas
using VineCopulas

const TEST_EPSU = sqrt(eps(Float64))
const PAIR_GRID = (0.25, 0.50, 0.75)
const ARCH_GRID = (0.05, 0.25, 0.50, 0.75, 0.95)
const S_GRID = (1e-3, 0.03, 0.20, 1.00, 5.00)

@inline _is_extreme_value(C) = C isa Copulas.ExtremeValueCopula{2}
@inline _is_singular_extreme_value(C) = _is_extreme_value(C) && C.tail isa Union{Copulas.CuadrasAugeTail,Copulas.MOTail,Copulas.BC2Tail,Copulas.EmpiricalEVTail}

function _finite_pdf_h1(C, u, v; h=1e-5)
    a, b = max(u-h, TEST_EPSU), min(u+h, 1-TEST_EPSU)
    return (hfunc1(C, b, v)-hfunc1(C, a, v))/(b-a)
end

function _finite_pdf_h2(C, u, v; h=1e-5)
    a, b = max(v-h, TEST_EPSU), min(v+h, 1-TEST_EPSU)
    return (hfunc2(C, u, b)-hfunc2(C, u, a))/(b-a)
end

@inline _conditional_dist1(C::Copulas.ExtremeValueCopula{2}, v::Real) = Copulas.BivEVDistortion(C.tail, Int8(2), float(v))
@inline _conditional_dist2(C::Copulas.ExtremeValueCopula{2}, u::Real) = Copulas.BivEVDistortion(C.tail, Int8(1), float(u))

elliptical_candidates() = Pair{String,Copulas.Copula{2}}[
    "Gaussian" => Copulas.GaussianCopula([1.0 0.5; 0.5 1.0]),
    "t" => Copulas.TCopula(4, [1.0 0.4; 0.4 1.0]),
]

archimedean_specialized_candidates() = Pair{String,Copulas.Copula{2}}[
    "Clayton" => Copulas.ClaytonCopula(2, 2.0),
    "Frank" => Copulas.FrankCopula(2, 3.0),
    "Gumbel" => Copulas.GumbelCopula(2, 1.5),
    "AMH" => Copulas.AMHCopula(2, 0.5),
    "Joe" => Copulas.JoeCopula(2, 1.5),
    "GumbelBarnett" => Copulas.GumbelBarnettCopula(2, 0.5),
    "InvGaussian" => Copulas.InvGaussianCopula(2, 1.5),
    "BB1" => Copulas.BB1Copula(2, 1.2, 1.5),
    "BB2" => Copulas.BB2Copula(2, 1.2, 1.5),
    "BB3" => Copulas.BB3Copula(2, 1.2, 1.5),
    "BB6" => Copulas.BB6Copula(2, 1.2, 1.5),
    "BB7" => Copulas.BB7Copula(2, 1.2, 1.5),
    "BB8" => Copulas.BB8Copula(2, 1.5, 0.6),
    "BB9" => Copulas.BB9Copula(2, 1.5, 0.8),
    "BB10" => Copulas.BB10Copula(2, 1.5, 0.6),
]

archimedean_fallback_candidates() = Pair{String,Copulas.Copula{2}}[]

archimedean_candidates() = vcat(archimedean_specialized_candidates(), archimedean_fallback_candidates())

extreme_value_candidates() = Pair{String,Copulas.Copula{2}}[
    "LogTail" => Copulas.ExtremeValueCopula(2, Copulas.LogTail(1.5)),
    "GalambosTail" => Copulas.ExtremeValueCopula(2, Copulas.GalambosTail(1.5)),
    "HuslerReissTail" => Copulas.ExtremeValueCopula(2, Copulas.HuslerReissTail(1.2)),
    "CuadrasAugeTail" => Copulas.ExtremeValueCopula(2, Copulas.CuadrasAugeTail(0.5)),
    "MOTail" => Copulas.ExtremeValueCopula(2, Copulas.MOTail(0.3, 0.4, 0.5)),
    "MixedTail" => Copulas.ExtremeValueCopula(2, Copulas.MixedTail(0.4)),
    "AsymLogTail" => Copulas.ExtremeValueCopula(2, Copulas.AsymLogTail(1.5, 0.3, 0.7)),
    "AsymGalambosTail" => Copulas.ExtremeValueCopula(2, Copulas.AsymGalambosTail(1.5, 0.3, 0.7)),
    "AsymMixedTail" => Copulas.ExtremeValueCopula(2, Copulas.AsymMixedTail(0.3, 0.1)),
    "BC2Tail" => Copulas.ExtremeValueCopula(2, Copulas.BC2Tail(0.3, 0.4)),
    "tEVTail" => Copulas.ExtremeValueCopula(2, Copulas.tEVTail(4.0, 0.5)),
]

paircopula_candidates() = vcat(elliptical_candidates(), archimedean_candidates(), extreme_value_candidates())
