@testitem "Structure API – C-, D-, and R-vine structures" tags=[:Structure, :Vine] setup=[M] begin
    using Test
    using Distributions
    using VineCopulas

    for (vine, ST, CT) in (
        (M.cvine4(), CVineStructure, CVineCopula),
        (M.dvine4(), DVineStructure, DVineCopula),
        (M.rvine5_general(), RVineStructure, RVineCopula),
    )
        st = structure(vine)

        @test st isa ST
        @test st isa AbstractVineStructure
        @test length(st) == length(vine)
        @test order(st) == order(vine)
        @test truncation(st) == truncation(vine)

        rebuilt = CT(st, edges(vine))
        @test rebuilt isa CT
        @test order(rebuilt) == order(vine)
        @test truncation(rebuilt) == truncation(vine)
        @test edges(rebuilt) == edges(vine)

        U = fill(0.43, length(vine), 3)
        @test logpdf(rebuilt, U) ≈ logpdf(vine, U) atol=1e-12 rtol=1e-12
    end
end

@testitem "Structure API – truncate preserves public vine types" tags=[:Structure, :Vine, :Truncation] setup=[M] begin
    using Test
    using Distributions
    using VineCopulas

    cases = (
        (M.cvine4(), CVineCopula),
        (M.dvine4(), DVineCopula),
        (M.rvine5_general(), RVineCopula),
    )

    for (vine, CT) in cases
        truncated = truncate(vine, 2)
        st = structure(truncated)

        @test truncated isa CT
        @test st isa AbstractVineStructure
        @test length(truncated) == length(vine)
        @test order(truncated) == order(vine)
        @test truncation(truncated) == 2
        @test truncation(st) == 2
        @test edges(truncated) == edges(vine)[1:2]

        expected = if vine isa RVineCopula
            RVineCopula(collect(order(vine)), collect(struct_array(vine)[1:2]), collect(edges(vine)[1:2]); trunc=2)
        elseif vine isa CVineCopula
            CVineCopula(collect(order(vine)), collect(edges(vine)[1:2]); trunc=2)
        else
            DVineCopula(collect(order(vine)), collect(edges(vine)[1:2]); trunc=2)
        end
        U = fill(0.37, length(vine), 4)
        @test logpdf(truncated, U) ≈ logpdf(expected, U) atol=1e-12 rtol=1e-12

        @test_throws ArgumentError truncate(truncated, 3)
        @test_throws ArgumentError truncate(vine, 0)
    end
end

@testitem "Structure API – R-vine structure truncation keeps matrix exchange state" tags=[:Structure, :Vine, :RVine, :Matrix, :Truncation] setup=[M] begin
    using Test
    using VineCopulas

    source = M.rvine5_general()
    matrix_built = RVineCopula(rvine_matrix(source), collect(edges(source)))

    st = truncate(structure(matrix_built), 2)
    truncated = RVineCopula(st, edges(matrix_built)[1:2])

    @test st isa RVineStructure
    @test truncation(st) == 2
    @test struct_array(st) == struct_array(matrix_built)[1:2]
    @test order(truncated) == order(matrix_built)
    @test truncation(truncated) == 2
    @test rvine_matrix(truncated) == rvine_matrix(matrix_built)
end
