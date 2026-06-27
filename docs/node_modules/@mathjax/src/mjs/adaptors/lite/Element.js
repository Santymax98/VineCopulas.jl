export class LiteElement {
    constructor(kind, attributes = {}, children = []) {
        this.kind = kind;
        this.attributes = Object.assign({}, attributes);
        this.children = [...children];
        for (const child of this.children) {
            child.parent = this;
        }
        this.styles = null;
    }
}
//# sourceMappingURL=Element.js.map