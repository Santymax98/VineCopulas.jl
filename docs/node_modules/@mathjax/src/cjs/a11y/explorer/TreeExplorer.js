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
exports.ContrastPicker = exports.TreeColorer = exports.FlameColorer = exports.AbstractTreeExplorer = void 0;
var Explorer_js_1 = require("./Explorer.js");
var AbstractTreeExplorer = (function (_super) {
    __extends(AbstractTreeExplorer, _super);
    function AbstractTreeExplorer(document, pool, region, node, mml) {
        var _this = _super.call(this, document, pool, null, node) || this;
        _this.document = document;
        _this.pool = pool;
        _this.region = region;
        _this.node = node;
        _this.mml = mml;
        _this.stoppable = false;
        return _this;
    }
    AbstractTreeExplorer.prototype.Attach = function () {
        _super.prototype.Attach.call(this);
        this.Start();
    };
    AbstractTreeExplorer.prototype.Detach = function () {
        this.Stop();
        _super.prototype.Detach.call(this);
    };
    return AbstractTreeExplorer;
}(Explorer_js_1.AbstractExplorer));
exports.AbstractTreeExplorer = AbstractTreeExplorer;
var FlameColorer = (function (_super) {
    __extends(FlameColorer, _super);
    function FlameColorer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FlameColorer.prototype.Start = function () {
        if (this.active)
            return;
        this.active = true;
        this.highlighter.highlightAll(this.node);
    };
    FlameColorer.prototype.Stop = function () {
        if (this.active) {
            this.highlighter.unhighlightAll();
        }
        this.active = false;
    };
    return FlameColorer;
}(AbstractTreeExplorer));
exports.FlameColorer = FlameColorer;
var TreeColorer = (function (_super) {
    __extends(TreeColorer, _super);
    function TreeColorer() {
        var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
        _this.contrast = new ContrastPicker();
        _this.leaves = [];
        _this.modality = 'data-semantic-foreground';
        return _this;
    }
    TreeColorer.prototype.Start = function () {
        var _this = this;
        if (this.active)
            return;
        this.active = true;
        if (!this.node.hasAttribute('hasforegroundcolor')) {
            this.colorLeaves();
            this.node.setAttribute('hasforegroundcolor', 'true');
        }
        this.leaves.forEach(function (leaf) { return _this.colorize(leaf); });
    };
    TreeColorer.prototype.Stop = function () {
        var _this = this;
        if (this.active) {
            this.leaves.forEach(function (leaf) { return _this.uncolorize(leaf); });
        }
        this.active = false;
    };
    TreeColorer.prototype.colorLeaves = function () {
        var e_1, _a;
        this.leaves = Array.from(this.node.querySelectorAll('[data-semantic-id]:not([data-semantic-children])'));
        try {
            for (var _b = __values(this.leaves), _c = _b.next(); !_c.done; _c = _b.next()) {
                var leaf = _c.value;
                leaf.setAttribute(this.modality, this.contrast.generate());
                this.contrast.increment();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    TreeColorer.prototype.colorize = function (node) {
        if (node.hasAttribute(this.modality)) {
            node.setAttribute(this.modality + '-old', node.style.color);
            node.style.color = node.getAttribute(this.modality);
        }
    };
    TreeColorer.prototype.uncolorize = function (node) {
        var fore = this.modality + '-old';
        if (node.hasAttribute(fore)) {
            node.style.color = node.getAttribute(fore);
        }
    };
    return TreeColorer;
}(AbstractTreeExplorer));
exports.TreeColorer = TreeColorer;
var ContrastPicker = (function () {
    function ContrastPicker() {
        this.hue = 10;
        this.sat = 100;
        this.light = 50;
        this.incr = 53;
    }
    ContrastPicker.prototype.generate = function () {
        return ContrastPicker.hsl2rgb(this.hue, this.sat, this.light);
    };
    ContrastPicker.prototype.increment = function () {
        this.hue = (this.hue + this.incr) % 360;
    };
    ContrastPicker.hsl2rgb = function (h, s, l) {
        var _a, _b, _c, _d, _e, _f;
        s = s > 1 ? s / 100 : s;
        l = l > 1 ? l / 100 : l;
        var c = (1 - Math.abs(2 * l - 1)) * s;
        var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        var m = l - c / 2;
        var r = 0, g = 0, b = 0;
        if (0 <= h && h < 60) {
            _a = __read([c, x, 0], 3), r = _a[0], g = _a[1], b = _a[2];
        }
        else if (60 <= h && h < 120) {
            _b = __read([x, c, 0], 3), r = _b[0], g = _b[1], b = _b[2];
        }
        else if (120 <= h && h < 180) {
            _c = __read([0, c, x], 3), r = _c[0], g = _c[1], b = _c[2];
        }
        else if (180 <= h && h < 240) {
            _d = __read([0, x, c], 3), r = _d[0], g = _d[1], b = _d[2];
        }
        else if (240 <= h && h < 300) {
            _e = __read([x, 0, c], 3), r = _e[0], g = _e[1], b = _e[2];
        }
        else if (300 <= h && h < 360) {
            _f = __read([c, 0, x], 3), r = _f[0], g = _f[1], b = _f[2];
        }
        return "rgb(".concat((r + m) * 255, ", ").concat((g + m) * 255, ", ").concat((b + m) * 255, ")");
    };
    return ContrastPicker;
}());
exports.ContrastPicker = ContrastPicker;
//# sourceMappingURL=TreeExplorer.js.map