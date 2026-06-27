export class AbstractExplorer {
    get highlighter() {
        return this.pool.highlighter;
    }
    static stopEvent(event) {
        if (event.preventDefault) {
            event.preventDefault();
        }
        else {
            event.returnValue = false;
        }
        if (event.stopImmediatePropagation) {
            event.stopImmediatePropagation();
        }
        else if (event.stopPropagation) {
            event.stopPropagation();
        }
        event.cancelBubble = true;
    }
    static create(document, pool, region, node, ...rest) {
        const explorer = new this(document, pool, region, node, ...rest);
        return explorer;
    }
    constructor(document, pool, region, node, ..._rest) {
        this.document = document;
        this.pool = pool;
        this.region = region;
        this.node = node;
        this.stoppable = true;
        this.events = [];
        this._active = false;
    }
    Events() {
        return this.events;
    }
    get active() {
        return this._active;
    }
    set active(flag) {
        this._active = flag;
    }
    Attach() {
        this.AddEvents();
    }
    Detach() {
        this.RemoveEvents();
    }
    Start() {
        this.active = true;
    }
    Stop() {
        if (this.active) {
            this.region.Clear();
            this.region.Hide();
            this.active = false;
        }
    }
    AddEvents() {
        for (const [eventkind, eventfunc] of this.events) {
            this.node.addEventListener(eventkind, eventfunc);
        }
    }
    RemoveEvents() {
        for (const [eventkind, eventfunc] of this.events) {
            this.node.removeEventListener(eventkind, eventfunc);
        }
    }
    Update(_force = false) { }
    stopEvent(event) {
        if (this.stoppable) {
            AbstractExplorer.stopEvent(event);
        }
    }
}
//# sourceMappingURL=Explorer.js.map