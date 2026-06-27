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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeMixinOptions = void 0;
exports.NodeMixin = NodeMixin;
var Options_js_1 = require("../util/Options.js");
var AsyncLoad_js_1 = require("../util/AsyncLoad.js");
exports.NodeMixinOptions = {
    badCSS: true,
    badSizes: true,
};
function NodeMixin(Base, options) {
    var _a;
    if (options === void 0) { options = {}; }
    options = (0, Options_js_1.userOptions)((0, Options_js_1.defaultOptions)({}, exports.NodeMixinOptions), options);
    return _a = (function (_super) {
            __extends(NodeAdaptor, _super);
            function NodeAdaptor() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _this = _super.call(this, args[0]) || this;
                _this.canMeasureNodes = false;
                var CLASS = _this.constructor;
                _this.options = (0, Options_js_1.userOptions)((0, Options_js_1.defaultOptions)({}, CLASS.OPTIONS), args[1]);
                return _this;
            }
            NodeAdaptor.prototype.fontSize = function (node) {
                return options.badCSS ? this.options.fontSize : _super.prototype.fontSize.call(this, node);
            };
            NodeAdaptor.prototype.fontFamily = function (node) {
                return options.badCSS ? this.options.fontFamily : _super.prototype.fontFamily.call(this, node);
            };
            NodeAdaptor.prototype.nodeSize = function (node, em, local) {
                if (em === void 0) { em = 1; }
                if (local === void 0) { local = null; }
                if (!options.badSizes) {
                    return _super.prototype.nodeSize.call(this, node, em, local);
                }
                var text = this.textContent(node);
                var non = Array.from(text.replace(_a.cjkPattern, '')).length;
                var CJK = Array.from(text).length - non;
                return [
                    CJK * this.options.cjkCharWidth + non * this.options.unknownCharWidth,
                    this.options.unknownCharHeight,
                ];
            };
            NodeAdaptor.prototype.nodeBBox = function (node) {
                return options.badSizes
                    ? { left: 0, right: 0, top: 0, bottom: 0 }
                    : _super.prototype.nodeBBox.call(this, node);
            };
            NodeAdaptor.prototype.createWorker = function (listener, options) {
                return __awaiter(this, void 0, void 0, function () {
                    var Worker, LiteWorker, path, maps, url, worker;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4, (0, AsyncLoad_js_1.asyncLoad)('node:worker_threads')];
                            case 1:
                                Worker = (_b.sent()).Worker;
                                LiteWorker = (function () {
                                    function LiteWorker(url, options) {
                                        if (options === void 0) { options = {}; }
                                        this.worker = new Worker(url, options);
                                    }
                                    LiteWorker.prototype.addEventListener = function (kind, listener) {
                                        this.worker.on(kind, listener);
                                    };
                                    LiteWorker.prototype.postMessage = function (msg) {
                                        this.worker.postMessage({ data: msg });
                                    };
                                    LiteWorker.prototype.terminate = function () {
                                        this.worker.terminate();
                                    };
                                    return LiteWorker;
                                }());
                                path = options.path, maps = options.maps;
                                url = "".concat(path, "/").concat(options.worker);
                                worker = new LiteWorker(url, {
                                    type: 'module',
                                    workerData: { maps: maps },
                                });
                                worker.addEventListener('message', listener);
                                return [2, worker];
                        }
                    });
                });
            };
            return NodeAdaptor;
        }(Base)),
        _a.OPTIONS = __assign(__assign({}, (options.badCSS ? {
            fontSize: 16,
            fontFamily: 'Times',
        } : {})), (options.badSizes ? {
            cjkCharWidth: 1,
            unknownCharWidth: .6,
            unknownCharHeight: .8,
        } : {})),
        _a.cjkPattern = new RegExp([
            '[',
            '\u1100-\u115F',
            '\u2329\u232A',
            '\u2E80-\u303E',
            '\u3040-\u3247',
            '\u3250-\u4DBF',
            '\u4E00-\uA4C6',
            '\uA960-\uA97C',
            '\uAC00-\uD7A3',
            '\uF900-\uFAFF',
            '\uFE10-\uFE19',
            '\uFE30-\uFE6B',
            '\uFF01-\uFF60\uFFE0-\uFFE6',
            "\uD82C\uDC00-\uD82C\uDC01",
            "\uD83C\uDE00-\uD83C\uDE51",
            "\uD840\uDC00-\uD8BF\uDFFD",
            ']',
        ].join(''), 'gu'),
        _a;
}
//# sourceMappingURL=NodeMixin.js.map