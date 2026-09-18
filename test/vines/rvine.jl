@testitem "Generic – RVineCopula" tags=[:Generic, :Vine, :RVine] setup=[M] begin
    M.check(M.rvine2())
    M.check(M.rvine3_dvine_like())
    M.check(M.rvine4_dvine_like())
    M.check(M.rvine5_general())
    M.check(M.rvine5_general(trunc=2))
end

@testitem "Sampling – RVineCopula" tags=[:Sampling, :Vine, :RVine] setup=[M] begin
    M.check_sampling(M.rvine2(); seed=501)
    M.check_sampling(M.rvine3_dvine_like(); seed=502)
    M.check_sampling(M.rvine4_dvine_like(); seed=503)
    M.check_sampling(M.rvine5_general(); seed=504)
    M.check_sampling(M.rvine5_general(trunc=2); seed=505)
end

@testitem "Rosenblatt – RVineCopula" tags=[:Rosenblatt, :Vine, :RVine] setup=[M] begin
    M.check_rosenblatt(M.rvine2(); seed=601)
    M.check_rosenblatt(M.rvine3_dvine_like(); seed=602)
    M.check_rosenblatt(M.rvine4_dvine_like(); seed=603)
    M.check_rosenblatt(M.rvine5_general(); seed=604, atol=3e-7, rtol=3e-7)
    M.check_rosenblatt(M.rvine5_general(trunc=2); seed=605, atol=3e-7, rtol=3e-7)
end

@testitem "Matrix exchange – RVineCopula" tags=[:Structure, :Matrix, :Vine, :RVine] setup=[M] begin
    rv = M.rvine4_truncated()
    A = rvine_matrix(rv)
    rv2 = RVineCopula(A, collect(edges(rv)))
    @test order(rv2) == order(rv)
    @test struct_array(rv2) == struct_array(rv)
    @test truncation(rv2) == truncation(rv)
    @test rvine_matrix(rv2) == A
end

