# Core concepts

## Copula scale

For continuous margins, Sklar's theorem writes a joint distribution as

$$F(x_1,\ldots,x_p)=C\{F_1(x_1),\ldots,F_p(x_p)\}.$$

`VineCopulas.jl` models the copula ``C``, not the marginal distributions. Fitting therefore expects observations on the copula scale, typically pseudo-observations in ``(0,1)^p``.

A common rank transformation is

$$u_{ij}=\frac{\operatorname{rank}(x_{ij})}{n+1}.$$

Marginal modeling can instead be handled with tools such as `SklarDist` in `Copulas.jl` before the vine model is fitted.

## Pair-copula decomposition

A vine decomposes a multivariate copula density into bivariate copula densities evaluated at recursively computed conditional probabilities. For a D-vine with order ``(1,\ldots,p)``,

$$c(u_1,\ldots,u_p)=\prod_{k=1}^{p-1}\prod_{i=1}^{p-k} c_{i,i+k\,;\,i+1:\,i+k-1}\left(u_{i\mid i+1:\,i+k-1},u_{i+k\mid i+1:\,i+k-1}\right).$$

The conditional arguments are propagated with pair-copula h-functions. This same recursion drives density evaluation, Rosenblatt transforms, simulation, and sequential fitting.

## Simplifying assumption

The current fitting and evaluation layer implements simplified vines: a conditional pair-copula may depend on which variables are conditioned upon, but its parameters do not vary with the realized values of those conditioning variables.

## Truncation

A vine truncated after tree ``q<p-1`` treats higher-tree conditional dependence as independence. This is different from the finite **candidate parameter domains** used by automatic family selection. Vine truncation changes the model structure; candidate bounds only limit an optimizer's search space.
