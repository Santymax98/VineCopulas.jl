using BenchmarkTools
using Copulas
using Distributions: cdf, quantile
using VineCopulas

# This diagnostic benchmarks the architectural boundary between VineCopulas.jl
# pair terminology and the canonical Copulas.jl conditioning API.
#
# It intentionally measures standalone pair primitives only:
#
#   hfunc1(C, u, v)   vs cdf(condition(C, 2, v), u)
#   hfunc2(C, u, v)   vs cdf(condition(C, 1, u), v)
#   hinv1(C, q, v)    vs quantile(condition(C, 2, v), q)
#   hinv2(C, q, u)    vs quantile(condition(C, 1, u), q)
#
# Fused vine traversal kernels remain covered by fused_pair_kernels.jl.

const SMOKE = lowercase(get(ENV, "SMOKE", "false")) in ("1", "true", "t", "yes", "y")
const SAMPLES = parse(Int, get(ENV, "SAMPLES", SMOKE ? "2" : "10"))
const EVALS = parse(Int, get(ENV, "EVALS", "1"))
const SECONDS = max(parse(Float64, get(ENV, "SECONDS", SMOKE ? "0.01" : "0.10")), 0.01)
const MATRIX = lowercase(get(ENV, "MATRIX", SMOKE ? "smoke" : "core"))
const FAMILY_FILTER = filter(!isempty, strip.(split(get(ENV, "FAMILIES", ""), ','; keepempty=false)))
const OUT = get(ENV, "OUT", "")

@inline specialized_hfunc1(C, u, v, q) = hfunc1(C, u, v)
@inline specialized_hfunc2(C, u, v, q) = hfunc2(C, u, v)
@inline specialized_hinv1(C, u, v, q) = hinv1(C, q, v)
@inline specialized_hinv2(C, u, v, q) = hinv2(C, q, u)

@inline generic_hfunc1(C, u, v, q) = cdf(Copulas.condition(C, 2, v), u)
@inline generic_hfunc2(C, u, v, q) = cdf(Copulas.condition(C, 1, u), v)
@inline generic_hinv1(C, u, v, q) = quantile(Copulas.condition(C, 2, v), q)
@inline generic_hinv2(C, u, v, q) = quantile(Copulas.condition(C, 1, u), q)

const OPS = (
    (; name="hfunc1", specialized=specialized_hfunc1, generic=generic_hfunc1),
    (; name="hfunc2", specialized=specialized_hfunc2, generic=generic_hfunc2),
    (; name="hinv1", specialized=specialized_hinv1, generic=generic_hinv1),
    (; name="hinv2", specialized=specialized_hinv2, generic=generic_hinv2),
)

const POINTS = (
    (; name="central", u=0.37, v=0.72, q=0.41),
    (; name="lower_tail", u=1e-8, v=0.19, q=1e-8),
    (; name="upper_tail", u=1 - 1e-8, v=0.83, q=1 - 1e-8),
    (; name="opposite_tails", u=1e-6, v=1 - 1e-6, q=0.97),
)

function extreme_value_copula_2(tail)
    try
        return Copulas.ExtremeValueCopula{2}(tail)
    catch err
        err isa MethodError || rethrow()
        return Copulas.ExtremeValueCopula(2, tail)
    end
end

function push_case!(cases, family, regime, maker, path)
    if !isempty(FAMILY_FILTER) && !(family in FAMILY_FILTER)
        return cases
    end

    try
        push!(cases, (; family, regime, C=maker(), path))
    catch err
        @warn "Skipping unavailable benchmark case" family regime exception=(err, catch_backtrace())
    end
    return cases
end

