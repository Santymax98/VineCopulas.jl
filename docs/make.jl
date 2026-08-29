using VineCopulas
using Documenter
using DocumenterVitepress

DocMeta.setdocmeta!(VineCopulas, :DocTestSetup, :(using VineCopulas); recursive=true)

# Keep plotting examples headless-friendly in local builds and CI.
ENV["GKSwstype"] = get(ENV, "GKSwstype", "100")

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
        "Manual" => [
            "Getting started" => "manual/getting_started.md",
            "Foundations" => "manual/foundations.md",
            "Pair copulas in vines" => "manual/pair_copulas.md",
            "Simulation and transforms" => "manual/simulation_transforms.md",
            "Fitting and selection" => "manual/fitting_selection.md",
            "Benchmarks" => "manual/benchmarks.md",
            "Compatibility" => "manual/compatibility.md",
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
        "Examples" => [
            "Minimal D-vine" => "examples/vine_workflows/minimal_dvine.md",
            "Manual C-vine" => "examples/vine_workflows/truncated_cvine.md",
            "Mixed pair families" => "examples/vine_workflows/mixed_dvine.md",
            "Fit an R-vine from data" => "examples/vine_workflows/fit_rvine.md",
            "Fixed-structure fitting" => "examples/vine_workflows/fixed_structure_fitting.md",
            "AIC/BIC comparison" => "examples/vine_workflows/model_comparison.md",
            "Extreme-value vine" => "examples/vine_workflows/extreme_value_vine.md",
            "Large simulation" => "examples/vine_workflows/large_simulation.md",
            "Plots" => "examples/vine_workflows/plots.md",
        ],
        "Developer Guide" => [
            "Architecture" => "developer/architecture.md",
            "Pair-copula contract" => "developer/pair_contract.md",
            "Structure API" => "developer/structure_api.md",
            "Fitting architecture" => "developer/fitting_architecture.md",
            "Adding a pair copula" => "developer/adding_paircopula.md",
            "Testing" => "developer/testing.md",
            "Copulas.jl follow-ups" => "developer/copulas_followups.md",
            "Release checklist" => "developer/release.md",
            "Roadmap" => "developer/roadmap.md",
        ],
        "API" => [
            "Public" => "api/public.md",
            "Internal (non-stable)" => "api/internal.md",
            "References" => "references.md",
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
