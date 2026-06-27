export function AddFontIds(ranges, prefix) {
    const variants = {};
    for (const id of Object.keys(ranges)) {
        const map = ranges[id];
        for (const variant of Object.keys(map)) {
            if (!variants[variant]) {
                variants[variant] = {};
            }
            const chars = map[variant];
            if (id) {
                for (const c of Object.keys(chars)) {
                    const data = chars[parseInt(c)];
                    if (!data[3]) {
                        data[3] = {};
                    }
                    if (prefix) {
                        data[3].ff = prefix + '-' + id;
                    }
                    else {
                        data[3].f = id;
                    }
                }
            }
            Object.assign(variants[variant], chars);
        }
    }
    return variants;
}
//# sourceMappingURL=DynamicFonts.js.map