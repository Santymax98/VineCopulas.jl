using Copulas
using Distributions
using Random
using VineCopulas

const SUPPORTED_FAMILIES = ("indep", "gaussian", "t", "clayton", "gumbel", "frank", "joe", "bb1", "bb6", "bb7", "bb8", "mixed")

# Parameters are intentionally fixed and mirrored in r_helpers.R.
# This keeps value validation meaningful.
function paircopula(family::AbstractString)
    family == "indep" && return Copulas.IndependentCopula(2)
    family == "gaussian" && return GaussianCopula([1.0 0.35; 0.35 1.0])
    family == "t" && return TCopula(4, [1.0 0.35; 0.35 1.0])
    family == "clayton" && return ClaytonCopula(2, 1.5)
    family == "gumbel" && return GumbelCopula(2, 1.3)
    family == "frank" && return FrankCopula(2, 2.5)
    family == "joe" && return JoeCopula(2, 1.5)
    family == "bb1" && return BB1Copula(2, 1.2, 1.5)
    family == "bb6" && return BB6Copula(2, 1.2, 1.5)
    family == "bb7" && return BB7Copula(2, 1.2, 1.5)
    family == "bb8" && return BB8Copula(2, 1.5, 0.6)
    error("Unsupported family: $family. Supported: $(join(SUPPORTED_FAMILIES, ", "))")
end

function mixed_family_at(tree::Int, edge::Int)
    pool = ("gaussian", "t", "clayton", "gumbel", "frank", "joe", "bb1", "bb6", "bb7", "bb8")
    return pool[mod1(tree + edge - 1, length(pool))]
end

function homogeneous_edges(pc, p::Int, trunc::Int; as_tuple::Bool=false)
    levels = [[pc for _ in 1:(p - tree)] for tree in 1:trunc]
    return as_tuple ? Tuple(Tuple(level) for level in levels) : levels
end

function mixed_edges(p::Int, trunc::Int)
    # Tuple-of-tuples preserves as much type information as possible for mixed vines.
    return Tuple(Tuple(paircopula(mixed_family_at(tree, edge)) for edge in 1:(p - tree)) for tree in 1:trunc)
end

function make_edges(family::AbstractString, p::Int, trunc::Int)
    family == "mixed" && return mixed_edges(p, trunc)
    return homogeneous_edges(paircopula(family), p, trunc)
end

function make_vine(model::AbstractString, family::AbstractString, p::Int, trunc::Int)
    order0 = collect(1:p)
    E = make_edges(family, p, trunc)
    if model == "D"
        return DVineCopula(order0, E; trunc=trunc)
    elseif model == "C"
        return CVineCopula(order0, E; trunc=trunc)
    else
        error("Unsupported MODEL=$model. Use MODEL=D or MODEL=C.")
    end
end

function env_string(name::AbstractString, default::AbstractString)
    return get(ENV, name, default)
end

function env_int(name::AbstractString, default::Integer)
    return parse(Int, get(ENV, name, string(default)))
end

function env_bool(name::AbstractString, default::Bool)
    val = lowercase(get(ENV, name, default ? "true" : "false"))
    return val in ("1", "true", "t", "yes", "y")
end

function maybe_edge_eltype(vine)
    E = edges(vine)
    isempty(E) && return "<none>"
    first_level = E[1]
    if first_level isa Tuple
        return string(typeof(first_level))
    else
        return string(eltype(first_level))
    end
end

function csv_escape(x)
    s = string(x)
    if occursin(',', s) || occursin('"', s) || occursin('\n', s)
        return '"' * replace(s, "\"" => "\"\"") * '"'
    end
    return s
end

function write_rows(path::AbstractString, header, rows)
    mkpath(dirname(path))
    open(path, "w") do io
        println(io, join(header, ","))
        for r in rows
            println(io, join(csv_escape.(r), ","))
        end
    end
    return path
end
