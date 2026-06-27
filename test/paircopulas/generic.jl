@testitem "Generic – Elliptical pair copulas" tags=[:Generic, :PairCopula, :Elliptical] setup=[M] begin
    for (_, C) in M.elliptical_candidates()
        M.check_paircopula(C)
    end
end

@testitem "Generic – Archimedean pair copulas" tags=[:Generic, :PairCopula, :Archimedean] setup=[M] begin
    for (_, C) in M.archimedean_candidates()
        M.check_paircopula(C)
    end
end

@testitem "Generic – Extreme-value pair copulas" tags=[:Generic, :PairCopula, :ExtremeValue] setup=[M] begin
    for (_, C) in M.extreme_value_candidates()
        M.check_paircopula(C)
    end
end
