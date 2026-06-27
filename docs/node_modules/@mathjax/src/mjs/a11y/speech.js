var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EnrichHandler, } from './semantic-enrich.js';
import { STATE, newState } from '../core/MathItem.js';
import { expandable } from '../util/Options.js';
import { GeneratorPool } from './speech/GeneratorPool.js';
import { WorkerHandler } from './speech/WebWorker.js';
import { sreRoot } from '#root/sre-root.js';
newState('ATTACHSPEECH', STATE.INSERTED + 10);
export function SpeechMathItemMixin(EnrichedMathItem) {
    return class extends EnrichedMathItem {
        constructor() {
            super(...arguments);
            this.generatorPool = new GeneratorPool();
        }
        attachSpeech(document) {
            this.outputData.speechPromise = null;
            if (this.state() >= STATE.ATTACHSPEECH)
                return;
            this.state(STATE.ATTACHSPEECH);
            if (this.isEscaped ||
                !(document.options.enableSpeech || document.options.enableBraille) ||
                !document.options.enableEnrichment) {
                return;
            }
            document.getWebworker();
            this.generatorPool.init(document.options, document.adaptor, document.webworker);
            this.outputData.mml = this.toMathML(this.root, this);
            const promise = this.generatorPool
                .Speech(this)
                .catch((err) => document.options.speechError(document, this, err));
            document.savePromise(promise);
            this.outputData.speechPromise = promise;
        }
        detachSpeech(document) {
            document.webworker.Detach(this);
        }
        speechFor(mml) {
            return __awaiter(this, void 0, void 0, function* () {
                mml = this.toEnriched(mml);
                const data = yield this.generatorPool.SpeechFor(this, mml);
                return [data.label, data.braillelabel];
            });
        }
        clear() {
            this.generatorPool.cancel(this);
        }
    };
}
export function SpeechMathDocumentMixin(EnrichedMathDocument) {
    var _a;
    return _a = class extends EnrichedMathDocument {
            constructor(...args) {
                super(...args);
                this.webworker = null;
                const ProcessBits = this.constructor
                    .ProcessBits;
                if (!ProcessBits.has('attach-speech')) {
                    ProcessBits.allocate('attach-speech');
                }
                this.options.MathItem = SpeechMathItemMixin(this.options.MathItem);
            }
            getWebworker() {
                if (this.webworker)
                    return;
                this.webworker = new WorkerHandler(this.adaptor, this.options.worker);
                this.webworker.Start();
            }
            attachSpeech() {
                if (!this.processed.isSet('attach-speech')) {
                    const options = this.options;
                    if (options.enableEnrichment &&
                        (options.enableSpeech || options.enableBraille)) {
                        this.getWebworker();
                        for (const math of this.math) {
                            math.attachSpeech(this);
                        }
                    }
                    this.processed.set('attach-speech');
                }
                return this;
            }
            speechError(_doc, _math, err) {
                console.warn('Speech generation error:', err);
            }
            state(state, restore = false) {
                super.state(state, restore);
                if (state < STATE.ATTACHSPEECH) {
                    this.processed.clear('attach-speech');
                    if (state >= STATE.TYPESET) {
                        for (const math of this.math) {
                            math.detachSpeech(this);
                        }
                    }
                }
                return this;
            }
            done() {
                const _super = Object.create(null, {
                    done: { get: () => super.done }
                });
                return __awaiter(this, void 0, void 0, function* () {
                    var _b;
                    yield ((_b = this.webworker) === null || _b === void 0 ? void 0 : _b.Stop());
                    return _super.done.call(this);
                });
            }
        },
        _a.OPTIONS = Object.assign(Object.assign({}, EnrichedMathDocument.OPTIONS), { enableSpeech: true, enableBraille: true, speechError: (doc, math, err) => doc.speechError(doc, math, err), renderActions: expandable(Object.assign(Object.assign({}, EnrichedMathDocument.OPTIONS.renderActions), { attachSpeech: [STATE.ATTACHSPEECH] })), worker: {
                path: sreRoot(),
                maps: sreRoot().replace(/[cm]js\/a11y\/sre$/, 'bundle/sre/mathmaps'),
                worker: 'speech-worker.js',
                debug: false,
            }, a11y: expandable({
                speech: true,
                braille: true,
            }) }),
        _a;
}
export function SpeechHandler(handler, MmlJax) {
    if (!handler.documentClass.prototype.enrich && MmlJax) {
        handler = EnrichHandler(handler, MmlJax);
    }
    handler.documentClass = SpeechMathDocumentMixin(handler.documentClass);
    return handler;
}
//# sourceMappingURL=speech.js.map