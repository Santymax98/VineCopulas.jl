"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpeechMathItemMixin = SpeechMathItemMixin;
exports.SpeechMathDocumentMixin = SpeechMathDocumentMixin;
exports.SpeechHandler = SpeechHandler;
var semantic_enrich_js_1 = require("./semantic-enrich.js");
var MathItem_js_1 = require("../core/MathItem.js");
var Options_js_1 = require("../util/Options.js");
var GeneratorPool_js_1 = require("./speech/GeneratorPool.js");
var WebWorker_js_1 = require("./speech/WebWorker.js");
var sre_root_js_1 = require("#root/sre-root.js");
(0, MathItem_js_1.newState)('ATTACHSPEECH', MathItem_js_1.STATE.INSERTED + 10);
function SpeechMathItemMixin(EnrichedMathItem) {
    return (function (_super) {
        __extends(class_1, _super);
        function class_1() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
            _this.generatorPool = new GeneratorPool_js_1.GeneratorPool();
            return _this;
        }
        class_1.prototype.attachSpeech = function (document) {
            var _this = this;
            this.outputData.speechPromise = null;
            if (this.state() >= MathItem_js_1.STATE.ATTACHSPEECH)
                return;
            this.state(MathItem_js_1.STATE.ATTACHSPEECH);
            if (this.isEscaped ||
                !(document.options.enableSpeech || document.options.enableBraille) ||
                !document.options.enableEnrichment) {
                return;
            }
            document.getWebworker();
            this.generatorPool.init(document.options, document.adaptor, document.webworker);
            this.outputData.mml = this.toMathML(this.root, this);
            var promise = this.generatorPool
                .Speech(this)
                .catch(function (err) { return document.options.speechError(document, _this, err); });
            document.savePromise(promise);
            this.outputData.speechPromise = promise;
        };
        class_1.prototype.detachSpeech = function (document) {
            document.webworker.Detach(this);
        };
        class_1.prototype.speechFor = function (mml) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            mml = this.toEnriched(mml);
                            return [4, this.generatorPool.SpeechFor(this, mml)];
                        case 1:
                            data = _a.sent();
                            return [2, [data.label, data.braillelabel]];
                    }
                });
            });
        };
        class_1.prototype.clear = function () {
            this.generatorPool.cancel(this);
        };
        return class_1;
    }(EnrichedMathItem));
}
function SpeechMathDocumentMixin(EnrichedMathDocument) {
    var _a;
    return _a = (function (_super) {
            __extends(class_2, _super);
            function class_2() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _this = _super.apply(this, __spreadArray([], __read(args), false)) || this;
                _this.webworker = null;
                var ProcessBits = _this.constructor
                    .ProcessBits;
                if (!ProcessBits.has('attach-speech')) {
                    ProcessBits.allocate('attach-speech');
                }
                _this.options.MathItem = SpeechMathItemMixin(_this.options.MathItem);
                return _this;
            }
            class_2.prototype.getWebworker = function () {
                if (this.webworker)
                    return;
                this.webworker = new WebWorker_js_1.WorkerHandler(this.adaptor, this.options.worker);
                this.webworker.Start();
            };
            class_2.prototype.attachSpeech = function () {
                var e_1, _b;
                if (!this.processed.isSet('attach-speech')) {
                    var options = this.options;
                    if (options.enableEnrichment &&
                        (options.enableSpeech || options.enableBraille)) {
                        this.getWebworker();
                        try {
                            for (var _c = __values(this.math), _d = _c.next(); !_d.done; _d = _c.next()) {
                                var math = _d.value;
                                math.attachSpeech(this);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                    }
                    this.processed.set('attach-speech');
                }
                return this;
            };
            class_2.prototype.speechError = function (_doc, _math, err) {
                console.warn('Speech generation error:', err);
            };
            class_2.prototype.state = function (state, restore) {
                var e_2, _b;
                if (restore === void 0) { restore = false; }
                _super.prototype.state.call(this, state, restore);
                if (state < MathItem_js_1.STATE.ATTACHSPEECH) {
                    this.processed.clear('attach-speech');
                    if (state >= MathItem_js_1.STATE.TYPESET) {
                        try {
                            for (var _c = __values(this.math), _d = _c.next(); !_d.done; _d = _c.next()) {
                                var math = _d.value;
                                math.detachSpeech(this);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                    }
                }
                return this;
            };
            class_2.prototype.done = function () {
                return __awaiter(this, void 0, void 0, function () {
                    var _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4, ((_b = this.webworker) === null || _b === void 0 ? void 0 : _b.Stop())];
                            case 1:
                                _c.sent();
                                return [2, _super.prototype.done.call(this)];
                        }
                    });
                });
            };
            return class_2;
        }(EnrichedMathDocument)),
        _a.OPTIONS = __assign(__assign({}, EnrichedMathDocument.OPTIONS), { enableSpeech: true, enableBraille: true, speechError: function (doc, math, err) { return doc.speechError(doc, math, err); }, renderActions: (0, Options_js_1.expandable)(__assign(__assign({}, EnrichedMathDocument.OPTIONS.renderActions), { attachSpeech: [MathItem_js_1.STATE.ATTACHSPEECH] })), worker: {
                path: (0, sre_root_js_1.sreRoot)(),
                maps: (0, sre_root_js_1.sreRoot)().replace(/[cm]js\/a11y\/sre$/, 'bundle/sre/mathmaps'),
                worker: 'speech-worker.js',
                debug: false,
            }, a11y: (0, Options_js_1.expandable)({
                speech: true,
                braille: true,
            }) }),
        _a;
}
function SpeechHandler(handler, MmlJax) {
    if (!handler.documentClass.prototype.enrich && MmlJax) {
        handler = (0, semantic_enrich_js_1.EnrichHandler)(handler, MmlJax);
    }
    handler.documentClass = SpeechMathDocumentMixin(handler.documentClass);
    return handler;
}
//# sourceMappingURL=speech.js.map