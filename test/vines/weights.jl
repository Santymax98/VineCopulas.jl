# `weights =` on the pair and vine fits: a weighted tree criterion, a weighted
# pseudo-likelihood in every pair fit, a weighted selection sample size, and a
# `VineModel` whose log-likelihood and bootstrap carry the weights.

@testitem "Fit internals – weighted Kendall tau, Spearman rho and Gaussian MI" tags=[:Fit, :Numerical, :Weights] setup=[M] begin
    using Test
    using Copulas
    using VineCopulas
    using StableRNGs

    # Tied fixture: uniform weights reproduce the unweighted statistics exactly.
    x = [0.1, 0.1, 0.4, 0.6, 0.6, 0.9, 0.95]
    y = [0.2, 0.3, 0.3, 0.7, 0.65, 0.8, 0.99]
    @test VineCopulas._kendall_tau_w(x, y, ones(7)) == VineCopulas._kendall_tau_b(x, y)
    @test VineCopulas._spearman_rho_w(x, y, ones(7)) == VineCopulas._spearman_rho(x, y)
    @test VineCopulas._tie_pairs_w(x, ones(7)) == VineCopulas._tie_pairs(x)

    # Untied fixture.
    rng = StableRNG(4101)
    xr = rand(rng, 60)
    yr = 0.6 .* xr .+ 0.4 .* rand(rng, 60)
    @test VineCopulas._kendall_tau_w(xr, yr, ones(60)) == VineCopulas._kendall_tau_b(xr, yr)
    @test VineCopulas._spearman_rho_w(xr, yr, ones(60)) == VineCopulas._spearman_rho(xr, yr)
    @test VineCopulas._gaussian_mutual_information_w(xr, yr, ones(60)) == VineCopulas._gaussian_mutual_information(xr, yr)

    # Replication identity: integer weights equal the statistic of the sample
    # in which observation i is repeated m[i] times.
    m = rand(rng, 1:4, 60)
    xe = vcat((fill(xr[i], m[i]) for i in 1:60)...)
    ye = vcat((fill(yr[i], m[i]) for i in 1:60)...)
    @test VineCopulas._kendall_tau_w(xr, yr, Float64.(m)) ≈ VineCopulas._kendall_tau_b(xe, ye) atol=1e-12
    @test VineCopulas._spearman_rho_w(xr, yr, Float64.(m)) ≈ VineCopulas._spearman_rho(xe, ye) atol=1e-12
    @test VineCopulas._gaussian_mutual_information_w(xr, yr, Float64.(m)) ≈ VineCopulas._gaussian_mutual_information(xe, ye) atol=1e-12

    # Integer weights run on an exact integer Fenwick tree and agree with the
    # same weights as floats bit for bit.
    @test VineCopulas._kendall_tau_w(xr, yr, m) == VineCopulas._kendall_tau_w(xr, yr, Float64.(m))
    @test VineCopulas._spearman_rho_w(xr, yr, m) == VineCopulas._spearman_rho_w(xr, yr, Float64.(m))
    @test VineCopulas._Fenwick(zeros(Int, 3)) isa VineCopulas._Fenwick{Int}

    # The criteria are invariant to the scale of the weights.
    @test VineCopulas._kendall_tau_w(xr, yr, 3.7 .* m) ≈ VineCopulas._kendall_tau_w(xr, yr, Float64.(m)) atol=1e-12
    @test VineCopulas._spearman_rho_w(xr, yr, 3.7 .* m) ≈ VineCopulas._spearman_rho_w(xr, yr, Float64.(m)) atol=1e-12
    @test VineCopulas._gaussian_mutual_information_w(xr, yr, 3.7 .* m) ≈ VineCopulas._gaussian_mutual_information_w(xr, yr, Float64.(m)) atol=1e-12

    # A zero weight removes the observation.
    w0 = ones(60)
    w0[7] = 0.0
    keep = [1:6; 8:60]
    @test VineCopulas._kendall_tau_w(xr, yr, w0) ≈ VineCopulas._kendall_tau_b(xr[keep], yr[keep]) atol=1e-12
    @test VineCopulas._spearman_rho_w(xr, yr, w0) ≈ VineCopulas._spearman_rho(xr[keep], yr[keep]) atol=1e-12

    @test_throws DimensionMismatch VineCopulas._kendall_tau_w(xr, yr, ones(59))

    # The tree criterion dispatches on the weights: the three weighted forms,
    # and a refusal for the criteria that have none.
    w = Float64.(m)
    @test VineCopulas._tree_dependence(xr, yr, 1, 2, Int[], :tau, w) == abs(VineCopulas._kendall_tau_w(xr, yr, w))
    @test VineCopulas._tree_dependence(xr, yr, 1, 2, Int[], :rho, w) == abs(VineCopulas._spearman_rho_w(xr, yr, w))
    @test VineCopulas._tree_dependence(xr, yr, 1, 2, Int[], :joe, w) == VineCopulas._gaussian_mutual_information_w(xr, yr, w)
    @test VineCopulas._tree_dependence(xr, yr, 1, 2, Int[], :tau, nothing) == VineCopulas._tree_dependence(xr, yr, 1, 2, Int[], :tau)
    for crit in (:hoeffd, :mcor, :cxi)
        @test_throws ArgumentError VineCopulas._check_weighted_tree_criterion(crit, w)
        @test VineCopulas._check_weighted_tree_criterion(crit, nothing) === nothing
    end
    # A function criterion sees the full aligned columns and closes over the weights.
    f = (x, y, a, b, D) -> abs(VineCopulas._kendall_tau_w(x, y, w))
    @test VineCopulas._check_weighted_tree_criterion(f, w) === nothing
    @test VineCopulas._tree_dependence(xr, yr, 1, 2, Int[], f, w) == abs(VineCopulas._kendall_tau_w(xr, yr, w))
