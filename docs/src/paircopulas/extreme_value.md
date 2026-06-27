# Extreme-value pair-copulas

Bivariate extreme-value copulas are supported through the Pickands dependence function representation supplied by `Copulas.jl`.

Smooth tails use generic analytic h-functions and a safeguarded inverse in the unconstrained logit coordinate of the Pickands argument. Singular tails use generalized conditional quantiles.

Tested tails include logistic, Galambos, Hüsler–Reiss, Mixed, asymmetric logistic, asymmetric Galambos, asymmetric Mixed, Cuadras–Augé, Marshall–Olkin, BC2, and extreme-t tails.

This is one of the distinctive parts of `VineCopulas.jl`: the package treats smooth and singular extreme-value pair-copulas separately instead of pretending that all conditional inverses are ordinary smooth inverses.
