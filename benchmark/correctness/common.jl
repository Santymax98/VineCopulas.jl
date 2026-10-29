using TOML

const CORRECTNESS_ROOT = @__DIR__
const SPEC_PATH = joinpath(CORRECTNESS_ROOT, "specs.toml")
const DATA_DIR = joinpath(CORRECTNESS_ROOT, "data")
const RESULTS_DIR = joinpath(CORRECTNESS_ROOT, "results")

load_specs() = TOML.parsefile(SPEC_PATH)

function ensure_dirs()
    mkpath(DATA_DIR)
    mkpath(RESULTS_DIR)
    return nothing
end

clean_text(x) = replace(replace(string(x), '\n' => ' '), ',' => ';')

function write_csv(path::AbstractString, header, rows)
    mkpath(dirname(path))
    open(path, "w") do io
        println(io, join(header, ','))
        for row in rows
            println(io, join((clean_text(x) for x in row), ','))
        end
    end
    return path
end

# Small CSV reader for benchmark outputs. It supports the quoting emitted by
# R's write.csv while avoiding an additional CSV package dependency.
function parse_csv_line(line::AbstractString)
    fields = String[]
    buf = IOBuffer()
    quoted = false
    i = firstindex(line)
    while i <= lastindex(line)
        c = line[i]
        if c == '"'
            ni = nextind(line, i)
            if quoted && ni <= lastindex(line) && line[ni] == '"'
                print(buf, '"')
                i = ni
            else
                quoted = !quoted
            end
        elseif c == ',' && !quoted
            push!(fields, String(take!(buf)))
        else
            print(buf, c)
        end
        i = nextind(line, i)
    end
    push!(fields, String(take!(buf)))
    return fields
end

function read_csv(path::AbstractString)
    lines = readlines(path)
    isempty(lines) && return Dict{String,String}[]
    header = parse_csv_line(first(lines))
    rows = Dict{String,String}[]
    for line in Iterators.drop(lines, 1)
        isempty(strip(line)) && continue
        values = parse_csv_line(line)
        length(values) == length(header) || error(
            "CSV column mismatch in $path: expected $(length(header)), got $(length(values))"
        )
        push!(rows, Dict(header .=> values))
    end
    return rows
end

function max_abs_rel(a, b)
    length(a) == length(b) || throw(DimensionMismatch("arrays must have equal length"))
    max_abs = 0.0
    max_rel = 0.0
    @inbounds for i in eachindex(a, b)
        ai = Float64(a[i])
        bi = Float64(b[i])
        d = abs(ai - bi)
        scale = max(abs(ai), abs(bi), 1.0e-14)
        max_abs = max(max_abs, d)
        max_rel = max(max_rel, d / scale)
    end
    return max_abs, max_rel
end

fmt3(x::Real) = string(round(Float64(x), sigdigits=4))
