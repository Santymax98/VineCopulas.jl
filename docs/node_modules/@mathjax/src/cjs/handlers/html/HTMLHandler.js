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
exports.HTMLHandler = void 0;
var Handler_js_1 = require("../../core/Handler.js");
var HTMLDocument_js_1 = require("./HTMLDocument.js");
var HTMLHandler = (function (_super) {
    __extends(HTMLHandler, _super);
    function HTMLHandler() {
        var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
        _this.documentClass = HTMLDocument_js_1.HTMLDocument;
        return _this;
    }
    HTMLHandler.prototype.handlesDocument = function (document) {
        var adaptor = this.adaptor;
        if (typeof document === 'string') {
            try {
                document = adaptor.parse(document, 'text/html');
            }
            catch (_err) {
            }
        }
        if (document instanceof adaptor.window.Document ||
            document instanceof adaptor.window.HTMLElement ||
            document instanceof adaptor.window.DocumentFragment) {
            return true;
        }
        return false;
    };
    HTMLHandler.prototype.create = function (document, options) {
        var adaptor = this.adaptor;
        if (typeof document === 'string') {
            document = adaptor.parse(document, 'text/html');
        }
        else if (document instanceof adaptor.window.HTMLElement ||
            document instanceof adaptor.window.DocumentFragment) {
            var child = document;
            document = adaptor.parse('', 'text/html');
            adaptor.append(adaptor.body(document), child);
        }
        return _super.prototype.create.call(this, document, options);
    };
    return HTMLHandler;
}(Handler_js_1.AbstractHandler));
exports.HTMLHandler = HTMLHandler;
//# sourceMappingURL=HTMLHandler.js.map