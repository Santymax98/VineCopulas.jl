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
