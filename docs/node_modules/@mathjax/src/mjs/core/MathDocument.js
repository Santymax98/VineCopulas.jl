var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { userOptions, defaultOptions, expandable, } from '../util/Options.js';
import { AbstractInputJax } from './InputJax.js';
import { AbstractOutputJax } from './OutputJax.js';
import { AbstractMathList } from './MathList.js';
import { AbstractMathItem, STATE } from './MathItem.js';
import { MmlFactory } from '../core/MmlTree/MmlFactory.js';
import { BitFieldClass } from '../util/BitField.js';
import { PrioritizedList } from '../util/PrioritizedList.js';
import { handleRetriesFor } from '../util/Retries.js';
export class RenderList extends PrioritizedList {
    static create(actions) {
        const list = new this();
        for (const id of Object.keys(actions)) {
            const [action, priority] = this.action(id, actions[id]);
            if (priority) {
                list.add(action, priority);
            }
        }
        return list;
    }
    static action(id, action) {
        let renderDoc, renderMath;
        let convert = true;
        const priority = action[0];
        if (action.length === 1 || typeof action[1] === 'boolean') {
            if (action.length === 2) {
                convert = action[1];
            }
            [renderDoc, renderMath] = this.methodActions(id);
        }
        else if (typeof action[1] === 'string') {
            if (typeof action[2] === 'string') {
                if (action.length === 4) {
                    convert = action[3];
                }
                const [method1, method2] = action.slice(1);
                [renderDoc, renderMath] = this.methodActions(method1, method2);
            }
            else {
                if (action.length === 3) {
                    convert = action[2];
                }
                [renderDoc, renderMath] = this.methodActions(action[1]);
            }
        }
        else {
            if (action.length === 4) {
                convert = action[3];
            }
            [renderDoc, renderMath] = action.slice(1);
        }
        return [
            { id, renderDoc, renderMath, convert },
            priority,
        ];
    }
    static methodActions(method1, method2 = method1) {
        return [
            (document) => {
                if (method1) {
                    document[method1]();
                }
                return false;
            },
            (math, document) => {
                if (method2) {
                    math[method2](document);
                }
                return false;
            },
        ];
    }
    renderDoc(document, start = STATE.UNPROCESSED) {
        for (const item of this.items) {
            if (item.priority >= start) {
                if (item.item.renderDoc(document))
                    return;
            }
        }
    }
    renderMath(math, document, start = STATE.UNPROCESSED) {
        for (const item of this.items) {
            if (item.priority >= start) {
                if (item.item.renderMath(math, document))
                    return;
            }
        }
    }
    renderConvert(math, document, end = STATE.LAST) {
        for (const item of this.items) {
            if (item.priority > end)
                return;
            if (item.item.convert) {
                if (item.item.renderMath(math, document))
                    return;
            }
        }
    }
    findID(id) {
        for (const item of this.items) {
            if (item.item.id === id) {
                return item.item;
            }
        }
        return null;
    }
}
export const resetOptions = {
    all: false,
    processed: false,
    inputJax: null,
    outputJax: null,
};
export const resetAllOptions = {
    all: true,
    processed: true,
    inputJax: [],
    outputJax: [],
};
class DefaultInputJax extends AbstractInputJax {
    compile(_math) {
        return null;
    }
}
class DefaultOutputJax extends AbstractOutputJax {
    typeset(_math, _document = null) {
        return null;
    }
    escaped(_math, _document) {
        return null;
    }
}
class DefaultMathList extends AbstractMathList {
}
class DefaultMathItem extends AbstractMathItem {
}
export class AbstractMathDocument {
    constructor(document, adaptor, options) {
        const CLASS = this.constructor;
        this.document = document;
        this.options = userOptions(defaultOptions({}, CLASS.OPTIONS), options);
        this.math = new (this.options['MathList'] || DefaultMathList)();
        this.renderActions = RenderList.create(this.options['renderActions']);
        this._actionPromises = [];
        this._readyPromise = Promise.resolve();
        this.processed = new AbstractMathDocument.ProcessBits();
        this.outputJax =
            this.options['OutputJax'] || new DefaultOutputJax();
        let inputJax = this.options['InputJax'] || [new DefaultInputJax()];
        if (!Array.isArray(inputJax)) {
            inputJax = [inputJax];
        }
        this.inputJax = inputJax;
        this.adaptor = adaptor;
        this.outputJax.setAdaptor(adaptor);
        this.inputJax.map((jax) => jax.setAdaptor(adaptor));
        this.mmlFactory = this.options['MmlFactory'] || new MmlFactory();
        this.inputJax.map((jax) => jax.setMmlFactory(this.mmlFactory));
        this.outputJax.initialize();
        this.inputJax.map((jax) => jax.initialize());
    }
    get kind() {
        return this.constructor.KIND;
    }
    addRenderAction(id, ...action) {
        const [fn, p] = RenderList.action(id, action);
        this.renderActions.add(fn, p);
    }
    removeRenderAction(id) {
        const action = this.renderActions.findID(id);
        if (action) {
            this.renderActions.remove(action);
        }
    }
    render() {
        this.clearPromises();
        this.renderActions.renderDoc(this);
        return this;
    }
    renderPromise() {
        return this.whenReady(() => handleRetriesFor(() => __awaiter(this, void 0, void 0, function* () {
            this.render();
            yield this.actionPromises();
            this.clearPromises();
            return this;
        })));
    }
    rerender(start = STATE.RERENDER) {
        this.state(start - 1);
        this.render();
        return this;
    }
    rerenderPromise(start = STATE.RERENDER) {
        return this.whenReady(() => handleRetriesFor(() => __awaiter(this, void 0, void 0, function* () {
            this.rerender(start);
            yield this.actionPromises();
            this.clearPromises();
            return this;
        })));
    }
    convert(math, options = {}) {
        let { format, display, end, ex, em, containerWidth, scale, family } = userOptions({
            format: this.inputJax[0].name,
            display: true,
            end: STATE.LAST,
            em: 16,
            ex: 8,
            containerWidth: null,
            scale: 1,
            family: '',
        }, options);
        if (containerWidth === null) {
            containerWidth = 80 * ex;
        }
        const jax = this.inputJax.reduce((jax, ijax) => (ijax.name === format ? ijax : jax), null);
        const mitem = new this.options.MathItem(math, jax, display);
        mitem.start.node = this.adaptor.body(this.document);
        mitem.setMetrics(em, ex, containerWidth, scale);
        if (family && this.outputJax.options.mtextInheritFont) {
            mitem.outputData.mtextFamily = family;
        }
        if (family && this.outputJax.options.merrorInheritFont) {
            mitem.outputData.merrorFamily = family;
        }
        this.clearPromises();
        mitem.convert(this, end);
        return mitem.typesetRoot || mitem.root;
    }
    convertPromise(math, options = {}) {
        return this.whenReady(() => handleRetriesFor(() => __awaiter(this, void 0, void 0, function* () {
            const node = this.convert(math, options);
            yield this.actionPromises();
            this.clearPromises();
            return node;
        })));
    }
    whenReady(action) {
        return (this._readyPromise = this._readyPromise
            .catch((_) => { })
            .then(() => {
            const ready = this._readyPromise;
            this._readyPromise = Promise.resolve();
            const result = action();
            const promise = this._readyPromise.then(() => result);
            this._readyPromise = ready;
            return promise;
        }));
    }
    actionPromises() {
        return Promise.all(this._actionPromises);
    }
    clearPromises() {
        this._actionPromises = [];
    }
    savePromise(promise) {
        this._actionPromises.push(promise);
    }
    findMath(_options = null) {
        this.processed.set('findMath');
        return this;
    }
    compile() {
        if (!this.processed.isSet('compile')) {
            const recompile = [];
            for (const math of this.math) {
                this.compileMath(math);
                if (math.inputData.recompile !== undefined) {
                    recompile.push(math);
                }
            }
            for (const math of recompile) {
                const data = math.inputData.recompile;
                math.state(data.state);
                math.inputData.recompile = data;
                this.compileMath(math);
            }
            this.processed.set('compile');
        }
        return this;
    }
    compileMath(math) {
        try {
            math.compile(this);
        }
        catch (err) {
            if (err.retry || err.restart) {
                throw err;
            }
            this.options['compileError'](this, math, err);
            math.inputData['error'] = err;
        }
    }
    compileError(math, err) {
        math.root = this.mmlFactory.create('math', null, [
            this.mmlFactory.create('merror', { 'data-mjx-error': err.message, title: err.message }, [
                this.mmlFactory.create('mtext', null, [
                    this.mmlFactory.create('text').setText('Math input error'),
                ]),
            ]),
        ]);
        if (math.display) {
            math.root.attributes.set('display', 'block');
        }
        math.inputData.error = err.message;
    }
    typeset() {
        if (!this.processed.isSet('typeset')) {
            for (const math of this.math) {
                try {
                    math.typeset(this);
                }
                catch (err) {
                    if (err.retry || err.restart) {
                        throw err;
                    }
                    this.options['typesetError'](this, math, err);
                    math.outputData['error'] = err;
                }
            }
            this.processed.set('typeset');
        }
        return this;
    }
    typesetError(math, err) {
        math.typesetRoot = this.adaptor.node('mjx-container', {
            class: 'MathJax mjx-output-error',
            jax: this.outputJax.name,
        }, [
            this.adaptor.node('span', {
                'data-mjx-error': err.message,
                title: err.message,
                style: {
                    color: 'red',
                    'background-color': 'yellow',
                    'line-height': 'normal',
                },
            }, [this.adaptor.text('Math output error')]),
        ]);
        if (math.display) {
            this.adaptor.setAttributes(math.typesetRoot, {
                style: {
                    display: 'block',
                    margin: '1em 0',
                    'text-align': 'center',
                },
            });
        }
        math.outputData.error = err.message;
    }
    getMetrics() {
        if (!this.processed.isSet('getMetrics')) {
            this.outputJax.getMetrics(this);
            this.processed.set('getMetrics');
        }
        return this;
    }
    updateDocument() {
        if (!this.processed.isSet('updateDocument')) {
            for (const math of this.math.reversed()) {
                math.updateDocument(this);
            }
            this.processed.set('updateDocument');
        }
        return this;
    }
    removeFromDocument(_restore = false) {
        return this;
    }
    state(state, restore = false) {
        for (const math of this.math) {
            math.state(state, restore);
        }
        if (state < STATE.INSERTED) {
            this.processed.clear('updateDocument');
        }
        if (state < STATE.TYPESET) {
            this.processed.clear('typeset');
            this.processed.clear('getMetrics');
        }
        if (state < STATE.COMPILED) {
            this.processed.clear('compile');
        }
        if (state < STATE.FINDMATH) {
            this.processed.clear('findMath');
        }
        return this;
    }
    reset(options = { processed: true }) {
        options = userOptions(Object.assign({}, resetOptions), options);
        if (options.all) {
            Object.assign(options, resetAllOptions);
        }
        if (options.processed) {
            this.processed.reset();
        }
        if (options.inputJax) {
            this.inputJax.forEach((jax) => jax.reset(...options.inputJax));
        }
        if (options.outputJax) {
            this.outputJax.reset(...options.outputJax);
        }
        return this;
    }
    clear() {
        this.reset();
        this.math.clear();
        return this;
    }
    done() {
        return Promise.resolve();
    }
    concat(list) {
        this.math.merge(list);
        return this;
    }
    clearMathItemsWithin(containers) {
        const items = this.getMathItemsWithin(containers);
        for (const item of items.slice(0).reverse()) {
            item.clear();
        }
        this.math.remove(...items);
        return items;
    }
    getMathItemsWithin(elements) {
        if (!Array.isArray(elements)) {
            elements = [elements];
        }
        const adaptor = this.adaptor;
        const items = [];
        const containers = adaptor.getElements(elements, this.document);
        ITEMS: for (const item of this.math) {
            for (const container of containers) {
                if (item.start.node && adaptor.contains(container, item.start.node)) {
                    items.push(item);
                    continue ITEMS;
                }
            }
        }
        return items;
    }
}
AbstractMathDocument.KIND = 'MathDocument';
AbstractMathDocument.OPTIONS = {
    OutputJax: null,
    InputJax: null,
    MmlFactory: null,
    MathList: DefaultMathList,
    MathItem: DefaultMathItem,
    compileError: (doc, math, err) => {
        doc.compileError(math, err);
    },
    typesetError: (doc, math, err) => {
        doc.typesetError(math, err);
    },
    renderActions: expandable({
        find: [STATE.FINDMATH, 'findMath', '', false],
        compile: [STATE.COMPILED],
        metrics: [STATE.METRICS, 'getMetrics', '', false],
        typeset: [STATE.TYPESET],
        update: [STATE.INSERTED, 'updateDocument', false],
    }),
};
AbstractMathDocument.ProcessBits = BitFieldClass('findMath', 'compile', 'getMetrics', 'typeset', 'updateDocument');
//# sourceMappingURL=MathDocument.js.map