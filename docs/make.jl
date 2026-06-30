using VineCopulas
using Documenter
using DocumenterVitepress

DocMeta.setdocmeta!(VineCopulas, :DocTestSetup, :(using VineCopulas); recursive=true)

makedocs(;
    modules=[VineCopulas],
    repo=Remotes.GitHub("Santymax98", "VineCopulas.jl"),
    authors="Santiago Jimenez and contributors",
    sitename="VineCopulas.jl",
    format = DocumenterVitepress.MarkdownVitepress(
        repo = "https://github.com/Santymax98/VineCopulas.jl",
        devbranch = "main",
    ),
    pages=[
        "Home" => "index.md",
        "Getting started" => "getting_started.md",
        "Manual" => [
            "Mathematical background" => "manual/mathematical_background.md",
            "Pair-copula decomposition" => "manual/pair_copula_decomposition.md",
            "h-functions and inverses" => "manual/h_functions.md",
            "Rosenblatt transforms" => "manual/rosenblatt.md",
            "Simulation vs fitting" => "manual/simulation_vs_fitting.md",
            "Conventions" => "manual/conventions.md",
            "Testing" => "manual/testing.md",
            "Limitations" => "manual/limitations.md",
        ],
        "Vine structures" => [
            "C-vines" => "structures/cvines.md",
            "D-vines" => "structures/dvines.md",
            "R-vines" => "structures/rvines.md",
        ],
        "Pair copulas" => [
            "Supported families" => "paircopulas/supported_families.md",
            "Conditionals" => "paircopulas/conditionals.md",
            "Extreme-value pair copulas" => "paircopulas/extreme_value.md",
            "Adding a new pair-copula" => "paircopulas/adding_paircopula.md",
        ],
        "Examples" => [
            "Minimal D-vine" => "examples/minimal_dvine.md",
            "Mixed D-vine" => "examples/mixed_dvine.md",
            "Truncated C-vine" => "examples/truncated_cvine.md",
            "Extreme-value vine" => "examples/extreme_value_vine.md",
            "Large simulation" => "examples/large_simulation.md",
            "Plots" => "examples/plots.md",
        ],
        "Comparison" => [
            "rvinecopulib" => "comparison/rvinecopulib.md",
            "Benchmarks and validation" => "comparison/benchmarks.md",
        ],
        "API" => [
            "Public" => "api/public.md",
            "Internal (non-stable)" => "api/internal.md",
        ],
        "Citation" => "citation.md",
    ],
    checkdocs=:none,
)

DocumenterVitepress.deploydocs(;
    repo = "github.com/Santymax98/VineCopulas.jl",
    target = "build",
    devbranch = "main",
    branch = "gh-pages",
    push_preview = true,
)
