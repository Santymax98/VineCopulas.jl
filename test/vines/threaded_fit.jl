# Issue #45: `threaded=true` fits the edges of a tree, and the family candidates
# of an edge, on tasks. The result is identical to the sequential fit by
# construction, on any thread count, and so are the errors and the trace.

@testsnippet ThreadedFit begin
    using Test
    using Random
    using Distributions: fit, loglikelihood
    using Copulas
    using VineCopulas
    using StableRNGs

    # Structural equality of two fitted vines: structure, families, parameters.
    deq(a::Number, b::Number) = a == b
    deq(a::Symbol, b::Symbol) = a == b
    deq(a::AbstractArray, b::AbstractArray) = size(a) == size(b) && all(deq.(a, b))
    deq(a::Tuple, b::Tuple) = length(a) == length(b) && all(deq(x, y) for (x, y) in zip(a, b))
    function deq(a, b)
        typeof(a) == typeof(b) || return false
        isempty(fieldnames(typeof(a))) && return a == b
        return all(deq(getfield(a, f), getfield(b, f)) for f in fieldnames(typeof(a)))
    end

    # A five-variable D-vine with a Student-t, a BB1 and three one-parameter
    # families, so the default family search exercises every candidate solver.
    function fixture(n)
        truth = DVineCopula(
            [1, 2, 3, 4, 5],
            [[GaussianCopula(2, 0.6), ClaytonCopula(2, 1.5), FrankCopula(2, 2.5), GumbelCopula(2, 1.4)],
             [TCopula(4, [1.0 0.3; 0.3 1.0]), JoeCopula(2, 1.3), BB1Copula(2, 0.5, 1.5)],
             [FrankCopula(2, 1.0), GaussianCopula(2, 0.2)],
             [GaussianCopula(2, 0.1)]],
        )
        return rand(StableRNG(45), truth, n)
    end

    # Run `f()` with stdout captured, and return what it printed.
    function captured(f)
        path, io = mktemp()
        try
            redirect_stdout(f, io)
        finally
            close(io)
        end
        out = read(path, String)
        rm(path; force=true)
        return out
    end

    # The error `f()` throws, or `nothing`.
    function thrown(f)
        try
            f()
            return nothing
        catch err
            return err
        end
    end

    fams = (GaussianCopula, ClaytonCopula, FrankCopula)
end

@testitem "Threaded fit – identical to the sequential fit" tags=[:Fit, :Vine, :Threads] setup=[ThreadedFit] begin
    U = fixture(300)

    # The default family set on the R-vine engine: every candidate solver,
    # both levels of tasks. The C- and D-vine engines share the pair selector,
    # so they run on the small set below.
    s = fit(RVineCopula, U)
    t = fit(RVineCopula, U; threaded=true)
    @test deq(s, t)
    @test loglikelihood(s, U) == loglikelihood(t, U)
    for T in (CVineCopula, DVineCopula)
        local s = fit(T, U; family_set=fams)
        local t = fit(T, U; family_set=fams, threaded=true)
        @test deq(s, t)
        @test loglikelihood(s, U) == loglikelihood(t, U)
    end

    # Truncation, a fixed structure, a fixed order, a threshold, the
    # dependence-only pair method, and the full model.
    st = VineCopulas.structure(fit(RVineCopula, U; family_set=fams))
    cases = (
        (RVineCopula, (; family_set=fams, trunc=2)),
        (RVineCopula, (; family_set=fams, structure=st)),
        (RVineCopula, (; family_set=fams, threshold=0.15)),
        (RVineCopula, (; family_set=fams, pair_method=:itau)),
        (RVineCopula, (; family_set=(TCopula, BB1Copula), selection_criterion=:aic, allow_rotations=false, trunc=1)),
        (CVineCopula, (; family_set=fams, order=[3, 1, 5, 2, 4], trunc=3)),
        (DVineCopula, (; family_set=fams, order=[5, 4, 3, 2, 1])),
    )
    for (T, kw) in cases
        local s = fit(T, U; kw...)
        local t = fit(T, U; threaded=true, kw...)
        @test deq(s, t)
    end

    Ms = fit(CopulaModel, RVineCopula, U; family_set=fams)
    Mt = fit(CopulaModel, RVineCopula, U; family_set=fams, threaded=true)
    @test deq(Copulas.fitted_distribution(Ms), Copulas.fitted_distribution(Mt))
    @test loglikelihood(Ms) == loglikelihood(Mt)

    # The pair selector alone: the candidate level with no edge level.
    U2 = U[1:2, :]
    @test deq(fit(PairCopula, U2), fit(PairCopula, U2; threaded=true))
    @test deq(
        fit(PairCopula, U2; family_set=:all, selection_criterion=:loglik),
        fit(PairCopula, U2; family_set=:all, selection_criterion=:loglik, threaded=true),
    )

    # A tie between candidates resolves to the first in family order on both
    # paths: two copies of one family score equally, and the selection reads
    # the slots in list order rather than in completion order.
    s = fit(PairCopula, U2; family_set=(ClaytonCopula, ClaytonCopula, FrankCopula), include_independence=false)
    t = fit(PairCopula, U2; family_set=(ClaytonCopula, ClaytonCopula, FrankCopula), include_independence=false, threaded=true)
    @test deq(s, t)

    # Repeated threaded fits agree with each other, whatever the schedule.
    ref = fit(RVineCopula, U; threaded=true, family_set=fams, trunc=2)
    for _ in 1:3
        @test deq(ref, fit(RVineCopula, U; threaded=true, family_set=fams, trunc=2))
    end
