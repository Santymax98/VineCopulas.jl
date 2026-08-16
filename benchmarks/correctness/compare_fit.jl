include(joinpath(@__DIR__, "common.jl"))

float_or_nothing(x) = isempty(x) ? nothing : parse(Float64, x)

edge_key(r) = (
    r["phase"], r["dataset"], parse(Int, r["tree"]),
    parse(Int, r["a"]), parse(Int, r["b"]), r["conditioning"],
)

function parameter_ok(family, j, r)
    jp1, rp1 = float_or_nothing(j["p1"]), float_or_nothing(r["p1"])
    jp2, rp2 = float_or_nothing(j["p2"]), float_or_nothing(r["p2"])
    diffs = Float64[]
    ok = true
    if jp1 !== nothing || rp1 !== nothing
        (jp1 === nothing || rp1 === nothing) && return false, [Inf]
        d = abs(jp1 - rp1)
        tol = family == "Student" ? 1.5e-2 : 7.5e-3
        ok &= d <= tol
        push!(diffs, d)
    end
    if jp2 !== nothing || rp2 !== nothing
        (jp2 === nothing || rp2 === nothing) && return false, vcat(diffs, Inf)
        d = abs(jp2 - rp2)
        tol = family == "Student" ? 0.50 : 1.5e-2
        ok &= d <= tol
        push!(diffs, d)
    end
    return ok, diffs
end

function load_candidate_groups(path)
    isfile(path) || return Dict{Any,Vector{Dict{String,String}}}()
    groups = Dict{Any,Vector{Dict{String,String}}}()
    for r in read_csv(path)
        get(r, "status", "") == "ok" || continue
        isempty(get(r, "score", "")) && continue
        push!(get!(groups, edge_key(r), Dict{String,String}[]), r)
    end
    for rows in values(groups)
        sort!(rows; by=r -> parse(Float64, r["score"]))
    end
    return groups
end

fmt_candidate(r) = "$(r["family"])@$(r["rotation"]) score=$(r["score"]) LL=$(r["loglik"])"

function candidate_diagnostic(groups, key, engine)
    rows = get(groups, key, Dict{String,String}[])
    isempty(rows) && return "$engine candidates: unavailable"
    top = rows[1:min(end, 3)]
    ranking = join(fmt_candidate.(top), "; ")
    if length(top) > 1
        gap = parse(Float64, top[2]["score"]) - parse(Float64, top[1]["score"])
        return "$engine candidates: $ranking; winner-runner Δscore=$(fmt3(gap))"
    end
    return "$engine candidates: $ranking"
end

function main()
    sj = Dict(r["phase"] => r for r in read_csv(joinpath(RESULTS_DIR, "fit_summary_julia.csv")))
    sr = Dict(r["phase"] => r for r in read_csv(joinpath(RESULTS_DIR, "fit_summary_r.csv")))
    ej = Dict(edge_key(r) => r for r in read_csv(joinpath(RESULTS_DIR, "fit_edges_julia.csv")))
    er = Dict(edge_key(r) => r for r in read_csv(joinpath(RESULTS_DIR, "fit_edges_r.csv")))
    cj = load_candidate_groups(joinpath(RESULTS_DIR, "fit_candidates_julia.csv"))
    cr = load_candidate_groups(joinpath(RESULTS_DIR, "fit_candidates_r.csv"))

    phases = sort!(collect(union(Set(keys(sj)), Set(keys(sr)))))
    lines = ["VineCopulas.jl <-> rvinecopulib fitting/selection correctness gate", ""]
    overall = true

    for phase in phases
        j = get(sj, phase, nothing)
        r = get(sr, phase, nothing)
        if j === nothing || r === nothing
            overall = false
            push!(lines, "$phase: FAIL missing summary from one engine")
            continue
        end
        if j["status"] != "ok" || r["status"] != "ok"
            overall = false
            push!(lines, "$phase: FAIL engine error")
            push!(lines, "  Julia : $(get(j, "error", ""))")
            push!(lines, "  R     : $(get(r, "error", ""))")
            continue
        end

        n = parse(Int, j["n"])
        same_n = n == parse(Int, r["n"])
        llj, llr = parse(Float64, j["loglik"]), parse(Float64, r["loglik"])
        ll_abs = abs(llj - llr)
        ll_per_obs = ll_abs / max(n, 1)
        ll_tol = startswith(phase, "fixed_") ? 2e-4 : 5e-4
        ll_ok = same_n && ll_per_obs <= ll_tol

        kj, kr = parse(Float64, j["npars"]), parse(Float64, r["npars"])
        k_ok = abs(kj - kr) <= 1e-10

        jkeys = Set(k for k in keys(ej) if k[1] == phase)
        rkeys = Set(k for k in keys(er) if k[1] == phase)
        structure_ok = jkeys == rkeys
        family_ok = structure_ok
        params_ok = structure_ok
        max_param_diff = 0.0
        disagreements = String[]

        if structure_ok
            for key in sort!(collect(jkeys))
                jr, rr = ej[key], er[key]
                if jr["family"] != rr["family"] || parse(Int, jr["rotation"]) != parse(Int, rr["rotation"])
                    family_ok = false
                    push!(disagreements,
                        "T$(key[3]) ($(key[4]),$(key[5])|$(key[6])): " *
                        "Julia=$(jr["family"])@$(jr["rotation"]) R=$(rr["family"])@$(rr["rotation"])"
                    )
                    push!(disagreements, "  " * candidate_diagnostic(cj, key, "Julia"))
                    push!(disagreements, "  " * candidate_diagnostic(cr, key, "R"))
                    continue
                end
                pok, diffs = parameter_ok(jr["family"], jr, rr)
                params_ok &= pok
                !isempty(diffs) && (max_param_diff = max(max_param_diff, maximum(diffs)))
            end
        else
            push!(disagreements, "edges only Julia: $(collect(setdiff(jkeys, rkeys))[1:min(end,8)])")
            push!(disagreements, "edges only R: $(collect(setdiff(rkeys, jkeys))[1:min(end,8)])")
        end

        phase_ok = ll_ok && k_ok && structure_ok && family_ok && params_ok
        overall &= phase_ok
        push!(lines,
            "$phase: $(phase_ok ? "PASS" : "FAIL") | Δloglik=$(fmt3(ll_abs)) " *
            "($(fmt3(ll_per_obs))/obs) | npars=$(kj)/$(kr) | " *
            "structure=$(structure_ok ? "yes" : "NO") | families=$(family_ok ? "yes" : "NO") | " *
            "params=$(params_ok ? "yes" : "NO") (max raw Δ=$(fmt3(max_param_diff)))"
        )
        append!(lines, ("  " * msg for msg in disagreements[1:min(end, 12)]))
    end

    append!(lines, ["", "FITTING/SELECTION GATE: $(overall ? "PASS" : "FAIL")"])
    text = join(lines, '\n') * "\n"
    write(joinpath(RESULTS_DIR, "fit_report.txt"), text)
    print(text)
    exit(overall ? 0 : 1)
end

main()
