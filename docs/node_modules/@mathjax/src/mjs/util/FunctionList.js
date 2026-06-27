import { PrioritizedList } from './PrioritizedList.js';
export class FunctionList extends PrioritizedList {
    constructor(list = null) {
        super();
        if (list) {
            this.addList(list);
        }
    }
    addList(list) {
        for (const item of list) {
            if (Array.isArray(item)) {
                this.add(item[0], item[1]);
            }
            else {
                this.add(item);
            }
        }
    }
    execute(...data) {
        for (const item of this) {
            const result = item.item(...data);
            if (result === false) {
                return false;
            }
        }
        return true;
    }
    asyncExecute(...data) {
        let i = -1;
        const items = this.items;
        return new Promise((ok, fail) => {
            (function execute() {
                while (++i < items.length) {
                    const result = items[i].item(...data);
                    if (result instanceof Promise) {
                        result.then(execute).catch((err) => fail(err));
                        return;
                    }
                    if (result === false) {
                        ok(false);
                        return;
                    }
                }
                ok(true);
            })();
        });
    }
}
//# sourceMappingURL=FunctionList.js.map