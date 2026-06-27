import { length2em } from '../../util/lengths.js';
export const SafeMethods = {
    filterURL(safe, url) {
        const protocol = (url.match(/^\s*([a-z\n\r]+):/i) || [null, ''])[1]
            .replace(/[\n\r]/g, '')
            .toLowerCase();
        const allow = safe.allow.URLs;
        return allow === 'all' ||
            (allow === 'safe' && (safe.options.safeProtocols[protocol] || !protocol))
            ? url
            : null;
    },
    filterClassList(safe, list) {
        const classes = list.trim().replace(/\s\s+/g, ' ').split(/ /);
        return classes
            .map((name) => this.filterClass(safe, name) || '')
            .join(' ')
            .trim()
            .replace(/\s\s+/g, '');
    },
    filterClass(safe, CLASS) {
        const allow = safe.allow.classes;
        return allow === 'all' ||
            (allow === 'safe' && CLASS.match(safe.options.classPattern))
            ? CLASS
            : null;
    },
    filterID(safe, id) {
        const allow = safe.allow.cssIDs;
        return allow === 'all' ||
            (allow === 'safe' && id.match(safe.options.idPattern))
            ? id
            : null;
    },
    filterStyles(safe, styles) {
        if (safe.allow.styles === 'all')
            return styles;
        if (safe.allow.styles !== 'safe')
            return null;
        const adaptor = safe.adaptor;
        const options = safe.options;
        try {
            const div1 = adaptor.node('div', { style: styles });
            const div2 = adaptor.node('div');
            for (const style of Object.keys(options.safeStyles)) {
                if (options.styleParts[style]) {
                    for (const sufix of ['Top', 'Right', 'Bottom', 'Left']) {
                        const name = style + sufix;
                        const value = this.filterStyle(safe, name, div1);
                        if (value) {
                            adaptor.setStyle(div2, name, value);
                        }
                    }
                }
                else {
                    const value = this.filterStyle(safe, style, div1);
                    if (value) {
                        adaptor.setStyle(div2, style, value);
                    }
                }
            }
            styles = adaptor.allStyles(div2);
        }
        catch (_err) {
            styles = '';
        }
        return styles;
    },
    filterStyle(safe, style, div) {
        const value = safe.adaptor.getStyle(div, style);
        if (typeof value !== 'string' ||
            value === '' ||
            value.match(/^\s*calc/) ||
            (value.match(/javascript:/) && !safe.options.safeProtocols.javascript) ||
            (value.match(/data:/) && !safe.options.safeProtocols.data)) {
            return null;
        }
        const name = style.replace(/Top|Right|Left|Bottom/, '');
        if (!safe.options.safeStyles[style] && !safe.options.safeStyles[name]) {
            return null;
        }
        return this.filterStyleValue(safe, style, value, div);
    },
    filterStyleValue(safe, style, value, div) {
        const name = safe.options.styleLengths[style];
        if (!name) {
            return value;
        }
        if (typeof name !== 'string') {
            return this.filterStyleLength(safe, style, value);
        }
        const length = this.filterStyleLength(safe, name, safe.adaptor.getStyle(div, name));
        if (!length) {
            return null;
        }
        safe.adaptor.setStyle(div, name, length);
        return safe.adaptor.getStyle(div, style);
    },
    filterStyleLength(safe, style, value) {
        if (!value.match(/^(.+)(em|ex|ch|rem|px|mm|cm|in|pt|pc|%)$/))
            return null;
        const em = length2em(value, 1);
        const lengths = safe.options.styleLengths[style];
        const [m, M] = Array.isArray(lengths)
            ? lengths
            : [-safe.options.lengthMax, safe.options.lengthMax];
        return m <= em && em <= M
            ? value
            : (em < m ? m : M).toFixed(3).replace(/\.?0+$/, '') + 'em';
    },
    filterFontSize(safe, size) {
        return this.filterStyleLength(safe, 'fontSize', size);
    },
    filterSizeMultiplier(safe, size) {
        const [m, M] = safe.options.scriptsizemultiplierRange || [
            -Infinity,
            Infinity,
        ];
        return Math.min(M, Math.max(m, parseFloat(size))).toString();
    },
    filterScriptLevel(safe, level) {
        const [m, M] = safe.options.scriptlevelRange || [-Infinity, Infinity];
        return Math.min(M, Math.max(m, parseInt(level))).toString();
    },
    filterData(safe, value, id) {
        return id.match(safe.options.dataPattern) ? value : null;
    },
};
//# sourceMappingURL=SafeMethods.js.map