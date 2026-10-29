include(joinpath(@__DIR__, "common.jl"))

const FIXTURE_DIR = joinpath(@__DIR__, "fixtures")

params12(params) = (
    length(params) >= 1 ? Float64(params[1]) : "",
    length(params) >= 2 ? Float64(params[2]) : "",
)
encode_ints(xs) = join(Int.(xs), ':')

function write_spec_bridge(specs)
    pair_rows = Any[]
    for case in specs["pair_cases"]
        p1, p2 = params12(case["params"])
        push!(pair_rows, (
            case["name"], case["family"], Int(case["rotation"]), p1, p2,
        ))
    end
    write_csv(
        joinpath(DATA_DIR, "pair_specs.csv"),
        ("case", "family", "rotation", "p1", "p2"),
        pair_rows,
    )

    model_rows = Any[]
    edge_rows = Any[]
    for model in specs["vine_models"]
        push!(model_rows, (
            model["name"],
            get(model, "fit_source", false) ? 1 : 0,
            encode_ints(model["order"]),
            join((encode_ints(row) for row in model["struct_array"]), '|'),
        ))
        for edge in model["edges"]
            p1, p2 = params12(edge["params"])
            push!(edge_rows, (
                model["name"], Int(edge["tree"]), Int(edge["edge"]),
                edge["family"], Int(edge["rotation"]), p1, p2,
            ))
        end
    end
    write_csv(
        joinpath(DATA_DIR, "vine_specs.csv"),
        ("model", "fit_source", "order", "struct_array"),
        model_rows,
    )
    write_csv(
        joinpath(DATA_DIR, "vine_edge_specs.csv"),
        ("model", "tree", "edge", "family", "rotation", "p1", "p2"),
        edge_rows,
    )
end

function main()
    rm(DATA_DIR; recursive=true, force=true)
    rm(RESULTS_DIR; recursive=true, force=true)
    ensure_dirs()

    # Keep the numerical campaign unchanged when the harness implementation
    # changes. These fixtures are the exact deterministic inputs used by the
    # earlier gate; only derived bridge/result files are regenerated.
    for name in readdir(FIXTURE_DIR)
        endswith(name, ".csv") || continue
        cp(joinpath(FIXTURE_DIR, name), joinpath(DATA_DIR, name); force=true)
    end

    write_spec_bridge(load_specs())
    println("Prepared shared correctness inputs under $DATA_DIR")
end

main()
