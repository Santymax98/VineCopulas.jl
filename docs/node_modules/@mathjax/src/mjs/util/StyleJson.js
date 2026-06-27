export class StyleJsonSheet {
    get cssText() {
        return this.getStyleString();
    }
    constructor(styles = null) {
        this.styles = {};
        this.addStyles(styles);
    }
    addStyles(styles) {
        if (!styles)
            return;
        for (const style of Object.keys(styles)) {
            if (!this.styles[style]) {
                this.styles[style] = {};
            }
            Object.assign(this.styles[style], styles[style]);
        }
    }
    removeStyles(...selectors) {
        for (const selector of selectors) {
            delete this.styles[selector];
        }
    }
    clear() {
        this.styles = {};
    }
    getStyleString() {
        return this.getStyleRules().join('\n\n');
    }
    getStyleRules(styles = this.styles, spaces = '') {
        const selectors = Object.keys(styles);
        const defs = new Array(selectors.length);
        let i = 0;
        for (const selector of selectors) {
            const data = styles[selector];
            defs[i++] =
                `${spaces}${selector} {\n${this.getStyleDefString(data, spaces)}\n${spaces}}`;
        }
        return defs;
    }
    getStyleDefString(styles, spaces) {
        const properties = Object.keys(styles);
        const values = new Array(properties.length);
        let i = 0;
        for (const property of properties) {
            values[i++] =
                styles[property] instanceof Object
                    ? spaces +
                        this.getStyleRules({
                            [property]: styles[property],
                        }, spaces + '  ').join('\n' + spaces)
                    : '  ' + spaces + property + ': ' + styles[property] + ';';
        }
        return values.join('\n' + spaces);
    }
}
//# sourceMappingURL=StyleJson.js.map