function pair_cases()
    cases = Any[]

    push_case!(cases, "fgm", "generic_fallback", () -> FGMCopula(2, 0.6), "semantic fallback")

    push_case!(cases, "gaussian", "near_independence", () -> GaussianCopula([1.0 0.05; 0.05 1.0]), "family specialization")
    push_case!(cases, "gaussian", "interior", () -> GaussianCopula([1.0 0.60; 0.60 1.0]), "family specialization")

    push_case!(cases, "student", "near_independence", () -> TCopula(4, [1.0 0.05; 0.05 1.0]), "family specialization")
    push_case!(cases, "student", "interior", () -> TCopula(4, [1.0 0.45; 0.45 1.0]), "family specialization")

    push_case!(cases, "clayton", "near_independence", () -> ClaytonCopula(2, 0.05), "archimedean specialization")
    push_case!(cases, "clayton", "interior", () -> ClaytonCopula(2, 1.50), "archimedean specialization")

    push_case!(cases, "frank", "near_independence", () -> FrankCopula(2, 0.10), "archimedean specialization")
    push_case!(cases, "frank", "interior", () -> FrankCopula(2, 2.50), "archimedean specialization")

    push_case!(cases, "gumbel", "near_independence", () -> GumbelCopula(2, 1.01), "archimedean specialization")
    push_case!(cases, "gumbel", "interior", () -> GumbelCopula(2, 1.30), "archimedean specialization")

    push_case!(cases, "joe", "near_independence", () -> JoeCopula(2, 1.01), "archimedean specialization")
    push_case!(cases, "joe", "interior", () -> JoeCopula(2, 1.50), "archimedean specialization")

    push_case!(cases, "bb1", "interior", () -> BB1Copula(2, 1.20, 1.50), "archimedean specialization")
    push_case!(cases, "bb6", "interior", () -> BB6Copula(2, 1.20, 1.50), "archimedean specialization")
    push_case!(cases, "bb7", "interior", () -> BB7Copula(2, 1.20, 1.50), "archimedean specialization")
    push_case!(cases, "bb8", "interior", () -> BB8Copula(2, 1.50, 0.60), "archimedean specialization")

    push_case!(cases, "ev_log", "interior", () -> extreme_value_copula_2(Copulas.LogTail(1.50)), "extreme-value specialization")
    push_case!(cases, "ev_galambos", "interior", () -> extreme_value_copula_2(Copulas.GalambosTail(1.50)), "extreme-value specialization")
    push_case!(cases, "ev_husler_reiss", "interior", () -> extreme_value_copula_2(Copulas.HuslerReissTail(1.20)), "extreme-value specialization")

    if SMOKE || MATRIX == "smoke"
        return cases[1:min(end, 4)]
    elseif MATRIX == "full" || !isempty(FAMILY_FILTER)
        return cases
    elseif MATRIX == "core"
        core_families = ("fgm", "gaussian", "student", "clayton", "frank", "gumbel", "joe")
        return [
            case for case in cases
            if case.family in core_families && (case.regime == "interior" || case.family in ("fgm", "gaussian"))
        ]
    else
        error("Unsupported MATRIX=$MATRIX. Use MATRIX=core, MATRIX=full, or MATRIX=smoke.")
    end
end

function active_points()
    if SMOKE || MATRIX == "smoke"
        return POINTS[1:1]
    elseif MATRIX == "full"
        return POINTS
    else
        return (POINTS[1], POINTS[2], POINTS[3])
    end
end

function bench_call(f, C, p)
    f(C, p.u, p.v, p.q)
    trial = @benchmark $f($C, $(p.u), $(p.v), $(p.q)) samples=SAMPLES evals=EVALS seconds=SECONDS
    return median(trial)
end

function allocated_call(f, C, p)
    f(C, p.u, p.v, p.q)
    return @allocated f(C, p.u, p.v, p.q)
end

function inferred_ok(f, C, p)
    rts = Base.return_types(f, Tuple{typeof(C), typeof(p.u), typeof(p.v), typeof(p.q)})
    length(rts) == 1 || return false
    return isconcretetype(only(rts)) && only(rts) !== Any
end