end

@testitem "Pair selection – weighted Kendall independence policy" tags=[:Fit, :PairCopula, :Weights] setup=[M] begin
    using Test
    using VineCopulas
    using Copulas
    using StableRNGs

    U = rand(StableRNG(4106), 2, 80)
    kw = (; family_set=(GaussianCopula,), independence_test=:kendall, independence_level=0.05,
          allow_rotations=false, include_independence=false, strict=true)

    # Uniform weights reduce exactly to the unweighted independence test.
    S0 = VineCopulas._select_pair(U; kw...)
    S1 = VineCopulas._select_pair(U; weights=ones(size(U, 2)), kw...)
    @test S1.copula isa typeof(S0.copula)
    @test S1.copula isa IndependentCopula

    # Zero-weight observations are removed before applying the ordinary test.
    w0 = ones(size(U, 2))
    w0[1:7] .= 0
    keep = 8:size(U, 2)
    Sz = VineCopulas._select_pair(U; weights=w0, kw...)
    Sk = VineCopulas._select_pair(U[:, keep]; kw...)
    @test Sz.copula isa typeof(Sk.copula)

    # A positive non-uniform weighted Kendall p-value is not silently treated
    # as the unweighted asymptotic test.
    wn = collect(1.0:size(U, 2))
    @test_throws ArgumentError VineCopulas._select_pair(U; weights=wn, kw...)
    kw_none = (; kw..., independence_test=:none)
    @test VineCopulas._select_pair(U; weights=wn, kw_none...).copula isa PairCopula
end

