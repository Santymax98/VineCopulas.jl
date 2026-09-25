# Public parameter compatibility for Copulas.jl releases before and after the
# Paramorph migration.  `params` is the only upstream source of values here;
# the names below are VineCopulas' deterministic mathematical names.

@inline function _vine_param(p::NamedTuple, i::Int, name::Symbol)
    return hasproperty(p, name) ? getproperty(p, name) : getindex(p, i)
end

@inline _vine_param(p::Tuple, i::Int, ::Symbol) = getindex(p, i)

@inline function _vine_params(C::Copulas.GaussianCopula{2})
    p = Distributions.params(C)
    return (; Σ=_vine_param(p, 1, :Σ))
end

@inline function _vine_params(C::Copulas.TCopula{2})
    p = Distributions.params(C)
    return (; ν=_vine_param(p, 1, :ν), Σ=_vine_param(p, 2, :Σ))
end

@inline function _vine_arch_params(C, names::Tuple)
    p = Distributions.params(C)
    return NamedTuple{names}(ntuple(i -> _vine_param(p, i, names[i]), length(names)))
end

@inline _vine_params(C::Copulas.ClaytonCopula{2}) = _vine_arch_params(C, (:θ,))
@inline _vine_params(C::Copulas.FrankCopula{2}) = _vine_arch_params(C, (:θ,))
@inline _vine_params(C::Copulas.GumbelCopula{2}) = _vine_arch_params(C, (:θ,))
@inline _vine_params(C::Copulas.JoeCopula{2}) = _vine_arch_params(C, (:θ,))
@inline _vine_params(C::Copulas.AMHCopula{2}) = _vine_arch_params(C, (:θ,))
@inline _vine_params(C::Copulas.GumbelBarnettCopula{2}) = _vine_arch_params(C, (:θ,))
@inline _vine_params(C::Copulas.InvGaussianCopula{2}) = _vine_arch_params(C, (:θ,))
@inline _vine_params(C::Copulas.BB1Copula{2}) = _vine_arch_params(C, (:θ, :δ))
@inline _vine_params(C::Copulas.BB2Copula{2}) = _vine_arch_params(C, (:θ, :δ))
@inline _vine_params(C::Copulas.BB3Copula{2}) = _vine_arch_params(C, (:θ, :δ))
@inline _vine_params(C::Copulas.BB6Copula{2}) = _vine_arch_params(C, (:θ, :δ))
@inline _vine_params(C::Copulas.BB7Copula{2}) = _vine_arch_params(C, (:θ, :δ))
@inline _vine_params(C::Copulas.BB8Copula{2}) = _vine_arch_params(C, (:ϑ, :δ))
@inline _vine_params(C::Copulas.BB9Copula{2}) = _vine_arch_params(C, (:θ, :δ))
@inline _vine_params(C::Copulas.BB10Copula{2}) = _vine_arch_params(C, (:θ, :δ))

@inline function _vine_params(C::Copulas.ExtremeValueCopula{2,<:Copulas.tEVTail})
    p = Distributions.params(C)
    return (; ν=_vine_param(p, 1, :ν), ρ=_vine_param(p, 2, :ρ))
end

@inline function _vine_params(C::Copulas.ExtremeValueCopula{2,<:Copulas.AsymLogTail})
    p = Distributions.params(C)
    return (; α=_vine_param(p, 1, :α), θ₁=_vine_param(p, 2, :θ₁), θ₂=_vine_param(p, 3, :θ₂))
end

@inline function _vine_params(C::Copulas.ExtremeValueCopula{2,<:Copulas.AsymGalambosTail})
    p = Distributions.params(C)
    α = _vine_param(p, 1, :α)
    θ₁ = _vine_param(p, 2, :θ₁)
    θ₂ = _vine_param(p, 3, :θ₂)
    α = α isa AbstractVector ? first(α) : α
    θ₁ = θ₁ isa AbstractVector ? last(θ₁) : θ₁
    θ₂ = θ₂ isa AbstractVector ? last(θ₂) : θ₂
    return (; α, θ₁, θ₂)
end

@inline function _vine_params(C::Copulas.ExtremeValueCopula{2,<:Copulas.AsymMixedTail})
    p = Distributions.params(C)
    return (; θ₁=_vine_param(p, 1, :θ₁), θ₂=_vine_param(p, 2, :θ₂))
end

@inline function _vine_params(C::Copulas.ExtremeValueCopula{2})
    p = Distributions.params(C)
    return hasproperty(p, :θ) ? p : (; θ=p[1])
end

@inline _vine_params(C::Copulas.SurvivalCopula) = _vine_params(Copulas.basecopula(C))

@inline _vine_params(C) = Distributions.params(C)

# Generic copulas expose values positionally but do not promise names.  Keep
# scalar values visible to VineCopulas metadata without treating a tuple as one
# composite parameter; structured values remain grouped under `parameters`.
@inline function _vine_named_params(p::Tuple)
    all(x -> x isa Number, p) || return (; parameters=p)
    names = ntuple(i -> Symbol(:p, i), length(p))
    return NamedTuple{names}(p)
end

@inline _vine_named_params(p::NamedTuple) = p
