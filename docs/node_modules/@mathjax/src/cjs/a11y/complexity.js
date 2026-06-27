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
exports.ComplexityMathItemMixin = ComplexityMathItemMixin;
exports.ComplexityMathDocumentMixin = ComplexityMathDocumentMixin;
exports.ComplexityHandler = ComplexityHandler;
var MathItem_js_1 = require("../core/MathItem.js");
var semantic_enrich_js_1 = require("./semantic-enrich.js");
var visitor_js_1 = require("./complexity/visitor.js");
var Options_js_1 = require("../util/Options.js");
(0, MathItem_js_1.newState)('COMPLEXITY', 40);
function ComplexityMathItemMixin(BaseMathItem, computeComplexity) {
    return (function (_super) {
        __extends(class_1, _super);
        function class_1() {
            var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
            _this.initialID = null;
            return _this;
        }
        class_1.prototype.complexity = function (document, force) {
            if (force === void 0) { force = false; }
            if (this.state() >= MathItem_js_1.STATE.COMPLEXITY)
                return;
            if (!this.isEscaped && (document.options.enableComplexity || force)) {
                this.enrich(document, true);
                computeComplexity(this);
            }
            this.state(MathItem_js_1.STATE.COMPLEXITY);
        };
        return class_1;
    }(BaseMathItem));
}
function ComplexityMathDocumentMixin(BaseDocument) {
    var _a;
    return _a = (function (_super) {
            __extends(class_2, _super);
            function class_2() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _this = _super.apply(this, __spreadArray([], __read(args), false)) || this;
                var ProcessBits = _this.constructor.ProcessBits;
                if (!ProcessBits.has('complexity')) {
                    ProcessBits.allocate('complexity');
                }
                var visitorOptions = (0, Options_js_1.selectOptionsFromKeys)(_this.options, _this.options.ComplexityVisitor.OPTIONS);
                _this.complexityVisitor = new _this.options.ComplexityVisitor(_this.mmlFactory, visitorOptions);
                var computeComplexity = function (math) {
                    math.initialID = _this.complexityVisitor.visitTree(math.root, math.initialID);
                };
                _this.options.MathItem = ComplexityMathItemMixin(_this.options.MathItem, computeComplexity);
                return _this;
            }
            class_2.prototype.complexity = function () {
                var e_1, _b;
                if (!this.processed.isSet('complexity')) {
                    if (this.options.enableComplexity) {
                        try {
                            for (var _c = __values(this.math), _d = _c.next(); !_d.done; _d = _c.next()) {
                                var math = _d.value;
                                math.complexity(this);
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
                    this.processed.set('complexity');
                }
                return this;
            };
            class_2.prototype.state = function (state, restore) {
                if (restore === void 0) { restore = false; }
                _super.prototype.state.call(this, state, restore);
                if (state < MathItem_js_1.STATE.COMPLEXITY) {
                    this.processed.clear('complexity');
                }
                return this;
            };
            return class_2;
        }(BaseDocument)),
        _a.OPTIONS = __assign(__assign(__assign({}, BaseDocument.OPTIONS), visitor_js_1.ComplexityVisitor.OPTIONS), { enableComplexity: true, ComplexityVisitor: visitor_js_1.ComplexityVisitor, renderActions: (0, Options_js_1.expandable)(__assign(__assign({}, BaseDocument.OPTIONS.renderActions), { complexity: [MathItem_js_1.STATE.COMPLEXITY] })) }),
        _a;
}
function ComplexityHandler(handler, MmlJax) {
    if (MmlJax === void 0) { MmlJax = null; }
    if (!handler.documentClass.prototype.enrich && MmlJax) {
        handler = (0, semantic_enrich_js_1.EnrichHandler)(handler, MmlJax);
    }
    handler.documentClass = ComplexityMathDocumentMixin(handler.documentClass);
    return handler;
}
//# sourceMappingURL=complexity.js.map