@testitem "Fit API – weights on pair selection" tags=[:Fit, :PairCopula, :Weights] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    rng = StableRNG(4102)
    U = rand(rng, TCopula(4.0, [1.0 0.5; 0.5 1.0]), 400)
    n = size(U, 2)

    # Every default family: uniform weights reproduce the unweighted fit bit
    # for bit, before and after the internal scaling to `sum(w) == n`.
    for FT in (GaussianCopula, TCopula, ClaytonCopula, GumbelCopula, FrankCopula, JoeCopula, BB1Copula, BB7Copula)
        kw = (; family_set=(FT,), pair_method=:mle, allow_rotations=false, include_independence=false, strict=true)
        F0 = select_paircopula(U; kw...)
        F1 = select_paircopula(U; weights=ones(n), kw...)
        F2 = select_paircopula(U; weights=2 .* ones(n), kw...)
        @test Distributions.params(F1) == Distributions.params(F0)
        @test Distributions.params(F2) == Distributions.params(F0)
    end

    # A family outside the local fitters, and a rank inversion, are fitted by
    # Copulas.jl, which takes the same weights and the same scaling.
    for kw in ((; family_set=(AMHCopula,), pair_method=:mle), (; family_set=(ClaytonCopula,), pair_method=:itau))
        kw = (; kw..., allow_rotations=false, include_independence=false, strict=true)
        F0 = select_paircopula(U; kw...)
        F1 = select_paircopula(U; weights=ones(n), kw...)
        @test Distributions.params(F1) == Distributions.params(F0)
    end

    # The selected family and the score are unchanged under uniform weights,
    # and the log-likelihood is the plain one (the weights sum to n).
    S0 = VineCopulas._select_pair(U; family_set=:default)
    S1 = VineCopulas._select_pair(U; weights=fill(0.5, n), family_set=:default)
    @test S1.family == S0.family
    @test S1.rotation == S0.rotation
    @test S1.loglik ≈ S0.loglik atol=1e-8
    @test S1.score ≈ S0.score atol=1e-8

    # Replication identity for the bounded MLEs and for the rank inversion: an
    # observation repeated m[i] times equals the deduplicated observation with
    # weight m[i]. The residual is the Brent tolerance of the scalar fitters
    # (`rel_tol = sqrt(eps)` on theta).
    rng = StableRNG(4103)
    U2 = rand(rng, ClaytonCopula(2, 1.8), 200)
    m = rand(rng, 1:4, 200)
    U2e = hcat((repeat(U2[:, i], 1, m[i]) for i in 1:200)...)
    for (FT, method) in ((GaussianCopula, :mle), (ClaytonCopula, :mle), (GumbelCopula, :mle), (ClaytonCopula, :itau))
        kw = (; family_set=(FT,), pair_method=method, allow_rotations=false, include_independence=false, strict=true)
        Fe = select_paircopula(U2e; kw...)
        Fw = select_paircopula(U2; weights=m, kw...)
        pe = VineCopulas._flatten_fit_params(Distributions.params(Fe))[2]
        pw = VineCopulas._flatten_fit_params(Distributions.params(Fw))[2]
        @test pe ≈ pw atol=1e-6
    end

    # A zero weight removes the observation: the fit equals the fit without
    # it, even when that observation sits on the boundary of the unit square.
    U3 = copy(U2)
    U3[:, 17] .= (1.0, 0.0)
    w0 = ones(200)
    w0[17] = 0.0
    kw = (; family_set=(ClaytonCopula,), allow_rotations=false, include_independence=false, strict=true)
    Fdrop = select_paircopula(U3[:, [1:16; 18:200]]; kw...)
    Fzero = select_paircopula(U3; weights=w0, kw...)
    @test Distributions.params(Fzero).θ ≈ Distributions.params(Fdrop).θ atol=1e-6

    # The weighted pseudo-likelihood is the weighted sum of the column logpdfs.
    C = ClaytonCopula(2, 1.8)
    w = rand(rng, 200)
    @test VineCopulas._weighted_loglikelihood(C, U2, w) ≈ sum(w .* Distributions.logpdf(C, U2))
    @test VineCopulas._weighted_loglikelihood(C, U2, nothing) == Distributions.loglikelihood(C, U2)
    @test VineCopulas._weighted_loglikelihood(C, U2, ones(200)) == Distributions.loglikelihood(C, U2)

    # The validation scales to `sum(w) == n` and leaves `ones(n)` untouched.
    @test VineCopulas._fit_weights(ones(5), 5) == ones(5)
    @test VineCopulas._fit_weights([1, 2, 3, 4], 4) ≈ [0.4, 0.8, 1.2, 1.6]
    @test VineCopulas._fit_weights(nothing, 5) === nothing

    # Refusals.
    @test_throws ArgumentError select_paircopula(U2; weights=fill(-1.0, 200), family_set=(ClaytonCopula,))
    @test_throws ArgumentError select_paircopula(U2; weights=zeros(200), family_set=(ClaytonCopula,))
    @test_throws ArgumentError select_paircopula(U2; weights=fill(NaN, 200), family_set=(ClaytonCopula,))
    @test_throws ArgumentError select_paircopula(U2; weights=fill(Inf, 200), family_set=(ClaytonCopula,))
    @test_throws ArgumentError select_paircopula(U2; weights=:uniform, family_set=(ClaytonCopula,))
    @test_throws DimensionMismatch select_paircopula(U2; weights=ones(199), family_set=(ClaytonCopula,))
end