end

@testitem "Threaded fit – errors are the sequential errors" tags=[:Fit, :Vine, :Threads, :Validation] setup=[ThreadedFit] begin
    U = fixture(300)
    U2 = U[1:2, :]

    # The same error, type and message, from a candidate that cannot be
    # fitted under strict=true: an unknown solver keyword.
    bad = (; family_set=(ClaytonCopula,), pair_kwargs=(; nonesuch=1))
    for T in (PairCopula, RVineCopula, CVineCopula, DVineCopula)
        local X = T === PairCopula ? U2 : U
        local es = thrown(() -> fit(T, X; strict=true, bad...))
        local et = thrown(() -> fit(T, X; strict=true, threaded=true, bad...))
        @test es isa MethodError
        @test typeof(et) == typeof(es)
        @test sprint(showerror, et) == sprint(showerror, es)
    end

    # Without strict, both paths report that every candidate failed.
    es = thrown(() -> fit(PairCopula, U2; bad...))
    et = thrown(() -> fit(PairCopula, U2; threaded=true, bad...))
    @test es isa ErrorException
    @test sprint(showerror, et) == sprint(showerror, es)

    # Validation errors raised inside an edge surface unchanged.
    for kw in ((; family_set=(1,)), (; family_set=(Int,)))
        local es = thrown(() -> fit(RVineCopula, U; kw...))
        local et = thrown(() -> fit(RVineCopula, U; threaded=true, kw...))
        @test es isa ArgumentError
        @test typeof(et) == typeof(es)
        @test sprint(showerror, et) == sprint(showerror, es)
    end

    # `_run_indexed!` joins every task before it rethrows, and rethrows the
    # error of the lowest index.
    done = zeros(Int, 6)
    err = thrown(() -> VineCopulas._run_indexed!(6, true) do i
        done[i] = i
        i in (2, 4) && throw(ErrorException("task $i"))
    end)
    @test err isa ErrorException
    @test err.msg == "task 2"
    @test done == 1:6

    done = zeros(Int, 4)
    @test VineCopulas._run_indexed!(4, true) do i
        done[i] = i
    end === nothing
    @test done == 1:4
    @test VineCopulas._run_indexed!(i -> nothing, 0, true) === nothing
end

@testitem "Threaded fit – trace lines match in edge order" tags=[:Fit, :Vine, :Threads] setup=[ThreadedFit] begin
    U = fixture(300)

    for (T, kw) in ((RVineCopula, (; family_set=fams)),
                    (RVineCopula, (; family_set=fams, structure=VineCopulas.structure(fit(RVineCopula, U; family_set=fams)))),
                    (CVineCopula, (; family_set=fams)),
                    (DVineCopula, (; family_set=fams)),
                    (PairCopula, (; family_set=:default)))
        X = T === PairCopula ? U[1:2, :] : U
        seq = captured(() -> fit(T, X; trace=true, kw...))
        thr = captured(() -> fit(T, X; trace=true, threaded=true, kw...))
        @test !isempty(seq)
        @test occursin("pair candidate: family=", seq)
        @test thr == seq
    end

    # A failing candidate is traced on both paths, with the same line. The
    # printed `MethodError` carries the world age of its call, which differs
    # between any two calls; it is stripped before the comparison.
    U2 = U[1:2, :]
    bad = (; family_set=(ClaytonCopula, FrankCopula), pair_kwargs=(; nonesuch=1), trace=true)
    seq = captured(() -> thrown(() -> fit(PairCopula, U2; bad...)))
    thr = captured(() -> thrown(() -> fit(PairCopula, U2; threaded=true, bad...)))
    no_world(s) = replace(s, r"0x[0-9a-f]{16}" => "0x…")
    @test occursin("pair candidate failed: family=", seq)
    @test no_world(thr) == no_world(seq)
end
