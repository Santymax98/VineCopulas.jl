# Conventions

## Matrix orientation

Data matrices use `p × n` layout: one variable per row and one observation per column.

## Conditional functions

For a bivariate copula ``C``,

$$h_1(u,v) = F_{1\mid 2}(u\mid v) = \frac{\partial C(u,v)}{\partial v}.$$

and

$$h_2(u,v) = F_{2\mid 1}(v\mid u) = \frac{\partial C(u,v)}{\partial u}.$$

The ASCII API is `hfunc1`, `hfunc2`, `hinv1`, and `hinv2`. Unicode aliases are also exported.

## Rotations

Rotations follow the standard 0, 90, 180, and 270 degree convention. Internally they are represented through `SurvivalCopula` flips.

## R-vine matrices

`rvine_matrix` provides matrix exchange for standard R-vine structures. Equivalent models may admit different valid matrix encodings, so structural equality should be checked through represented edges rather than raw matrix text.
