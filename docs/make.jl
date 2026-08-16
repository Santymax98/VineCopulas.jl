using VineCopulas
using Documenter
using DocumenterVitepress

DocMeta.setdocmeta!(VineCopulas, :DocTestSetup, :(using VineCopulas); recursive=true)

# Avoid deployment auto-detection during local builds while preserving the
# normal Documenter decision on CI.
deploy_decision = get(ENV, "CI", "false") == "true" ?
    nothing : Documenter.DeployDecision(all_ok=false)

makedocs(;
    modules=[VineCopulas],
    repo=Remotes.GitHub("Santymax98", "VineCopulas.jl"),
    authors="Santiago Jimenez and contributors",
    sitename="VineCopulas.jl",
    format=DocumenterVitepress.MarkdownVitepress(
        repo="https://github.com/Santymax98/VineCopulas.jl",
        devbranch="main",
        devurl="dev",
        keep=:patch,
        deploy_decision=deploy_decision,
    ),
    pages=[
        "Home" => "index.md",
        "Guide" => [
            "Getting started" => "guide/getting_started.md",
            "Core concepts" => "guide/concepts.md",
            "Simulation and transforms" => "guide/transforms.md",
            "Examples" => [
                "Minimal D-vine" => "guide/examples/minimal_dvine.md",
                "Mixed D-vine" => "guide/examples/mixed_dvine.md",
                "Truncated C-vine" => "guide/examples/truncated_cvine.md",
                "Extreme-value vine" => "guide/examples/extreme_value_vine.md",
                "Large simulation" => "guide/examples/large_simulation.md",
                "Plots" => "guide/examples/plots.md",
            ],
            "Compatibility" => "guide/compatibility.md",
            "Conventions" => "guide/conventions.md",
        ],
        "Bestiary" => [
            "Vine structures" => [
                "Overview" => "bestiary/vines/overview.md",
                "C-vines" => "bestiary/vines/cvines.md",
                "D-vines" => "bestiary/vines/dvines.md",
                "R-vines" => "bestiary/vines/rvines.md",
                "Truncation" => "bestiary/vines/truncation.md",
            ],
            "Pair copulas" => [
                "Overview" => "bestiary/pairs/overview.md",
                "Supported families" => "bestiary/pairs/supported_families.md",
                "Elliptical" => "bestiary/pairs/elliptical.md",
                "Archimedean" => "bestiary/pairs/archimedean.md",
                "BB families" => "bestiary/pairs/bb.md",
                "Rotations" => "bestiary/pairs/rotations.md",
                "Conditionals" => "bestiary/pairs/conditionals.md",
                "Extreme-value families" => "bestiary/pairs/extreme_value.md",
            ],
        ],
        "Fitting & Selection" => [
            "Overview" => "fitting/overview.md",
            "Pair-copula selection" => "fitting/pair_selection.md",
            "Vine fitting" => "fitting/vine_fitting.md",
            "Structure selection" => "fitting/structure_selection.md",
            "Controls and parameter domains" => "fitting/controls.md",
        ],
        "Benchmarks" => [
            "Overview" => "benchmarks/overview.md",
            "Correctness" => "benchmarks/correctness.md",
            "Performance" => "benchmarks/performance.md",
            "Reproducing results" => "benchmarks/reproduce.md",
        ],
        "Developer" => [
            "Architecture" => "developer/architecture.md",
            "Public API" => "developer/public_api.md",
            "Internal API" => "developer/internal_api.md",
            "Adding a pair copula" => "developer/adding_paircopula.md",
            "Testing" => "developer/testing.md",
            "Copulas.jl follow-ups" => "developer/copulas_followups.md",
            "Release checklist" => "developer/release.md",
            "Roadmap" => "developer/roadmap.md",
        ],
    ],
    checkdocs=:none,
)

if get(ENV, "CI", "false") == "true"
    DocumenterVitepress.deploydocs(;
        repo="github.com/Santymax98/VineCopulas.jl",
        target=joinpath(@__DIR__, "build"),
        branch="gh-pages",
        devbranch="main",
        push_preview=true,
    )
end
