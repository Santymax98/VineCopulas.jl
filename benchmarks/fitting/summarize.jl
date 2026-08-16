mode = get(ENV, "MODE", "common")
dir = joinpath(@__DIR__, "results")
reportdir = joinpath(@__DIR__, "..", "reports")
mkpath(reportdir)

function readrows(path)
    lines = readlines(path)
    header = split(first(lines), ',')
    [Dict(header .=> split(line, ',', limit=length(header))) for line in Iterators.drop(lines, 1) if !isempty(strip(line))]
end

julia_rows = readrows(joinpath(dir, "julia_$(mode).csv"))
r_rows = readrows(joinpath(dir, "r_$(mode).csv"))
key(r) = (r["scope"], r["dataset"])
rmap = Dict(key(r) => r for r in r_rows)

labels = Dict(
    "pair_selection" => "Pair selection",
    "fixed_vine" => "Fixed-structure R-vine",
    "automatic_vine" => "Automatic R-vine",
)

out = joinpath(reportdir, "fitting_benchmark_$(mode).md")
open(out, "w") do io
    n_cfg = get(ENV, "N", get(first(julia_rows), "n", "?"))
    p_cfg = get(ENV, "P", "?")
    repeats_cfg = get(ENV, "REPEATS", "3")
    println(io, "# Fitting benchmark — $(mode)\n")
    println(io, "Configuration: `n=$(n_cfg)`, vine `p=$(p_cfg)`, `repeats=$(repeats_cfg)`; each task is warmed up once and the reported time is the median.\n")
    println(io, "| Task | Dataset | Julia | `rvinecopulib` | Interpretation |")
    println(io, "|---|---|---:|---:|---|")
    for j in julia_rows
        r = rmap[key(j)]
        task = get(labels, j["scope"], j["scope"])
        if j["status"] == "ok" && r["status"] == "ok"
            tj = parse(Float64, j["median_sec"])
            tr = parse(Float64, r["median_sec"])
            ratio = tr / tj
            label = 0.95 <= ratio <= 1.05 ? "near parity" : ratio > 1 ? "Julia $(round(ratio, digits=2))× faster" : "R $(round(inv(ratio), digits=2))× faster"
            println(io, "| $task | $(j["dataset"]) | $(round(tj, sigdigits=4)) s | $(round(tr, sigdigits=4)) s | $label |")
        else
            println(io, "| $task | $(j["dataset"]) | $(j["status"]) | $(r["status"]) | inspect CSV errors |")
        end
    end
    println(io, "\nThe fixed-structure row removes structure selection from the end-to-end workflow; the automatic row also includes tree selection. The rows should not be subtracted to estimate a standalone structure-selection cost. Correctness is checked by the separate correctness gate before these timings are promoted to the documentation.")
end
println("Wrote $out")
