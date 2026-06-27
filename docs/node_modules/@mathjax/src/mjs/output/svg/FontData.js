import { FontData, mergeOptions, } from '../common/FontData.js';
export * from '../common/FontData.js';
export class SvgFontData extends FontData {
    static charOptions(font, n) {
        return super.charOptions(font, n);
    }
    static addExtension(data, prefix = '') {
        super.addExtension(data, prefix);
        mergeOptions(this, 'variantCacheIds', data.cacheIds);
    }
}
SvgFontData.OPTIONS = Object.assign(Object.assign({}, FontData.OPTIONS), { dynamicPrefix: './svg/dynamic' });
SvgFontData.JAX = 'SVG';
export function AddPaths(font, paths, content) {
    for (const c of Object.keys(paths)) {
        const n = parseInt(c);
        SvgFontData.charOptions(font, n).p = paths[n];
    }
    for (const c of Object.keys(content)) {
        const n = parseInt(c);
        SvgFontData.charOptions(font, n).c = content[n];
    }
    return font;
}
//# sourceMappingURL=FontData.js.map