@testitem "General R-vine – branching structure stability" tags=[:Structure, :Vine, :RVine, :Rosenblatt, :Regression] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    function reference_forward(R, U)
        p, n = size(U)
        states = Dict{Any,Vector{Float64}}()
        for v in 1:p
            states[(v, ())] = collect(Float64.(view(U, v, :)))
        end
        ll = zeros(Float64, n)

        for t in 1:truncation(R)
            for e in 1:(p - t)
                a = order(R)[e]
                b = struct_array(R)[t][e]
                D = sort(Int[struct_array(R)[r][e] for r in 1:(t - 1)])
                ka = (a, Tuple(D))
                kb = (b, Tuple(D))
                ua = states[ka]
                ub = states[kb]
                C = edges(R)[t][e]

                for j in 1:n
                    ll[j] += logpdf(C, [ua[j], ub[j]])
                end

                Da = Tuple(sort(vcat(D, b)))
                Db = Tuple(sort(vcat(D, a)))
                states[(a, Da)] = [hfunc1(C, ua[j], ub[j]) for j in 1:n]
                states[(b, Db)] = [hfunc2(C, ua[j], ub[j]) for j in 1:n]
            end
        end

        Z = copy(U)
        for e in 1:(p - 1)
            tmax = min(truncation(R), p - e)
            a = order(R)[e]
            D = sort(Int[struct_array(R)[r][e] for r in 1:tmax])
            @views Z[a, :] .= states[(a, Tuple(D))]
        end
        return ll, Z
    end

    R = M.rvine5_general()
    @test !VineCopulas._looks_like_dvine(R)
    @test VineCopulas._validate_rvine_structure(order(R), struct_array(R), 5, 4) == :standard

    # The first tree is genuinely branching: degrees are 1,3,1,2,1.
    first_tree = VineCopulas.vine_edges(R)[1:4]
    degree = zeros(Int, 5)
    for ed in first_tree
        a, b = ed.conditioned
        degree[a] += 1
        degree[b] += 1
    end
    @test sort(degree) == [1, 1, 1, 2, 3]

    rng = StableRNG(1601)
    Q = 0.01 .+ 0.98 .* rand(rng, 5, 96)
    llref, Zref = reference_forward(R, Q)
    @test logpdf(R, Q) ≈ llref atol=5e-11 rtol=5e-11
    @test rosenblatt(R, Q) ≈ Zref atol=5e-11 rtol=5e-11

    Z = 0.01 .+ 0.98 .* rand(rng, 5, 128)
    U = inverse_rosenblatt(R, Z)
    @test all(x -> 0 < x < 1, U)
    @test all(isfinite, logpdf(R, U))
    @test rosenblatt(R, U) ≈ Z atol=3e-7 rtol=3e-7

    # Lossless matrix exchange for a truly general, non-identity R-vine.
    A = rvine_matrix(R)
    R2 = RVineCopula(A, collect(edges(R)))
    @test order(R2) == order(R)
    @test struct_array(R2) == struct_array(R)
    @test rvine_matrix(R2) == A
    @test logpdf(R2, Q) ≈ logpdf(R, Q) atol=1e-12 rtol=1e-12

    # General truncated R-vines use the same conditional-state DAG and must
    # still have an invertible triangular transport.
    Rt = M.rvine5_general(trunc=2)
    lltref, Ztref = reference_forward(Rt, Q)
    @test logpdf(Rt, Q) ≈ lltref atol=5e-11 rtol=5e-11
    @test rosenblatt(Rt, Q) ≈ Ztref atol=5e-11 rtol=5e-11

    Zt = 0.01 .+ 0.98 .* rand(rng, 5, 96)
    Ut = inverse_rosenblatt(Rt, Zt)
    @test rosenblatt(Rt, Ut) ≈ Zt atol=3e-7 rtol=3e-7
    @test all(isfinite, logpdf(Rt, Ut))

    At = rvine_matrix(Rt)
    Rt2 = RVineCopula(At, collect(edges(Rt)))
    @test logpdf(Rt2, Q) ≈ logpdf(Rt, Q) atol=1e-12 rtol=1e-12
end

@testitem "General R-vine – label permutation invariance" tags=[:Structure, :Vine, :RVine, :Permutation, :Regression] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs
    using Random

    R = M.rvine5_general()
    rng = StableRNG(1602)
    Q = 0.02 .+ 0.96 .* rand(rng, 5, 40)
    Z = 0.02 .+ 0.96 .* rand(rng, 5, 24)
    base_ll = logpdf(R, Q)
    base_U = inverse_rosenblatt(R, Z)

    # A collection of deterministic random relabelings exercises arbitrary
    # non-identity orders without changing the underlying probabilistic model.
    for rep in 1:20
        π = randperm(rng, 5)  # old label -> new label
        ordp = Int[π[v] for v in order(R)]
        Sp = [Int[π[v] for v in level] for level in struct_array(R)]
        Rp = RVineCopula(ordp, Sp, edges(R))

        Qp = similar(Q)
        Zp = similar(Z)
        expected_Up = similar(base_U)
        for old in 1:5
            @views Qp[π[old], :] .= Q[old, :]
            @views Zp[π[old], :] .= Z[old, :]
            @views expected_Up[π[old], :] .= base_U[old, :]
        end

        @test logpdf(Rp, Qp) ≈ base_ll atol=2e-11 rtol=2e-11
        Up = inverse_rosenblatt(Rp, Zp)
        @test Up ≈ expected_Up atol=3e-7 rtol=3e-7
        @test rosenblatt(Rp, Up) ≈ Zp atol=3e-7 rtol=3e-7
    end
end

