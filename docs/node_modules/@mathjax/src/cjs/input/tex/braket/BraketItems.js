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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BraketItem = void 0;
var StackItem_js_1 = require("../StackItem.js");
var MmlNode_js_1 = require("../../../core/MmlTree/MmlNode.js");
var ParseUtil_js_1 = require("../ParseUtil.js");
var lengths_js_1 = require("../../../util/lengths.js");
var THINSPACE = (0, lengths_js_1.em)(lengths_js_1.MATHSPACE.thinmathspace);
var BraketItem = (function (_super) {
    __extends(BraketItem, _super);
    function BraketItem() {
        var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
        _this.barNodes = [];
        return _this;
    }
    Object.defineProperty(BraketItem.prototype, "kind", {
        get: function () {
            return 'braket';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BraketItem.prototype, "isOpen", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    BraketItem.prototype.checkItem = function (item) {
        var _a;
        if (item.isKind('close')) {
            if (item.getProperty('braketbar')) {
                (_a = this.barNodes).push.apply(_a, __spreadArray([], __read(_super.prototype.toMml.call(this, true, true).childNodes), false));
                this.Clear();
                return StackItem_js_1.BaseItem.fail;
            }
            return [[this.factory.create('mml', this.toMml())], true];
        }
        if (item.isKind('mml')) {
            this.Push(item.toMml());
            if (this.getProperty('single')) {
                return [[this.toMml()], true];
            }
            return StackItem_js_1.BaseItem.fail;
        }
        return _super.prototype.checkItem.call(this, item);
    };
    BraketItem.prototype.toMml = function (inferred, forceRow) {
        if (inferred === void 0) { inferred = true; }
        var inner = _super.prototype.toMml.call(this, inferred, forceRow);
        if (!inferred) {
            return inner;
        }
        var open = this.getProperty('open');
        var close = this.getProperty('close');
        if (this.barNodes.length) {
            inner = this.create('node', 'inferredMrow', __spreadArray(__spreadArray([], __read(this.barNodes), false), [inner], false));
        }
        if (this.getProperty('stretchy')) {
            if (this.getProperty('space')) {
                inner = this.create('node', 'inferredMrow', [
                    this.create('token', 'mspace', { width: THINSPACE }),
                    inner,
                    this.create('token', 'mspace', { width: THINSPACE }),
                ]);
            }
            return ParseUtil_js_1.ParseUtil.fenced(this.factory.configuration, open, inner, close);
        }
        var attrs = {
            fence: true,
            stretchy: false,
            symmetric: true,
            texClass: MmlNode_js_1.TEXCLASS.OPEN,
        };
        var openNode = this.create('token', 'mo', attrs, open);
        attrs.texClass = MmlNode_js_1.TEXCLASS.CLOSE;
        var closeNode = this.create('token', 'mo', attrs, close);
        var mrow = this.create('node', 'mrow', [openNode, inner, closeNode], {
            open: open,
            close: close,
        });
        return mrow;
    };
    return BraketItem;
}(StackItem_js_1.BaseItem));
exports.BraketItem = BraketItem;
//# sourceMappingURL=BraketItems.js.map