@testitem "Fit API – weights on vine fitting" tags=[:Fit, :Vine, :RVine, :CVine, :DVine, :Weights] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    rng = StableRNG(4104)
    truth = DVineCopula(
        [1, 2, 3, 4],
        [[GaussianCopula(2, 0.6), ClaytonCopula(2, 1.5), GumbelCopula(2, 1.4)],
         [FrankCopula(2, 1.5), GaussianCopula(2, 0.3)],
         [GaussianCopula(2, 0.2)]],
    )
    U = rand(rng, truth, 220)
    n = size(U, 2)
    fams = (GaussianCopula, ClaytonCopula, GumbelCopula, FrankCopula)

    # Uniform weights reproduce the unweighted fit bit for bit: structure,
    # families and parameters, under every tree criterion that takes weights.
    for T in (RVineCopula, CVineCopula, DVineCopula), crit in (:tau, :rho, :joe)
        V0 = fit(T, U; family_set=fams, tree_criterion=crit)
        V1 = fit(T, U; weights=ones(n), family_set=fams, tree_criterion=crit)
        V2 = fit(T, U; weights=4 .* ones(n), family_set=fams, tree_criterion=crit)
        @test order(V1) == order(V0)
        @test order(V2) == order(V0)
        @test VineCopulas._vine_parameter_metadata(V1) == VineCopulas._vine_parameter_metadata(V0)
        @test VineCopulas._vine_parameter_metadata(V2) == VineCopulas._vine_parameter_metadata(V0)
    end

    # Replication identity through the sequential fit: the weights ride with
    # the observations into every tree.
    m = rand(rng, 1:4, n)
    Ue = hcat((repeat(U[:, i], 1, m[i]) for i in 1:n)...)
    for T in (RVineCopula, CVineCopula, DVineCopula)
        Ve = fit(T, Ue; family_set=fams)
        Vw = fit(T, U; weights=m, family_set=fams)
        @test order(Vw) == order(Ve)
        ne, pe = VineCopulas._vine_parameter_metadata(Ve)
        nw, pw = VineCopulas._vine_parameter_metadata(Vw)
        @test nw == ne
        @test pw ≈ pe atol=1e-6
    end

    # Weights change the fit when they are not uniform, and they reach the
    # fixed-structure, explicit-order, grouped and custom-criterion paths.
    w = rand(rng, n) .+ 0.1
    Vw = fit(RVineCopula, U; weights=w, family_set=fams)
    V0 = fit(RVineCopula, U; family_set=fams)
    @test VineCopulas._vine_parameter_metadata(Vw)[2] != VineCopulas._vine_parameter_metadata(V0)[2]
    Vs = fit(RVineCopula, U; weights=w, structure=structure(Vw), family_set=fams)
    @test order(Vs) == order(Vw)
    @test VineCopulas._vine_parameter_metadata(Vs)[2] ≈ VineCopulas._vine_parameter_metadata(Vw)[2] atol=1e-6
    Vc = fit(CVineCopula, U; weights=w, order=[2, 1, 3, 4], family_set=fams)
    @test order(Vc) == (2, 1, 3, 4)
    Vd = fit(DVineCopula, U; weights=w, order_method=:greedy, threshold=0.05, family_set=fams)
    @test Vd isa DVineCopula
    Vg = fit(RVineCopula, U; weights=w, groups=[1, 1, 2, 2], family_set=fams)
    @test Vg isa RVineCopula
    # A custom criterion closes over the weights: this one is `:tau` weighted,
    # so it selects the same vine.
    tauw = (x, y, a, b, D) -> abs(VineCopulas._kendall_tau_w(x, y, w))
    Vf = fit(RVineCopula, U; weights=w, tree_criterion=tauw, family_set=fams)
    @test VineCopulas._vine_parameter_metadata(Vf) == VineCopulas._vine_parameter_metadata(Vw)

    # Refusals at the vine entry point.
    @test_throws DimensionMismatch fit(RVineCopula, U; weights=ones(n - 1), family_set=fams)
    @test_throws ArgumentError fit(CVineCopula, U; weights=zeros(n), family_set=fams)
    @test_throws ArgumentError fit(DVineCopula, U; weights=-ones(n), family_set=fams)
    for crit in (:hoeffd, :mcor, :cxi)
        @test_throws ArgumentError fit(RVineCopula, U; weights=w, tree_criterion=crit, family_set=fams)
        @test_throws ArgumentError fit(CVineCopula, U; weights=w, tree_criterion=crit, family_set=fams)
        @test_throws ArgumentError fit(DVineCopula, U; weights=w, tree_criterion=crit, family_set=fams)
    end
