export class Usage {
    constructor() {
        this.used = new Set();
        this.needsUpdate = [];
    }
    add(item) {
        const name = JSON.stringify(item);
        if (!this.used.has(name)) {
            this.needsUpdate.push(item);
        }
        this.used.add(name);
    }
    has(item) {
        return this.used.has(JSON.stringify(item));
    }
    clear() {
        this.used.clear();
        this.needsUpdate = [];
    }
    update() {
        const update = this.needsUpdate;
        this.needsUpdate = [];
        return update;
    }
}
//# sourceMappingURL=Usage.js.map