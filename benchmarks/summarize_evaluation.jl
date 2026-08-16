const ROOT = @__DIR__
const RESULTS = joinpath(ROOT, "results")
const REPORTS = joinpath(ROOT, "reports")
mkpath(REPORTS)

function parse_csv_line(line::AbstractString)
    fields = String[]
    buf = IOBuffer()
    quoted = false
    i = firstindex(line)
    while i <= lastindex(line)
        c = line[i]
        if c == '"'
            ni = nextind(line, i)
            if quoted && ni <= lastindex(line) && line[ni] == '"'
                print(buf, '"'); i = ni
            else
                quoted = !quoted
            end
        elseif c == ',' && !quoted
            push!(fields, strip(String(take!(buf))))
        else
            print(buf, c)
        end
        i = nextind(line, i)
    end
    push!(fields, strip(String(take!(buf))))
    return fields
end

function read_csv(path)
    lines = readlines(path)
    isempty(lines) && return Dict{String,String}[]
    header = parse_csv_line(first(lines))
    rows = Dict{String,String}[]
    for line in Iterators.drop(lines, 1)
        isempty(strip(line)) && continue
        vals = parse_csv_line(line)
        length(vals) == length(header) || error("CSV column mismatch in $path")
        push!(rows, Dict(header .=> vals))
    end
    rows
end

function duration_seconds(x)
    s = replace(strip(x), "μ" => "u", "µ" => "u")
    m = match(r"^([0-9.eE+\-]+)\s*(ns|us|ms|s)$", s)
    m === nothing && error("unsupported duration '$x'")
    value = parse(Float64, m.captures[1])
    unit = m.captures[2]
    value * (unit == "ns" ? 1e-9 : unit == "us" ? 1e-6 : unit == "ms" ? 1e-3 : 1.0)
end

const JULIA_OP = Dict(
    "logpdf vector" => "logpdf",
    "loglikelihood sum" => "loglikelihood",
    "rosenblatt" => "rosenblatt",
    "inverse_rosenblatt" => "inverse_rosenblatt",
    "rand" => "rand",
    "cdf qmc matrix" => "cdf",
)
const R_OP = Dict(
    "density_vector" => "logpdf",
    "loglikelihood_sum" => "loglikelihood",
    "rosenblatt" => "rosenblatt",
    "inverse_rosenblatt" => "inverse_rosenblatt",
    "rand" => "rand",
    "cdf_qmc_matrix" => "cdf",
)

fmt_time(x) = x >= 1 ? "$(round(x, digits=3)) s" : x >= 1e-3 ? "$(round(1000x, digits=1)) ms" : "$(round(1e6x, digits=1)) μs"

function interpretation(ratio)
    0.95 <= ratio <= 1.05 && return "near parity"
    ratio > 1 && return "Julia $(round(ratio, digits=2))× faster"
    return "R $(round(inv(ratio), digits=2))× faster"
end

families = split(get(ENV, "FAMILIES", "gaussian clayton gumbel frank"))
get(ENV, "EXTENDED", "false") in ("true", "1") && append!(families, ["joe", "bb1", "bb6", "bb7", "bb8"])
get(ENV, "MIXED", "false") in ("true", "1") && push!(families, "mixed")
unique!(families)
models = split(get(ENV, "MODELS", "D"))
scenarios = split(get(ENV, "SCENARIOS", "5:10000:4 10:10000:2 20:10000:2"))

rows = NamedTuple[]
validation = NamedTuple[]

for model in models, family in families, scenario in scenarios
    p, n, trunc = parse.(Int, split(scenario, ':'))
    stem = "$(model)_$(family)_p$(p)_n$(n)_trunc$(trunc)"
    jpath = joinpath(RESULTS, "bench_julia_$(stem).csv")
    rpath = joinpath(RESULTS, "bench_r_$(stem).csv")
    isfile(jpath) || error("missing Julia benchmark result: $jpath")
    isfile(rpath) || error("missing R benchmark result: $rpath")

    jmap = Dict(JULIA_OP[r["operation"]] => parse(Float64, r["median_s"]) for r in read_csv(jpath))
    rmap = Dict(R_OP[r["operation"]] => duration_seconds(r["median"]) for r in read_csv(rpath))
    Set(keys(jmap)) == Set(keys(rmap)) || error("operation mismatch for $stem")

    for op in ("logpdf", "loglikelihood", "rosenblatt", "inverse_rosenblatt", "rand", "cdf")
        tj, tr = jmap[op], rmap[op]
        ratio = tr / tj
        push!(rows, (; model, family, p, n, trunc, operation=op,
            julia_median_s=tj, r_median_s=tr, ratio, interpretation=interpretation(ratio)))
    end

    vpath = joinpath(RESULTS, "validate_julia_vs_r_$(stem).csv")
    if isfile(vpath)
        for r in read_csv(vpath)
            push!(validation, (; model, family, p, n, trunc,
                quantity=r["quantity"], max_abs=parse(Float64, r["max_abs"]),
                mean_abs=parse(Float64, r["mean_abs"]),
                median_abs=parse(Float64, r["median_abs"]),
                max_rel=parse(Float64, r["max_rel"]),
                mean_rel=parse(Float64, r["mean_rel"]),
                n_values=parse(Int, r["n_values"])))
        end
    end
