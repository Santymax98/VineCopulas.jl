module VineCopulasClusteringExt

# The clustering step of `dependence_groups`. The checks, the tree-1 distances
# and the largest-gap rule for `k` are in `src/fitting/groups.jl`.

using VineCopulas
import Clustering

function VineCopulas._hclust_groups(D::Matrix{Float64}, k::Union{Nothing,Int}, linkage::Symbol)
    h = Clustering.hclust(D; linkage=linkage)
    return Clustering.cutree(h; k=k === nothing ? VineCopulas._gap_k(h.heights) : k)
end

end
