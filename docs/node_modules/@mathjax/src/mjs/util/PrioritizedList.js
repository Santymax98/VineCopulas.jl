export class PrioritizedList {
    constructor() {
        this.items = [];
        this.items = [];
    }
    [Symbol.iterator]() {
        let i = 0;
        const items = this.items;
        return {
            next() {
                return { value: items[i++], done: i > items.length };
            },
        };
    }
    add(item, priority = PrioritizedList.DEFAULTPRIORITY) {
        let i = this.items.length;
        do {
            i--;
        } while (i >= 0 && priority < this.items[i].priority);
        this.items.splice(i + 1, 0, { item: item, priority: priority });
        return item;
    }
    remove(item) {
        let i = this.items.length;
        do {
            i--;
        } while (i >= 0 && this.items[i].item !== item);
        if (i >= 0) {
            this.items.splice(i, 1);
        }
        return this;
    }
}
PrioritizedList.DEFAULTPRIORITY = 5;
//# sourceMappingURL=PrioritizedList.js.map