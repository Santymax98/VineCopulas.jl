export function CommonMsMixin(Base) {
    return class CommonMsMixin extends Base {
        createText(text) {
            const node = this.wrap(this.mmlText(text));
            node.parent = this;
            return node;
        }
        constructor(factory, node, parent = null) {
            super(factory, node, parent);
            const attributes = this.node.attributes;
            const quotes = attributes.getList('lquote', 'rquote');
            if (this.variant !== 'monospace') {
                if (!attributes.isSet('lquote') && quotes.lquote === '"') {
                    quotes.lquote = '\u201C';
                }
                if (!attributes.isSet('rquote') && quotes.rquote === '"') {
                    quotes.rquote = '\u201D';
                }
            }
            this.childNodes.unshift(this.createText(quotes.lquote));
            this.childNodes.push(this.createText(quotes.rquote));
        }
    };
}
//# sourceMappingURL=ms.js.map