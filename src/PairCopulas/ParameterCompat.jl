# `Distributions.params` is the public upstream source of parameter values.
# VineCopulas gives selected pair families stable mathematical names for its
# kernels and metadata while retaining structured public values where needed.

@inline function _vine_params(C::Copulas.GaussianCopula{2})
    p = Distributions.params(C)
    return (; Σ=p[1])
end

@inline function _vine_params(C::Copulas.TCopula{2,T}) where {T<:Real}
    p = Distributions.params(C)
    # Copulas.jl's generic public `params` implementation is structural and
    # infers `Any`. The concrete TCopula type carries the scalar element type,
    # so assert only the public tuple's mathematical value types after reading
    # them through `params`.
    return (; ν=p[1]::T, Σ=p[2]::Matrix{T})
end

@inline function _vine_params(C::Copulas.FGMCopula{2})
    p = Distributions.params(C)
    return (; θ=p[1])
end

@inline function _vine_arch_params(C, names::Tuple)
    p = Distributions.params(C)
    return NamedTuple{names}(ntuple(i -> p[i], length(names)))
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

@inline function _vine_params(C::Copulas.ExtremeValueCopula{2,<:Copulas.MOTail})
    p = Distributions.params(C)
    return (; λ₁=p[1], λ₂=p[2], λ₃=p[3])
end

@inline function _vine_params(C::Copulas.ExtremeValueCopula{2,<:Copulas.BC2Tail})
    p = Distributions.params(C)
    a = only(p)
    return (; a=a[1], b=a[2])
end

@inline function _vine_params(C::Copulas.ExtremeValueCopula{2,<:Copulas.TawnTail})
    p = Distributions.params(C)
    return (; dep=p[1], weights=Tuple(p[i] for i in 2:length(p)))
end

@inline function _vine_params(C::Copulas.ExtremeValueCopula{2,<:Copulas.tEVTail})
    p = Distributions.params(C)
    return (; ν=p[1], ρ=p[2])
end

@inline function _vine_params(C::Copulas.ExtremeValueCopula{2,<:Copulas.AsymLogTail})
    p = Distributions.params(C)
    return (; α=p[1], θ₁=p[2], θ₂=p[3])
end

@inline function _vine_params(C::Copulas.ExtremeValueCopula{2,<:Copulas.AsymGalambosTail})
    p = Distributions.params(C)
    α, θ₁, θ₂ = p[1][1], p[2][end], p[3][end]
    return (; α, θ₁, θ₂)
end

@inline function _vine_params(C::Copulas.ExtremeValueCopula{2,<:Copulas.AsymMixedTail})
    p = Distributions.params(C)
    return (; θ₁=p[1], θ₂=p[2])
end

@inline function _vine_params(C::Copulas.ExtremeValueCopula{2})
    p = Distributions.params(C)
    return (; θ=p[1])
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