function try_value(f, C, p)
    try
        return (; ok=true, value=Float64(f(C, p.u, p.v, p.q)), error="")
    catch err
        return (; ok=false, value=NaN, error=sprint(showerror, err))
    end
end

function fmt_num(x; digits=3)
    isfinite(x) || return string(x)
    ax = abs(x)
    if ax == 0 || 1e-3 <= ax < 1e5
        return string(round(x; digits))
    end
    return string(round(x; sigdigits=digits))
end

fmt_bool(x) = x ? "yes" : "no"

function csv_escape(x)
    s = string(x)
    if occursin(',', s) || occursin('"', s) || occursin('\n', s)
        return '"' * replace(s, "\"" => "\"\"") * '"'
    end
    return s
end

function emit_csv(path, rows)
    mkpath(dirname(path))
    header = (
        "family", "regime", "region", "operation", "path",
        "vine_ns", "condition_ns", "speedup_vine_over_condition",
        "vine_bytes", "condition_bytes", "absdiff",
        "vine_inferred", "condition_inferred", "vine_error", "condition_error",
    )
    open(path, "w") do io
        println(io, join(header, ","))
        for r in rows
            println(io, join(csv_escape.(r), ","))
        end
    end
    return path
end

function main()
    rows = Any[]
    cases = pair_cases()
    points = active_points()

    println("Pair-copula conditional boundary diagnostic")
    println("matrix=$MATRIX samples=$SAMPLES evals=$EVALS seconds=$SECONDS smoke=$SMOKE")
    println("families=", isempty(FAMILY_FILTER) ? "all" : join(FAMILY_FILTER, ","))
    println()
    println("| family | regime | path | region | op | vine ns | condition ns | speedup | vine bytes | condition bytes | absdiff | vine inferred | condition inferred |")
    println("|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|")

    for case in cases, p in points, op in OPS
        sv = try_value(op.specialized, case.C, p)
        gv = try_value(op.generic, case.C, p)

        sest = sv.ok ? bench_call(op.specialized, case.C, p) : (; time=NaN)
        gest = gv.ok ? bench_call(op.generic, case.C, p) : (; time=NaN)
        sbytes = sv.ok ? allocated_call(op.specialized, case.C, p) : missing
        gbytes = gv.ok ? allocated_call(op.generic, case.C, p) : missing
        diff = sv.ok && gv.ok ? abs(sv.value - gv.value) : NaN
        speedup = sv.ok && gv.ok ? gest.time / sest.time : NaN
        sinf = sv.ok ? inferred_ok(op.specialized, case.C, p) : false
        ginf = gv.ok ? inferred_ok(op.generic, case.C, p) : false

        row = (
            case.family, case.regime, p.name, op.name, case.path,
            sv.ok ? sest.time : NaN,
            gv.ok ? gest.time : NaN,
            speedup,
            sbytes, gbytes, diff,
            fmt_bool(sinf), fmt_bool(ginf), sv.error, gv.error,
        )
        push!(rows, row)

        println(
            "| ", case.family,
            " | ", case.regime,
            " | ", case.path,
            " | ", p.name,
            " | ", op.name,
            " | ", sv.ok ? fmt_num(sest.time) : "error",
            " | ", gv.ok ? fmt_num(gest.time) : "error",
            " | ", fmt_num(speedup),
            " | ", sbytes,
            " | ", gbytes,
            " | ", fmt_num(diff),
            " | ", fmt_bool(sinf),
            " | ", fmt_bool(ginf),
            " |",
        )
    end

    if !isempty(OUT)
        emit_csv(OUT, rows)
        println()
        println("Wrote CSV: ", OUT)
    end

    println()
    println("Interpretation: speedup > 1 means the VineCopulas.jl hfunc/hinv route is faster than the canonical Copulas.condition route.")
    println("Use fused_pair_kernels.jl separately to measure traversal-specific fused kernels.")
end

main()
