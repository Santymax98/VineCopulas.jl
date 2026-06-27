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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MmlMspace = void 0;
var MmlNode_js_1 = require("../MmlNode.js");
var MmlMspace = (function (_super) {
    __extends(MmlMspace, _super);
    function MmlMspace() {
        var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
        _this.texclass = MmlNode_js_1.TEXCLASS.NONE;
        return _this;
    }
    MmlMspace.prototype.setTeXclass = function (prev) {
        return prev;
    };
    Object.defineProperty(MmlMspace.prototype, "kind", {
        get: function () {
            return 'mspace';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MmlMspace.prototype, "arity", {
        get: function () {
            return 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MmlMspace.prototype, "isSpacelike", {
        get: function () {
            return !this.attributes.hasExplicit('linebreak') && this.canBreak;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MmlMspace.prototype, "hasNewline", {
        get: function () {
            var linebreak = this.attributes.get('linebreak');
            return (this.canBreak &&
                (linebreak === 'newline' || linebreak === 'indentingnewline'));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MmlMspace.prototype, "canBreak", {
        get: function () {
            return (!this.attributes.hasOneOf(MmlMspace.NONSPACELIKE) &&
                String(this.attributes.get('width')).trim().charAt(0) !== '-');
        },
        enumerable: false,
        configurable: true
    });
    MmlMspace.NONSPACELIKE = [
        'height',
        'depth',
        'style',
        'mathbackground',
        'background',
    ];
    MmlMspace.defaults = __assign(__assign({}, MmlNode_js_1.AbstractMmlTokenNode.defaults), { width: '0em', height: '0ex', depth: '0ex', linebreak: 'auto', indentshift: 'auto', indentalign: 'auto', indenttarget: '', indentalignfirst: 'indentalign', indentshiftfirst: 'indentshift', indentalignlast: 'indentalign', indentshiftlast: 'indentshift' });
    return MmlMspace;
}(MmlNode_js_1.AbstractMmlTokenNode));
exports.MmlMspace = MmlMspace;
//# sourceMappingURL=mspace.js.map