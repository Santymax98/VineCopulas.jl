var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { STATE, newState } from '../../core/MathItem.js';
import { handleRetriesFor } from '../../util/Retries.js';
export class LazyList {
    constructor() {
        this.id = 0;
        this.items = new Map();
    }
    add(math) {
        const id = String(this.id++);
        this.items.set(id, math);
        return id;
    }
    get(id) {
        return this.items.get(id);
    }
    delete(id) {
        return this.items.delete(id);
    }
}
newState('LAZYALWAYS', STATE.FINDMATH + 3);
export const LAZYID = 'data-mjx-lazy';
export function LazyMathItemMixin(BaseMathItem) {
    return class extends BaseMathItem {
        constructor(...args) {
            super(...args);
            this.lazyCompile = true;
            this.lazyTypeset = true;
            this.lazyTex = false;
            this.attachSpeech = (document) => {
                var _a;
                if (this.state() >= STATE.ATTACHSPEECH)
                    return;
                if (!this.lazyTypeset) {
                    (_a = super.attachSpeech) === null || _a === void 0 ? void 0 : _a.call(this, document);
                }
                this.state(STATE.ATTACHSPEECH);
            };
            if (!this.end.node) {
                this.lazyCompile = this.lazyTypeset = false;
            }
        }
        compile(document) {
            if (!this.lazyCompile) {
                super.compile(document);
                return;
            }
            if (this.state() < STATE.COMPILED) {
                this.lazyTex = this.inputJax.name === 'TeX';
                this.root = document.mmlFactory.create('math');
                this.state(STATE.COMPILED);
            }
        }
        state(state = null, restore = false) {
            if (restore !== null)
                super.state(state, restore);
            return super.state();
        }
        typeset(document) {
            if (!this.lazyTypeset) {
                super.typeset(document);
                return;
            }
            if (this.state() < STATE.TYPESET) {
                const adaptor = document.adaptor;
                if (!this.lazyMarker) {
                    const id = document.lazyList.add(this);
                    this.lazyMarker = adaptor.node('mjx-lazy', { [LAZYID]: id });
                    this.typesetRoot = adaptor.node('mjx-container', {}, [
                        this.lazyMarker,
                    ]);
                }
                this.state(STATE.TYPESET);
            }
        }
        updateDocument(document) {
            super.updateDocument(document);
            if (this.lazyTypeset) {
                document.lazyObserver.observe(this.lazyMarker);
            }
        }
    };
}
export function LazyMathDocumentMixin(BaseDocument) {
    var _a;
    return _a = class BaseClass extends BaseDocument {
            constructor(...args) {
                super(...args);
                this.lazyAlwaysContainers = null;
                this.lazyAlwaysIndex = 0;
                this.lazyPromise = Promise.resolve();
                this.lazyIdle = false;
                this.lazySet = new Set();
                this.options.MathItem = LazyMathItemMixin(this.options.MathItem);
                const ProcessBits = this.constructor.ProcessBits;
                if (!ProcessBits.has('lazyAlways')) {
                    ProcessBits.allocate('lazyAlways');
                }
                this.lazyObserver = new IntersectionObserver(this.lazyObserve.bind(this), { rootMargin: this.options.lazyMargin });
                this.lazyList = new LazyList();
                const callback = this.lazyHandleSet.bind(this);
                this.lazyProcessSet =
                    window && window.requestIdleCallback
                        ? () => window.requestIdleCallback(callback)
                        : () => setTimeout(callback, 10);
                if (window) {
                    let done = false;
                    const handler = () => {
                        if (!done) {
                            this.lazyTypesetAll();
                        }
                        done = true;
                    };
                    window.matchMedia('print').addListener(handler);
                    window.addEventListener('beforeprint', handler);
                }
            }
            lazyAlways() {
                if (!this.lazyAlwaysContainers || this.processed.isSet('lazyAlways'))
                    return;
                for (const item of this.math) {
                    const math = item;
                    if (math.lazyTypeset && this.lazyIsAlways(math)) {
                        math.lazyCompile = math.lazyTypeset = false;
                    }
                }
                this.processed.set('lazyAlways');
            }
            lazyIsAlways(math) {
                if (math.state() < STATE.LAZYALWAYS) {
                    math.state(STATE.LAZYALWAYS);
                    const node = math.start.node;
                    const adaptor = this.adaptor;
                    const start = this.lazyAlwaysIndex;
                    const end = this.lazyAlwaysContainers.length;
                    do {
                        const container = this.lazyAlwaysContainers[this.lazyAlwaysIndex];
                        if (adaptor.contains(container, node))
                            return true;
                        if (++this.lazyAlwaysIndex >= end) {
                            this.lazyAlwaysIndex = 0;
                        }
                    } while (this.lazyAlwaysIndex !== start);
                }
                return false;
            }
            state(state, restore = false) {
                super.state(state, restore);
                if (state < STATE.LAZYALWAYS) {
                    this.processed.clear('lazyAlways');
                }
                return this;
            }
            lazyTypesetAll() {
                return __awaiter(this, void 0, void 0, function* () {
                    let state = STATE.LAST;
                    for (const item of this.math) {
                        const math = item;
                        if (!math.lazyCompile && !math.lazyTypeset)
                            continue;
                        if (math.lazyCompile) {
                            math.state(STATE.COMPILED - 1);
                            state = STATE.COMPILED;
                        }
                        else {
                            math.state(STATE.TYPESET - 1);
                            if (STATE.TYPESET < state)
                                state = STATE.TYPESET;
                        }
                        math.lazyCompile = math.lazyTypeset = false;
                        if (math.lazyMarker) {
                            this.lazyObserver.unobserve(math.lazyMarker);
                        }
                    }
                    if (state === STATE.LAST)
                        return Promise.resolve();
                    this.state(state - 1, null);
                    const fontCache = this.outputJax.options.fontCache;
                    if (fontCache)
                        this.outputJax.options.fontCache = 'none';
                    this.reset();
                    return handleRetriesFor(() => this.render()).then(() => {
                        if (fontCache)
                            this.outputJax.options.fontCache = fontCache;
                    });
                });
            }
            lazyObserve(entries) {
                for (const entry of entries) {
                    const id = this.adaptor.getAttribute(entry.target, LAZYID);
                    const math = this.lazyList.get(id);
                    if (!math)
                        continue;
                    if (!entry.isIntersecting) {
                        this.lazySet.delete(id);
                        continue;
                    }
                    this.lazySet.add(id);
                    if (!this.lazyIdle) {
                        this.lazyIdle = true;
                        this.lazyProcessSet();
                    }
                }
            }
            lazyHandleSet() {
                const set = this.lazySet;
                this.lazySet = new Set();
                this.lazyPromise = this.lazyPromise.then(() => {
                    let state = this.compileEarlierItems(set)
                        ? STATE.COMPILED
                        : STATE.TYPESET;
                    state = this.resetStates(set, state);
                    this.state(state - 1, null);
                    return handleRetriesFor(() => {
                        this.render();
                        this.lazyIdle = false;
                    });
                });
            }
            resetStates(set, state) {
                for (const id of set.values()) {
                    const math = this.lazyList.get(id);
                    if (math.lazyCompile) {
                        math.state(STATE.COMPILED - 1);
                        state = STATE.COMPILED;
                    }
                    else if (!Object.hasOwn(math.metrics, 'em')) {
                        math.state(STATE.METRICS - 1);
                        state = STATE.METRICS;
                    }
                    else {
                        math.state(STATE.TYPESET - 1);
                    }
                    math.lazyCompile = math.lazyTypeset = false;
                    if (math.lazyMarker) {
                        this.lazyObserver.unobserve(math.lazyMarker);
                    }
                }
                return state;
            }
            compileEarlierItems(set) {
                const math = this.earliestTex(set);
                if (!math)
                    return false;
                let compile = false;
                for (const item of this.math) {
                    const earlier = item;
                    if (earlier === math || !(earlier === null || earlier === void 0 ? void 0 : earlier.lazyCompile) || !earlier.lazyTex) {
                        break;
                    }
                    earlier.lazyCompile = false;
                    if (earlier.lazyMarker) {
                        this.lazyObserver.unobserve(earlier.lazyMarker);
                    }
                    earlier.state(STATE.COMPILED - 1);
                    compile = true;
                }
                return compile;
            }
            earliestTex(set) {
                let min = null;
                let minMath = null;
                for (const id of set.values()) {
                    const math = this.lazyList.get(id);
                    if (!math.lazyTex)
                        continue;
                    if (min === null || parseInt(id) < min) {
                        min = parseInt(id);
                        minMath = math;
                    }
                }
                return minMath;
            }
            clearMathItemsWithin(containers) {
                const items = super.clearMathItemsWithin(containers);
                for (const math of items) {
                    const marker = math.lazyMarker;
                    if (marker) {
                        this.lazyObserver.unobserve(marker);
                        this.lazyList.delete(this.adaptor.getAttribute(marker, LAZYID));
                    }
                }
                return items;
            }
            render() {
                const always = this.options.lazyAlwaysTypeset;
                this.lazyAlwaysContainers = !always
                    ? null
                    : this.adaptor.getElements(Array.isArray(always) ? always : [always], this.document);
                this.lazyAlwaysIndex = 0;
                super.render();
                return this;
            }
        },
        _a.OPTIONS = Object.assign(Object.assign({}, BaseDocument.OPTIONS), { lazyMargin: '500px', lazyAlwaysTypeset: null, renderActions: Object.assign(Object.assign({}, BaseDocument.OPTIONS.renderActions), { lazyAlways: [STATE.LAZYALWAYS, 'lazyAlways', '', false] }) }),
        _a;
}
export function LazyHandler(handler) {
    if (typeof IntersectionObserver !== 'undefined') {
        handler.documentClass = LazyMathDocumentMixin(handler.documentClass);
    }
    return handler;
}
//# sourceMappingURL=LazyHandler.js.map