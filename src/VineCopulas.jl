module VineCopulas

import Random
import Distributions
import Copulas
import ForwardDiff
import Roots
import QuasiMonteCarlo
import LambertW
import LogExpFunctions

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

include("Conditionals/Ellipticals.jl")
include("Conditionals/Archimedeans.jl")
include("Conditionals/ExtremeValue.jl")
include("Conditionals/Miscellaneous.jl")

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