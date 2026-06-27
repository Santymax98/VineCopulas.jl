import { PrioritizedList } from '../util/PrioritizedList.js';
export class HandlerList extends PrioritizedList {
    register(handler) {
        return this.add(handler, handler.priority);
    }
    unregister(handler) {
        this.remove(handler);
    }
    handlesDocument(document) {
        for (const item of this) {
            const handler = item.item;
            if (handler.handlesDocument(document)) {
                return handler;
            }
        }
        throw new Error(`Can't find handler for document`);
    }
    document(document, options = null) {
        return this.handlesDocument(document).create(document, options);
    }
}
//# sourceMappingURL=HandlerList.js.map