export class LiteList {
    constructor(children) {
        this.nodes = [];
        this.nodes = [...children];
    }
    append(node) {
        this.nodes.push(node);
    }
    [Symbol.iterator]() {
        let i = 0;
        return {
            next() {
                return i === this.nodes.length
                    ? { value: null, done: true }
                    : { value: this.nodes[i++], done: false };
            },
        };
    }
}
//# sourceMappingURL=List.js.map