@testitem "R-vine structure validation rejects invalid proximity" tags=[:Structure, :Vine, :RVine, :Invalid] setup=[M] begin
    using Test
    using VineCopulas

    E = edges(M.rvine4_dvine_like())

    # Correct lengths and labels, but tree 2 edge 1 asks for (4 | 2), a
    # conditional state that tree 1 never generated.  This must fail at
    # construction time rather than silently falling back to a legacy traversal.
    bad_proximity = (
        [2, 3, 4],
        [4, 4],
        [4],
    )
    @test_throws ArgumentError RVineCopula([1, 2, 3, 4], bad_proximity, E)
    @test_throws ArgumentError RVineStructure([1, 2, 3, 4], bad_proximity)

    # A conditioned variable cannot appear in its own conditioning set.
    bad_duplicate = (
        [2, 3, 4],
        [2, 4],
        [4],
    )
    @test_throws ArgumentError RVineCopula([1, 2, 3, 4], bad_duplicate, E)

    # Historical D-vine-like structures remain an explicit compatibility case.
    legacy = M.rvine3_dvine_like()
    @test VineCopulas._looks_like_dvine(legacy)
    info = VineCopulas.vine_edges(legacy)
    @test info[3].conditioned == (1, 3)
    @test info[3].conditioning == (2,)
end

@testitem "General R-vine – vinecopulib 7D structure fixture" tags=[:Structure, :Vine, :RVine, :Compatibility, :Regression] setup=[M] begin
    using Test
    using Distributions
    using VineCopulas
    using StableRNGs

    # Structure used by vinecopulib's RVineStructure/RVineTrees tests.  Keeping
    # this fixture here guards that our standard (order, struct_array)
    # convention agrees on a nontrivial six-tree example.
    ord = [4, 3, 7, 1, 2, 5, 6]
    S = [
        [5, 2, 6, 6, 6, 6],
        [6, 6, 1, 2, 5],
        [2, 5, 2, 5],
        [1, 1, 5],
        [3, 7],
        [7],
    ]
    R = RVineCopula(ord, S, M.vine_edges(7))

    @test VineCopulas._validate_rvine_structure(order(R), struct_array(R), 7, 6) == :standard
    @test VineCopulas._compile_standard_rvine(R).nslots > 7

    rng = StableRNG(1603)
    Q = 0.02 .+ 0.96 .* rand(rng, 7, 36)
    @test all(isfinite, logpdf(R, Q))

    Z = 0.02 .+ 0.96 .* rand(rng, 7, 28)
    U = inverse_rosenblatt(R, Z)
    @test rosenblatt(R, U) ≈ Z atol=2e-6 rtol=2e-6

    A = rvine_matrix(R)
    R2 = RVineCopula(A, collect(edges(R)))
    @test order(R2) == order(R)
    @test struct_array(R2) == struct_array(R)
    @test logpdf(R2, Q) ≈ logpdf(R, Q) atol=1e-12 rtol=1e-12
end

