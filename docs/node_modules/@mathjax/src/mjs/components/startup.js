var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MathJax as MJGlobal, combineWithMathJax, combineDefaults, GLOBAL as global, } from './global.js';
import { PrioritizedList } from '../util/PrioritizedList.js';
import { OPTIONS } from '../util/Options.js';
import { context } from '../util/context.js';
export class Startup {
    static toMML(node) {
        return Startup.visitor.visitTree(node, this.document);
    }
    static registerConstructor(name, constructor) {
        Startup.constructors[name] = constructor;
    }
    static useHandler(name, force = false) {
        if (!CONFIG.handler || force) {
            CONFIG.handler = name;
        }
    }
    static useAdaptor(name, force = false) {
        if (!CONFIG.adaptor || force) {
            CONFIG.adaptor = name;
        }
    }
    static useInput(name, force = false) {
        if (!inputSpecified || force) {
            CONFIG.input.push(name);
        }
    }
    static useOutput(name, force = false) {
        if (!CONFIG.output || force) {
            CONFIG.output = name;
        }
    }
    static extendHandler(extend, priority = 10) {
        Startup.extensions.add(extend, priority);
    }
    static defaultReady() {
        Startup.getComponents();
        Startup.makeMethods();
        Startup.pagePromise
            .then(() => CONFIG.pageReady())
            .then(() => Startup.promiseResolve())
            .catch((err) => Startup.promiseReject(err));
    }
    static defaultPageReady() {
        return (CONFIG.loadAllFontFiles && Startup.output.font
            ? Startup.output.font.loadDynamicFiles()
            : Promise.resolve())
            .then(() => { var _a; return (_a = Startup.document.menu) === null || _a === void 0 ? void 0 : _a.loadingPromise; })
            .then(CONFIG.typeset && MathJax.typesetPromise
            ? () => Startup.typesetPromise(CONFIG.elements)
            : Promise.resolve())
            .then(() => Startup.promiseResolve());
    }
    static typesetPromise(elements) {
        this.hasTypeset = true;
        return Startup.document.whenReady(() => __awaiter(this, void 0, void 0, function* () {
            Startup.document.options.elements = elements;
            Startup.document.reset();
            yield Startup.document.renderPromise();
        }));
    }
    static getComponents() {
        Startup.visitor =
            new MathJax._.core.MmlTree.SerializedMmlVisitor.SerializedMmlVisitor();
        Startup.mathjax = MathJax._.mathjax.mathjax;
        Startup.input = Startup.getInputJax();
        Startup.output = Startup.getOutputJax();
        Startup.adaptor = Startup.getAdaptor();
        if (Startup.handler) {
            Startup.mathjax.handlers.unregister(Startup.handler);
        }
        Startup.handler = Startup.getHandler();
        if (Startup.handler) {
            Startup.mathjax.handlers.register(Startup.handler);
            Startup.document = Startup.getDocument();
        }
    }
    static makeMethods() {
        if (Startup.input && Startup.output) {
            Startup.makeTypesetMethods();
        }
        const oname = Startup.output ? Startup.output.name.toLowerCase() : '';
        for (const jax of Startup.input) {
            const iname = jax.name.toLowerCase();
            Startup.makeMmlMethods(iname, jax);
            Startup.makeResetMethod(iname, jax);
            if (Startup.output) {
                Startup.makeOutputMethods(iname, oname, jax);
            }
        }
        MathJax.done = () => Startup.document.done();
        MathJax.whenReady = (action) => Startup.document.whenReady(action);
    }
    static makeTypesetMethods() {
        MathJax.typeset = (elements = null) => {
            this.hasTypeset = true;
            Startup.document.options.elements = elements;
            Startup.document.reset();
            Startup.document.render();
        };
        MathJax.typesetPromise = (elements = null) => {
            return Startup.typesetPromise(elements);
        };
        MathJax.typesetClear = (elements = null) => {
            if (elements) {
                Startup.document.clearMathItemsWithin(elements);
            }
            else {
                Startup.document.clear();
            }
        };
    }
    static makeOutputMethods(iname, oname, input) {
        const name = iname + '2' + oname;
        MathJax[name] = (math, options = {}) => {
            options = Object.assign(Object.assign({}, options), { format: input.name });
            return Startup.document.convert(math, options);
        };
        MathJax[name + 'Promise'] = (math, options = {}) => {
            options = Object.assign(Object.assign({}, options), { format: input.name });
            return Startup.document.convertPromise(math, options);
        };
        MathJax[oname + 'Stylesheet'] = () => Startup.output.styleSheet(Startup.document);
        if ('getMetricsFor' in Startup.output) {
            MathJax.getMetricsFor = (node, display) => {
                return Startup.output.getMetricsFor(node, display);
            };
        }
    }
    static makeMmlMethods(name, input) {
        const STATE = MathJax._.core.MathItem.STATE;
        MathJax[name + '2mml'] = (math, options = {}) => {
            options = Object.assign(Object.assign({}, options), { end: STATE.CONVERT, format: input.name });
            return Startup.toMML(Startup.document.convert(math, options));
        };
        MathJax[name + '2mmlPromise'] = (math_1, ...args_1) => __awaiter(this, [math_1, ...args_1], void 0, function* (math, options = {}) {
            options = Object.assign(Object.assign({}, options), { end: STATE.CONVERT, format: input.name });
            const node = yield Startup.document.convertPromise(math, options);
            return Startup.toMML(node);
        });
    }
    static makeResetMethod(name, input) {
        MathJax[name + 'Reset'] = (...args) => input.reset(...args);
    }
    static getInputJax() {
        const jax = [];
        for (const name of CONFIG.input) {
            const inputClass = Startup.constructors[name];
            if (inputClass) {
                jax[name] = new inputClass(MathJax.config[name]);
                jax.push(jax[name]);
            }
            else {
                throw Error('Input Jax "' + name + '" is not defined (has it been loaded?)');
            }
        }
        return jax;
    }
    static getOutputJax() {
        const name = CONFIG.output;
        if (!name)
            return null;
        const outputClass = Startup.constructors[name];
        if (!outputClass) {
            throw Error('Output Jax "' + name + '" is not defined (has it been loaded?)');
        }
        return new outputClass(MathJax.config[name]);
    }
    static getAdaptor() {
        const name = CONFIG.adaptor;
        if (!name || name === 'none')
            return null;
        const adaptor = Startup.constructors[name];
        if (!adaptor) {
            throw Error('DOMAdaptor "' + name + '" is not defined (has it been loaded?)');
        }
        return adaptor(MathJax.config[name]);
    }
    static getHandler() {
        const name = CONFIG.handler;
        if (!name || name === 'none' || !Startup.adaptor)
            return null;
        const handlerClass = Startup.constructors[name];
        if (!handlerClass) {
            throw Error('Handler "' + name + '" is not defined (has it been loaded?)');
        }
        let handler = new handlerClass(Startup.adaptor, 5);
        for (const extend of Startup.extensions) {
            handler = extend.item(handler);
        }
        return handler;
    }
    static getDocument(root = null) {
        return Startup.mathjax.document(root || CONFIG.document, Object.assign(Object.assign({}, MathJax.config.options), { InputJax: Startup.input, OutputJax: Startup.output }));
    }
}
Startup.extensions = new PrioritizedList();
Startup.constructors = {};
Startup.input = [];
Startup.output = null;
Startup.handler = null;
Startup.adaptor = null;
Startup.elements = null;
Startup.document = null;
Startup.promise = new Promise((resolve, reject) => {
    Startup.promiseResolve = resolve;
    Startup.promiseReject = reject;
});
Startup.pagePromise = new Promise((resolve, _reject) => {
    const doc = global.document;
    if (!doc ||
        !doc.readyState ||
        doc.readyState === 'complete' ||
        doc.readyState === 'interactive') {
        resolve();
    }
    else {
        const listener = () => resolve();
        doc.defaultView.addEventListener('load', listener, true);
        doc.defaultView.addEventListener('DOMContentLoaded', listener, true);
    }
});
Startup.hasTypeset = false;
Startup.defaultOptionError = OPTIONS.optionError;
export const MathJax = MJGlobal;
if (typeof MathJax._.startup === 'undefined') {
    combineDefaults(MathJax.config, 'startup', {
        input: [],
        output: '',
        handler: null,
        adaptor: null,
        document: context.document || '',
        elements: null,
        typeset: true,
        ready: Startup.defaultReady.bind(Startup),
        pageReady: Startup.defaultPageReady.bind(Startup),
        polyfillHasOwn: true,
    });
    combineWithMathJax({
        startup: Startup,
        options: {},
    });
    if (MathJax.config.startup.invalidOption) {
        OPTIONS.invalidOption = MathJax.config.startup.invalidOption;
    }
    if (MathJax.config.startup.optionError) {
        OPTIONS.optionError = MathJax.config.startup.optionError;
    }
}
export const CONFIG = MathJax.config.startup;
const inputSpecified = CONFIG.input.length !== 0;
//# sourceMappingURL=startup.js.map