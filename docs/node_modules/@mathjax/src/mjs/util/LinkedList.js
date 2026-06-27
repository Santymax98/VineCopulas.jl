export const END = Symbol();
export class ListItem {
    constructor(data = null) {
        this.next = null;
        this.prev = null;
        this.data = data;
    }
}
export class LinkedList {
    constructor(...args) {
        this.list = new ListItem(END);
        this.list.next = this.list.prev = this.list;
        this.push(...args);
    }
    isBefore(a, b) {
        return a < b;
    }
    push(...args) {
        for (const data of args) {
            const item = new ListItem(data);
            item.next = this.list;
            item.prev = this.list.prev;
            this.list.prev = item;
            item.prev.next = item;
        }
        return this;
    }
    pop() {
        const item = this.list.prev;
        if (item.data === END) {
            return null;
        }
        this.list.prev = item.prev;
        item.prev.next = this.list;
        item.next = item.prev = null;
        return item.data;
    }
    unshift(...args) {
        for (const data of args.slice(0).reverse()) {
            const item = new ListItem(data);
            item.next = this.list.next;
            item.prev = this.list;
            this.list.next = item;
            item.next.prev = item;
        }
        return this;
    }
    shift() {
        const item = this.list.next;
        if (item.data === END) {
            return null;
        }
        this.list.next = item.next;
        item.next.prev = this.list;
        item.next = item.prev = null;
        return item.data;
    }
    remove(...items) {
        const map = new Map();
        for (const item of items) {
            map.set(item, true);
        }
        let item = this.list.next;
        while (item.data !== END) {
            const next = item.next;
            if (map.has(item.data)) {
                item.prev.next = item.next;
                item.next.prev = item.prev;
                item.next = item.prev = null;
            }
            item = next;
        }
        return this;
    }
    clear() {
        this.list.next.prev = this.list.prev.next = null;
        this.list.next = this.list.prev = this.list;
        return this;
    }
    *[Symbol.iterator]() {
        let current = this.list.next;
        while (current.data !== END) {
            yield current.data;
            current = current.next;
        }
    }
    *reversed() {
        let current = this.list.prev;
        while (current.data !== END) {
            yield current.data;
            current = current.prev;
        }
    }
    insert(data, isBefore = null) {
        if (isBefore === null) {
            isBefore = this.isBefore.bind(this);
        }
        const item = new ListItem(data);
        let cur = this.list.next;
        while (cur.data !== END &&
            isBefore(cur.data, item.data)) {
            cur = cur.next;
        }
        item.prev = cur.prev;
        item.next = cur;
        cur.prev.next = cur.prev = item;
        return this;
    }
    sort(isBefore = null) {
        if (isBefore === null) {
            isBefore = this.isBefore.bind(this);
        }
        const lists = [];
        for (const item of this) {
            lists.push(new LinkedList(item));
        }
        this.list.next = this.list.prev = this.list;
        while (lists.length > 1) {
            const l1 = lists.shift();
            const l2 = lists.shift();
            l1.merge(l2, isBefore);
            lists.push(l1);
        }
        if (lists.length) {
            this.list = lists[0].list;
        }
        return this;
    }
    merge(list, isBefore = null) {
        if (isBefore === null) {
            isBefore = this.isBefore.bind(this);
        }
        let lcur = this.list.next;
        let mcur = list.list.next;
        while (lcur.data !== END && mcur.data !== END) {
            if (isBefore(mcur.data, lcur.data)) {
                [mcur.prev.next, lcur.prev.next] = [lcur, mcur];
                [mcur.prev, lcur.prev] = [lcur.prev, mcur.prev];
                [this.list.prev.next, list.list.prev.next] = [list.list, this.list];
                [this.list.prev, list.list.prev] = [list.list.prev, this.list.prev];
                [lcur, mcur] = [mcur.next, lcur];
            }
            else {
                lcur = lcur.next;
            }
        }
        if (mcur.data !== END) {
            this.list.prev.next = list.list.next;
            list.list.next.prev = this.list.prev;
            list.list.prev.next = this.list;
            this.list.prev = list.list.prev;
            list.list.next = list.list.prev = list.list;
        }
        return this;
    }
}
//# sourceMappingURL=LinkedList.js.map