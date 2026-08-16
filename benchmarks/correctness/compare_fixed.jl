include(joinpath(@__DIR__, "common.jl"))

const PAIR_TOL = Dict(
    "logpdf" => (2e-7, 2e-7),
    "h1" => (2e-7, 2e-7),
    "h2" => (2e-7, 2e-7),
    "hinv1" => (5e-7, 5e-7),
    "hinv2" => (5e-7, 5e-7),
)
const VINE_TOL = Dict(
    "logpdf" => (5e-7, 5e-7),
    "rosenblatt" => (2e-6, 2e-6),
    "inverse" => (2e-6, 2e-6),
)

close_enough(ma, mr, atol, rtol) = ma <= atol || mr <= rtol

function compare_pair(lines)
    rr = read_csv(joinpath(RESULTS_DIR, "pair_r.csv"))
    jr = read_csv(joinpath(RESULTS_DIR, "pair_julia.csv"))
    key(r) = (r["case"], parse(Int, r["row"]))
    rd = Dict(key(r) => r for r in rr)
    jd = Dict(key(r) => r for r in jr)
    if Set(keys(rd)) != Set(keys(jd))
        push!(lines, "PAIR: FAIL key mismatch between engines")
        return false
    end

    ok = true
    cases = sort!(unique(first(k) for k in keys(rd)))
    for case in cases
        ks = sort!([k for k in keys(rd) if k[1] == case]; by=last)
        case_ok = true
        parts = String[]
        for metric in ("logpdf", "h1", "h2", "hinv1", "hinv2")
            atol, rtol = PAIR_TOL[metric]
            a = [parse(Float64, jd[k][metric]) for k in ks]
            b = [parse(Float64, rd[k][metric]) for k in ks]
            ma, mr = max_abs_rel(a, b)
            good = close_enough(ma, mr, atol, rtol)
            case_ok &= good
            push!(parts, "$metric:abs=$(fmt3(ma)),rel=$(fmt3(mr))$(good ? "" : " !")")
        end
        ok &= case_ok
        push!(lines, "PAIR $case: $(case_ok ? "PASS" : "FAIL") | " * join(parts, " | "))
    end
    return ok
end

function compare_structures(lines)
    rr = Dict(r["model"] => r for r in read_csv(joinpath(RESULTS_DIR, "structure_r.csv")))
    jr = Dict(r["model"] => r for r in read_csv(joinpath(RESULTS_DIR, "structure_julia.csv")))
    if Set(keys(rr)) != Set(keys(jr))
        push!(lines, "STRUCTURE: FAIL model key mismatch")
        return false
    end
    ok = true
    for name in sort!(collect(keys(rr)))
        same = all(rr[name][k] == jr[name][k] for k in ("p", "trunc", "order"))
        matrix_same = rr[name]["matrix"] == jr[name]["matrix"]
        ok &= same
        push!(lines,
            "STRUCTURE $name: $(same ? "PASS" : "FAIL") | raw_matrix=" *
            (matrix_same ? "same" : "canonicalized/different")
        )
        if !same
            push!(lines, "  R     : $(rr[name])")
            push!(lines, "  Julia : $(jr[name])")
        end
    end
    return ok
end

function compare_vines(lines)
    rr = read_csv(joinpath(RESULTS_DIR, "vine_r.csv"))
    jr = read_csv(joinpath(RESULTS_DIR, "vine_julia.csv"))
    key(r) = (r["model"], r["metric"], parse(Int, r["row"]), parse(Int, r["dim"]))
    rd = Dict(key(r) => parse(Float64, r["value"]) for r in rr)
    jd = Dict(key(r) => parse(Float64, r["value"]) for r in jr)
    if Set(keys(rd)) != Set(keys(jd))
        push!(lines, "FIXED VINE: FAIL result key mismatch between engines")
        only_r = collect(setdiff(Set(keys(rd)), Set(keys(jd))))[1:min(end, 5)]
        only_j = collect(setdiff(Set(keys(jd)), Set(keys(rd))))[1:min(end, 5)]
        push!(lines, "  only R: $only_r")
        push!(lines, "  only Julia: $only_j")
        return false
    end

    ok = true
    models = sort!(unique(first(k) for k in keys(rd)))
    for model in models
        for metric in ("logpdf", "rosenblatt", "inverse")
            atol, rtol = VINE_TOL[metric]
            ks = sort!([k for k in keys(rd) if k[1] == model && k[2] == metric])
            a = [jd[k] for k in ks]
            b = [rd[k] for k in ks]
            ma, mr = max_abs_rel(a, b)
            good = close_enough(ma, mr, atol, rtol)
            ok &= good
            push!(lines,
                "FIXED VINE $model $metric: $(good ? "PASS" : "FAIL") " *
                "max_abs=$(fmt3(ma)) max_rel=$(fmt3(mr)) tol=($(atol),$(rtol))"
            )
        end
    end
    return ok
end

function main()
    lines = ["VineCopulas.jl <-> rvinecopulib fixed-model correctness gate", ""]
    ok_pair = compare_pair(lines)
    push!(lines, "")
    ok_struct = compare_structures(lines)
    push!(lines, "")
    ok_vine = compare_vines(lines)
    ok = ok_pair && ok_struct && ok_vine
    append!(lines, ["", "FIXED-MODEL GATE: $(ok ? "PASS" : "FAIL")"])
    text = join(lines, '\n') * "\n"
    write(joinpath(RESULTS_DIR, "fixed_report.txt"), text)
    print(text)
    exit(ok ? 0 : 1)
end

main()