end

open(joinpath(REPORTS, "benchmark_times_summary.csv"), "w") do io
    println(io, "model,family,p,n,trunc,operation,julia_median_s,r_median_s,ratio_r_over_julia,interpretation")
    for r in rows
        println(io, join((r.model,r.family,r.p,r.n,r.trunc,r.operation,r.julia_median_s,r.r_median_s,r.ratio,r.interpretation), ','))
    end
end

open(joinpath(REPORTS, "benchmark_validation_summary.csv"), "w") do io
    println(io, "model,family,p,n,trunc,quantity,max_abs,mean_abs,median_abs,max_rel,mean_rel,n_values")
    for r in validation
        println(io, join((r.model,r.family,r.p,r.n,r.trunc,r.quantity,r.max_abs,r.mean_abs,r.median_abs,r.max_rel,r.mean_rel,r.n_values), ','))
    end
end

function table_rows(operation)
    [r for r in rows if r.operation == operation]
end

open(joinpath(REPORTS, "benchmark_summary.md"), "w") do io
    println(io, "# Evaluation benchmark reference\n")
    println(io, "Generated by `bash benchmarks/run_main.sh` from the exact family/scenario set used in that run. Existing unrelated files under `benchmarks/results/` are not included.\n")
    println(io, "Configuration: Julia `$(VERSION)` on `$(Sys.MACHINE)`; families `$(join(families, ", "))`; scenarios `$(join(scenarios, ", "))`.\n")

    println(io, "## Vectorized log density\n")
    println(io, "| Family | \$p\$ | trunc | Julia | `rvinecopulib` | Interpretation |")
    println(io, "|---|---:|---:|---:|---:|---|")
    for r in table_rows("logpdf")
        println(io, "| $(r.family) | $(r.p) | $(r.trunc) | $(fmt_time(r.julia_median_s)) | $(fmt_time(r.r_median_s)) | $(r.interpretation) |")
    end

    println(io, "\n## Transforms and simulation\n")
    println(io, "The cells show the plain-language timing comparison; exact medians are in `benchmark_times_summary.csv`.\n")
    println(io, "| Family | \$p\$ | Rosenblatt | Inverse Rosenblatt | Simulation |")
    println(io, "|---|---:|---|---|---|")
    for model in models, family in families, scenario in scenarios
        p, n, trunc = parse.(Int, split(scenario, ':'))
        getrow(op) = only(r for r in rows if r.model==model && r.family==family && r.p==p && r.n==n && r.trunc==trunc && r.operation==op)
        println(io, "| $family | $p | $(getrow("rosenblatt").interpretation) | $(getrow("inverse_rosenblatt").interpretation) | $(getrow("rand").interpretation) |")
    end

    logvals = [r for r in validation if r.quantity == "logpdf"]
    invvals = [r for r in validation if r.quantity == "inv(ros(U)) vs U"]
    rosvals = [r for r in validation if r.quantity == "ros(inv(Z)) vs Z"]
    cdfvals = [r for r in validation if r.quantity == "cdf qmc"]

    println(io, "\n## Numerical checks\n")
    if !isempty(logvals)
        println(io, "Worst log-density max absolute difference: `$(maximum(r.max_abs for r in logvals))`.")
    end
    if !isempty(invvals)
        println(io, "Worst `inverse_rosenblatt(rosenblatt(U))` max absolute error: `$(maximum(r.max_abs for r in invvals))`.")
    end
    if !isempty(rosvals)
        println(io, "Worst `rosenblatt(inverse_rosenblatt(Z))` max absolute error: `$(maximum(r.max_abs for r in rosvals))`.")
    end
    if !isempty(cdfvals)
        println(io, "Largest numerical CDF QMC absolute difference: `$(maximum(r.max_abs for r in cdfvals))`. CDF values are approximate and are not interpreted as exact identities.")
    end

    println(io, "\n## Reproduce\n")
    println(io, "```bash\nbash benchmarks/run_main.sh\n```\n")
    println(io, "The command reruns the battery and regenerates this report automatically.")
end

println("Wrote evaluation reports under $REPORTS")
