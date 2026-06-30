module VineCopulas

import Random
import Distributions
import Copulas
import ForwardDiff
import Roots
import QuasiMonteCarlo
import LambertW
import LogExpFunctions
import SpecialFunctions
import StatsFuns

using Reexport
@reexport using Copulas
import Copulas: rosenblatt, inverse_rosenblatt

"""
    PairCopula

Alias for `Copulas.Copula{2}`. Pair-copulas are the bivariate building blocks
used on vine edges.
"""
const PairCopula = Copulas.Copula{2}

"""
    AbstractVineCopula{p} <: Copulas.Copula{p}

Abstract supertype for all `p`-dimensional vine copula models implemented by
`VineCopulas.jl`. Concrete subtypes include [`CVineCopula`](@ref),
[`DVineCopula`](@ref), and [`RVineCopula`](@ref).
"""
abstract type AbstractVineCopula{p} <: Copulas.Copula{p} end
"""
    VineCopula

Alias for [`AbstractVineCopula`](@ref).
"""
const VineCopula = AbstractVineCopula

include("utils.jl")
include("VineCopula.jl")

include("PairCopulas/Generic.jl")
include("PairCopulas/Ellipticals/GaussianCopula.jl")
include("PairCopulas/Ellipticals/TCopula.jl")
include("PairCopulas/Archimedeans/ArchimedeanCopula.jl")
include("PairCopulas/Archimedeans/AMHCopula.jl")
include("PairCopulas/Archimedeans/ClaytonCopula.jl")
include("PairCopulas/Archimedeans/GumbelBarnettCopula.jl")
include("PairCopulas/Archimedeans/GumbelCopula.jl")
include("PairCopulas/Archimedeans/FrankCopula.jl")
include("PairCopulas/Archimedeans/InvGaussianCopula.jl")
include("PairCopulas/Archimedeans/JoeCopula.jl")
include("PairCopulas/Archimedeans/BB1Copula.jl")
include("PairCopulas/Archimedeans/BB2Copula.jl")
include("PairCopulas/Archimedeans/BB3Copula.jl")
include("PairCopulas/Archimedeans/BB6Copula.jl")
include("PairCopulas/Archimedeans/BB7Copula.jl")
include("PairCopulas/Archimedeans/BB8Copula.jl")
include("PairCopulas/Archimedeans/BB9Copula.jl")
include("PairCopulas/Archimedeans/BB10Copula.jl")
include("PairCopulas/ExtremeValue/ExtremeValueCopula.jl")
include("PairCopulas/Miscellaneous/IndependentCopula.jl")
include("PairCopulas/Miscellaneous/MiscellaneousCopulas.jl")

include("Vines/CVine.jl")
include("Vines/DVine.jl")
include("Vines/RVine.jl")

include("stats.jl")

export PairCopula,
       VineCopula,
       AbstractVineCopula,
       CVineCopula,
       DVineCopula,
       RVineCopula,
       RVineStructure,
       VineEdge,
       order,
       edges,
       struct_array,
       truncation,
       rvine_matrix,
       hfunc1,
       hfunc2,
       hinv1,
       hinv2,
       h₁,
       h₂,
       h₁⁻¹,
       h₂⁻¹,
       rosenblatt,
       rosenblatt!,
       inverse_rosenblatt,
       inverse_rosenblatt!,
       simulate_qmc,
       set_cdf_nsamples!,
       enable_deterministic_cdf!,
       loglikelihood,
       npars,
       aic,
       bic

end