@testitem "General R-vine – truncated transforms and simulation" tags=[:Vine, :RVine, :Truncation, :Rosenblatt, :Sampling, :Regression] setup=[M] begin
    # Issue #37. A standard general R-vine truncated below full depth has the
    # same Rosenblatt transport as the same edges padded to full depth with
    # independence pair-copulas, because an independence h-function is the
    # identity. So the transforms, `rand`, `simulate_qmc` and the numerical
    # `cdf` are all defined for it and must agree with the padded vine.
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    I2 = IndependentCopula(2)

    # Pad a truncated vine to full depth. The full structure array is the
    # truncated one plus the higher trees supplied by the caller.
    function padded(vc, higher_trees)
        p = length(vc)
        S = [collect(struct_array(vc))..., higher_trees...]
        E = [collect(collect.(edges(vc)))..., [fill(I2, p - t) for t in (truncation(vc) + 1):(p - 1)]...]
        return RVineCopula(collect(order(vc)), S, E)
    end

    function check_truncated_transport(vc, full; seed, atol, rtol)
        rng = StableRNG(seed)
        p = length(vc)
        @test truncation(vc) < p - 1
        @test truncation(full) == p - 1

        Z = 0.01 .+ 0.98 .* rand(rng, p, 96)
        U = inverse_rosenblatt(vc, Z)
        @test all(x -> 0 ≤ x ≤ 1, U)
        @test rosenblatt(vc, U) ≈ Z atol=atol rtol=rtol
        @test U ≈ inverse_rosenblatt(full, Z) atol=atol rtol=rtol
        @test rosenblatt(vc, U) ≈ rosenblatt(full, U) atol=atol rtol=rtol
        @test logpdf(vc, U) ≈ logpdf(full, U) atol=1e-12 rtol=1e-12
        @test all(isfinite, logpdf(vc, U))

        # The in-place transforms and the vector methods take the same path.
        out = similar(U)
        @test inverse_rosenblatt!(out, vc, Z) ≈ U atol=atol rtol=rtol
        @test rosenblatt!(out, vc, U) ≈ Z atol=atol rtol=rtol
        @test inverse_rosenblatt(vc, Z[:, 1]) ≈ U[:, 1] atol=atol rtol=rtol
        @test rosenblatt(vc, U[:, 1]) ≈ Z[:, 1] atol=atol rtol=rtol

        # Simulation runs through the inverse transform.
        X = rand(StableRNG(seed), vc, 32)
        @test size(X) == (p, 32)
        @test all(x -> 0 ≤ x ≤ 1, X)
        @test X ≈ rand(StableRNG(seed), full, 32) atol=atol rtol=rtol
        Q = simulate_qmc(vc, 64; randomized=false)
        @test size(Q) == (p, 64)
        @test Q ≈ simulate_qmc(full, 64; randomized=false) atol=atol rtol=rtol

        # The numerical CDF is simulation based, so with the same budget and
        # the same unrandomised Sobol points it agrees with the padded vine.
        u = fill(0.4, p)
        c = cdf(vc, u; N=4096, randomized=false)
        @test 0 < c < 1
        @test c ≈ cdf(full, u; N=4096, randomized=false) atol=1e-12
        nothing
    end

    # The four-variable star at tree 1 from the issue: a C-vine written as a
    # standard R-vine, truncated at depth 1. The padded vine is the same star
    # with independence in trees 2 and 3, and the truncated C-vine is a third
    # oracle that has always had its own transform path.
    C = GaussianCopula(2, 0.5)
    star = RVineCopula([1, 2, 3, 4], [[4, 4, 4]], [[C, C, C]]; trunc=1)
    star_full = padded(star, [[3, 3], [2]])
    check_truncated_transport(star, star_full; seed=37, atol=1e-12, rtol=1e-12)
    star_cvine = CVineCopula([4, 1, 2, 3], [[C, C, C]]; trunc=1)
    Ustar = rand(StableRNG(37), star, 64)
    @test logpdf(star, Ustar) ≈ logpdf(star_cvine, Ustar) atol=1e-12 rtol=1e-12

    # A genuinely general five-variable R-vine (neither a path nor a star)
    # truncated at depth 2, padded with the structure of the full fixture.
    Rt = M.rvine5_general(trunc=2)
    Rfull = M.rvine5_general()
    Rt_full = padded(Rt, [collect(struct_array(Rfull)[t]) for t in 3:4])
    @test struct_array(Rt_full) == struct_array(Rfull)
    check_truncated_transport(Rt, Rt_full; seed=38, atol=3e-7, rtol=3e-7)

    # Truncating a full vine and padding it back is the identity on the
    # transport, so `truncate` and the constructor agree.
    Rtr = truncate(Rfull, 2)
    Zr = 0.01 .+ 0.98 .* rand(StableRNG(39), 5, 16)
    @test inverse_rosenblatt(Rtr, Zr) ≈ inverse_rosenblatt(Rt, Zr) atol=1e-12 rtol=1e-12
end
