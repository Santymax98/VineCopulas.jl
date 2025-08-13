using VineCopulas
using Documenter

DocMeta.setdocmeta!(VineCopulas, :DocTestSetup, :(using VineCopulas); recursive=true)

makedocs(;
    modules=[VineCopulas],
    authors="santymax98 <santymax9807@gmail.com> and contributors",
    sitename="VineCopulas.jl",
    format=Documenter.HTML(;
        canonical="https://santymax98.github.io/VineCopulas.jl",
        edit_link="main",
        assets=String[],
    ),
    pages=[
        "Home" => "index.md",
    ],
)

deploydocs(;
    repo="github.com/santymax98/VineCopulas.jl",
    devbranch="main",
)
