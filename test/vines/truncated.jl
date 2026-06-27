@testitem "Generic – truncated C- and D-vines" tags=[:Generic, :Vine, :Truncation] setup=[M] begin
    M.check(M.cvine4_truncated())
    M.check(M.dvine4_truncated())
end

@testitem "Rosenblatt – truncated C- and D-vines" tags=[:Rosenblatt, :Vine, :Truncation] setup=[M] begin
    M.check_rosenblatt(M.cvine4_truncated(); seed=701)
    M.check_rosenblatt(M.dvine4_truncated(); seed=702)
end