end

@testitem "VineModel – weighted fit, log-likelihood and bootstrap" tags=[:Fit, :Vine, :VineModel, :Weights] setup=[M] begin
    using Test
    using Random
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs
    using StatsBase

    rng = StableRNG(4105)
    truth = DVineCopula(
        [1, 2, 3],
        [[GaussianCopula(2, 0.6), ClaytonCopula(2, 1.5)], [FrankCopula(2, 1.5)]],
    )
    U = rand(rng, truth, 200)
    n = size(U, 2)
    fams = (GaussianCopula, ClaytonCopula, FrankCopula)
    w = rand(rng, n) .+ 0.1

    M0 = fit(VineModel, RVineCopula, U; family_set=fams)
    M1 = fit(VineModel, RVineCopula, U; weights=ones(n), family_set=fams)
    Mw = fit(VineModel, RVineCopula, U; weights=w, family_set=fams)

    # Uniform weights: the same model, the same log-likelihood, and no weights
    # stored. The unweighted recipe carries no `weights` key.
    @test StatsBase.coef(M1) == StatsBase.coef(M0)
    @test Distributions.loglikelihood(M1) == Distributions.loglikelihood(M0)
    @test !haskey(M0.recipe.kwargs, :weights)
    @test VineCopulas._model_weights(M0) === nothing

    # A weighted model stores the scaled weights and the weighted
    # pseudo-likelihood; `nobs` stays n, and the criteria follow.
    ws = VineCopulas._model_weights(Mw)
    @test ws ≈ w .* (n / sum(w))
    @test sum(ws) ≈ n
    @test StatsBase.nobs(Mw) == n
    C = Copulas.fitted_distribution(Mw)
    @test Distributions.loglikelihood(Mw) ≈ sum(ws .* Distributions.logpdf(C, Mw.data))
    @test Distributions.loglikelihood(Mw) != Distributions.loglikelihood(C, Mw.data)
    @test StatsBase.aic(Mw) == 2 * StatsBase.dof(Mw) - 2 * Distributions.loglikelihood(Mw)
    @test StatsBase.bic(Mw) == StatsBase.dof(Mw) * log(n) - 2 * Distributions.loglikelihood(Mw)
    @test occursin("weights:", sprint(show, Mw))
    @test !occursin("weights:", sprint(show, M0))

    # The stored weights are a copy: the caller's vector cannot change the model.
    w2 = copy(w)
    Mc = fit(VineModel, RVineCopula, U; weights=w2, family_set=fams)
    w2 .= 1.0
    @test VineCopulas._model_weights(Mc) ≈ ws

    # The bootstrap resamples (observation, weight) pairs: it runs, it is
    # reproducible under the same rng, and the refit of the full weighted
    # sample reproduces the weighted estimate.
    I1 = infer(Mw; method=:bootstrap, nresamples=4, rng=MersenneTwister(11))
    I2 = infer(Mw; method=:bootstrap, nresamples=4, rng=MersenneTwister(11))
    @test StatsBase.vcov(I1) == StatsBase.vcov(I2)
    @test all(isfinite, StatsBase.stderror(I1))
    R = VineCopulas._refit(Mw, Mw.data, ws)
    @test StatsBase.coef(R) ≈ StatsBase.coef(Mw) atol=1e-6
    @test Distributions.loglikelihood(R) ≈ Distributions.loglikelihood(Mw) atol=1e-6
    @test VineCopulas._model_weights(R) ≈ ws

    # The C- and D-vine model paths and the positional-method form take the weights.
    for VT in (CVineCopula, DVineCopula)
        Mv = fit(VineModel, VT, U, :sequential; weights=w, family_set=fams)
        @test VineCopulas._model_weights(Mv) ≈ ws
        @test Distributions.loglikelihood(Mv) ≈ sum(ws .* Distributions.logpdf(Copulas.fitted_distribution(Mv), Mv.data))
    end

    # Refusals reach the model entry point.
    @test_throws DimensionMismatch fit(VineModel, RVineCopula, U; weights=ones(n - 1), family_set=fams)
    @test_throws ArgumentError fit(VineModel, RVineCopula, U; weights=zeros(n), family_set=fams)
end
