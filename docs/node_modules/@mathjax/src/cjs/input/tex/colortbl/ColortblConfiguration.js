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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColortblConfiguration = exports.ColorArrayItem = void 0;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var BaseItems_js_1 = require("../base/BaseItems.js");
var Configuration_js_1 = require("../Configuration.js");
var TokenMap_js_1 = require("../TokenMap.js");
var TexError_js_1 = __importDefault(require("../TexError.js"));
var ColorArrayItem = (function (_super) {
    __extends(ColorArrayItem, _super);
    function ColorArrayItem() {
        var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
        _this.color = {
            cell: '',
            row: '',
            col: [],
        };
        _this.hasColor = false;
        return _this;
    }
    ColorArrayItem.prototype.EndEntry = function () {
        _super.prototype.EndEntry.call(this);
        var cell = this.row[this.row.length - 1];
        var color = this.color.cell || this.color.row || this.color.col[this.row.length - 1];
        if (color) {
            cell.attributes.set('mathbackground', color);
            this.color.cell = '';
            this.hasColor = true;
        }
    };
    ColorArrayItem.prototype.EndRow = function () {
        _super.prototype.EndRow.call(this);
        this.color.row = '';
    };
    ColorArrayItem.prototype.createMml = function () {
        var mml = _super.prototype.createMml.call(this);
        var table = mml.isKind('mrow') ? mml.childNodes[1] : mml;
        if (table.isKind('mstyle')) {
            table = table.childNodes[0].childNodes[0];
        }
        if (table.isKind('menclose')) {
            table = table.childNodes[0].childNodes[0];
        }
        if (this.hasColor) {
            var attributes = table.attributes;
            if (attributes.get('frame') === 'none' &&
                attributes.get('data-frame-styles') === undefined) {
                attributes.set('data-frame-styles', '');
            }
        }
        return mml;
    };
    return ColorArrayItem;
}(BaseItems_js_1.ArrayItem));
exports.ColorArrayItem = ColorArrayItem;
function TableColor(parser, name, type) {
    var lookup = parser.configuration.packageData.get('color').model;
    var model = parser.GetBrackets(name, '');
    var color = lookup.getColor(model, parser.GetArgument(name));
    var top = parser.stack.Top();
    if (!(top instanceof ColorArrayItem)) {
        throw new TexError_js_1.default('UnsupportedTableColor', 'Unsupported use of %1', parser.currentCS);
    }
    if (type === 'col') {
        if (top.table.length && top.color.col[top.row.length] !== color) {
            throw new TexError_js_1.default('ColumnColorNotTop', '%1 must be in the top row or preamble', name);
        }
        top.color.col[top.row.length] = color;
        if (parser.GetBrackets(name, '')) {
            parser.GetBrackets(name, '');
        }
    }
    else {
        top.color[type] = color;
        if (type === 'row' && (top.Size() || top.row.length)) {
            throw new TexError_js_1.default('RowColorNotFirst', '%1 must be at the beginning of a row', name);
        }
    }
}
new TokenMap_js_1.CommandMap('colortbl', {
    cellcolor: [TableColor, 'cell'],
    rowcolor: [TableColor, 'row'],
    columncolor: [TableColor, 'col'],
});
var config = function (config, jax) {
    if (!jax.parseOptions.packageData.has('color')) {
        Configuration_js_1.ConfigurationHandler.get('color').config(config, jax);
    }
};
exports.ColortblConfiguration = Configuration_js_1.Configuration.create('colortbl', (_a = {},
    _a[HandlerTypes_js_1.ConfigurationType.HANDLER] = (_b = {}, _b[HandlerTypes_js_1.HandlerType.MACRO] = ['colortbl'], _b),
    _a[HandlerTypes_js_1.ConfigurationType.ITEMS] = { array: ColorArrayItem },
    _a[HandlerTypes_js_1.ConfigurationType.PRIORITY] = 10,
    _a[HandlerTypes_js_1.ConfigurationType.CONFIG] = [config, 10],
    _a));
//# sourceMappingURL=ColortblConfiguration.js.map