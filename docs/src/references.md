# References

This page lists the main references behind the mathematical and computational
design of `VineCopulas.jl`. The package documentation cites concepts in prose
rather than using a bibliography engine, to keep the documentation build small
and stable.

## Copulas and Sklar composition

- Sklar, A. (1959). *Fonctions de répartition à n dimensions et leurs marges*.
  Publications de l'Institut de Statistique de l'Université de Paris.
- Nelsen, R. B. (2006). *An Introduction to Copulas*. Springer.
- Joe, H. (1997). *Multivariate Models and Dependence Concepts*. Chapman &
  Hall.
- McNeil, A. J., Frey, R., and Embrechts, P. (2015). *Quantitative Risk
  Management: Concepts, Techniques and Tools*. Princeton University Press.

## Pair-copula constructions and vines

- Bedford, T., and Cooke, R. M. (2001). Probability density decomposition for
  conditionally dependent random variables modeled by vines. *Annals of
  Mathematics and Artificial Intelligence*.
- Bedford, T., and Cooke, R. M. (2002). Vines: A new graphical model for
  dependent random variables. *The Annals of Statistics*.
- Aas, K., Czado, C., Frigessi, A., and Bakken, H. (2009). Pair-copula
  constructions of multiple dependence. *Insurance: Mathematics and Economics*.
- Joe, H. (2014). *Dependence Modeling with Copulas*. Chapman & Hall/CRC.
- Kurowicka, D., and Joe, H. (2011). *Dependence Modeling: Vine Copula
  Handbook*. World Scientific.

## Structure selection and truncation

- Dißmann, J., Brechmann, E. C., Czado, C., and Kurowicka, D. (2013). Selecting
  and estimating regular vine copulae and application to financial returns.
  *Computational Statistics & Data Analysis*.
- Brechmann, E. C., Czado, C., and Aas, K. (2012). Truncated regular vines in
  high dimensions with application to financial data. *Canadian Journal of
  Statistics*.

## Rosenblatt transforms and diagnostics

- Rosenblatt, M. (1952). Remarks on a multivariate transformation. *The Annals
  of Mathematical Statistics*.
- Genest, C., Rémillard, B., and Beaudoin, D. (2009). Goodness-of-fit tests for
  copulas: A review and a power study. *Insurance: Mathematics and Economics*.

## Software ecosystem

- Laverny, O., and Jimenez, S. (2024). Copulas.jl: A fully
  Distributions.jl-compliant copula package. *Journal of Open Source Software*.
- Nagler, T., Vatter, T., and colleagues. `vinecopulib` and `rvinecopulib`
  documentation and software releases.
- Besançon, M., Papamarkou, T., Anthoff, D., et al. (2021). Distributions.jl:
  Definition and modeling of probability distributions in the JuliaStats
  ecosystem. *Journal of Statistical Software*.

!!! tip "For contributors"
    Add references when a page introduces a mathematical definition, a selection
    algorithm, or a benchmark reference implementation. API pages usually do not
    need literature citations unless an exported function implements a named
    statistical criterion.
