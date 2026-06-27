import TexError from '../TexError.js';
import { COLORS } from './ColorConstants.js';
const ColorModelProcessors = new Map();
export class ColorModel {
    constructor() {
        this.userColors = new Map();
    }
    normalizeColor(model, def) {
        if (!model || model === 'named') {
            if (def.match(/;/)) {
                throw new TexError('BadColorValue', 'Invalid color value');
            }
            return def;
        }
        if (ColorModelProcessors.has(model)) {
            const modelProcessor = ColorModelProcessors.get(model);
            return modelProcessor(def);
        }
        throw new TexError('UndefinedColorModel', "Color model '%1' not defined", model);
    }
    getColor(model, def) {
        if (!model || model === 'named') {
            return this.getColorByName(def);
        }
        return this.normalizeColor(model, def);
    }
    getColorByName(name) {
        if (this.userColors.has(name)) {
            return this.userColors.get(name);
        }
        if (COLORS.has(name)) {
            return COLORS.get(name);
        }
        if (name.match(/;/)) {
            throw new TexError('BadColorValue', 'Invalid color value');
        }
        return name;
    }
    defineColor(model, name, def) {
        const normalized = this.normalizeColor(model, def);
        this.userColors.set(name, normalized);
    }
}
ColorModelProcessors.set('rgb', function (rgb) {
    const rgbParts = rgb.trim().split(/\s*,\s*/);
    let RGB = '#';
    if (rgbParts.length !== 3) {
        throw new TexError('ModelArg1', 'Color values for the %1 model require 3 numbers', 'rgb');
    }
    for (const rgbPart of rgbParts) {
        if (!rgbPart.match(/^(\d+(\.\d*)?|\.\d+)$/)) {
            throw new TexError('InvalidDecimalNumber', 'Invalid decimal number');
        }
        const n = parseFloat(rgbPart);
        if (n < 0 || n > 1) {
            throw new TexError('ModelArg2', 'Color values for the %1 model must be between %2 and %3', 'rgb', '0', '1');
        }
        let pn = Math.floor(n * 255).toString(16);
        if (pn.length < 2) {
            pn = '0' + pn;
        }
        RGB += pn;
    }
    return RGB;
});
ColorModelProcessors.set('RGB', function (rgb) {
    const rgbParts = rgb.trim().split(/\s*,\s*/);
    let RGB = '#';
    if (rgbParts.length !== 3) {
        throw new TexError('ModelArg1', 'Color values for the %1 model require 3 numbers', 'RGB');
    }
    for (const rgbPart of rgbParts) {
        if (!rgbPart.match(/^\d+$/)) {
            throw new TexError('InvalidNumber', 'Invalid number');
        }
        const n = parseInt(rgbPart);
        if (n > 255) {
            throw new TexError('ModelArg2', 'Color values for the %1 model must be between %2 and %3', 'RGB', '0', '255');
        }
        let pn = n.toString(16);
        if (pn.length < 2) {
            pn = '0' + pn;
        }
        RGB += pn;
    }
    return RGB;
});
ColorModelProcessors.set('gray', function (gray) {
    if (!gray.match(/^\s*(\d+(\.\d*)?|\.\d+)\s*$/)) {
        throw new TexError('InvalidDecimalNumber', 'Invalid decimal number');
    }
    const n = parseFloat(gray);
    if (n < 0 || n > 1) {
        throw new TexError('ModelArg2', 'Color values for the %1 model must be between %2 and %3', 'gray', '0', '1');
    }
    let pn = Math.floor(n * 255).toString(16);
    if (pn.length < 2) {
        pn = '0' + pn;
    }
    return `#${pn}${pn}${pn}`;
});
//# sourceMappingURL=ColorUtil.js.map