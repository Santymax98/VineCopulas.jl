@testitem "Unit interval clamping preserves representable probabilities" tags=[:Numerical, :Clamping, :UnitInterval] setup=[M] begin
    @test VineCopulas._clp(1e-10) == 1e-10
    @test VineCopulas._clp(1.0-1e-10) == 1.0-1e-10
    @test VineCopulas._clp(1e-22) == 1e-22
    @test VineCopulas._clp(0.0) == nextfloat(0.0)
    @test VineCopulas._clp(1.0) == prevfloat(1.0)
end

@testitem "log1p-coordinate difference never rounds below zero" tags=[:Numerical, :Archimedean, :BB] begin
    # The raw formula t + log(-expm1(-d) + exp(-t)) can return a few ulps below
    # zero when d = t - b is tiny (observed as -3.4e-17 from a survival-BB7 pair
    # inside inverse_rosenblatt!, which _arch_probability rejects with a
    # DomainError). L = log(1 + s) with s ≥ 0 is non-negative by construction.
    t = 0.062406015037593986
    for k in 1:8
        b = t - k * eps(t)
        @test VineCopulas._logsubexp_plus_one(t, b) >= 0.0
    end
    @test VineCopulas._logsubexp_plus_one(t, t) == 0.0
    @test VineCopulas._logsubexp_plus_one(2.0, 1.0) ≈ VineCopulas._logsubexp_plus_one_raw(2.0, 1.0)
    for tt in range(0.01, 6.0; length = 200), k in 1:16
        @test VineCopulas._logsubexp_plus_one(tt, tt - k * eps(tt)) >= 0.0
    end
end
