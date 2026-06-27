export function CommonMnMixin(Base) {
    return class CommonMnMixin extends Base {
        remapChars(chars) {
            if (chars.length) {
                const text = this.font.getRemappedChar('mn', chars[0]);
                if (text) {
                    const c = this.unicodeChars(text, this.variant);
                    if (c.length === 1) {
                        chars[0] = c[0];
                    }
                    else {
                        chars = c.concat(chars.slice(1));
                    }
                }
            }
            return chars;
        }
    };
}
//# sourceMappingURL=mn.js.map