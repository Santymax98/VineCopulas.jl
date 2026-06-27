"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorMethods = void 0;
exports.padding = padding;
var NodeUtil_js_1 = __importDefault(require("../NodeUtil.js"));
var ParseUtil_js_1 = require("../ParseUtil.js");
function padding(colorPadding) {
    var pad = "+".concat(colorPadding);
    var unit = colorPadding.replace(/^.*?([a-z]*)$/, '$1');
    var pad2 = 2 * parseFloat(pad);
    return {
        width: "+".concat(pad2).concat(unit),
        height: pad,
        depth: pad,
        lspace: colorPadding,
    };
}
exports.ColorMethods = {
    Color: function (parser, name) {
        var model = parser.GetBrackets(name, '');
        var colorDef = parser.GetArgument(name);
        var colorModel = parser.configuration.packageData.get('color').model;
        var color = colorModel.getColor(model, colorDef);
        var style = parser.itemFactory
            .create('style')
            .setProperties({ styles: { mathcolor: color } });
        parser.stack.env['color'] = color;
        parser.Push(style);
    },
    TextColor: function (parser, name) {
        var model = parser.GetBrackets(name, '');
        var colorDef = parser.GetArgument(name);
        var colorModel = parser.configuration.packageData.get('color').model;
        var color = colorModel.getColor(model, colorDef);
        var old = parser.stack.env['color'];
        parser.stack.env['color'] = color;
        var math = parser.ParseArg(name);
        if (old) {
            parser.stack.env['color'] = old;
        }
        else {
            delete parser.stack.env['color'];
        }
        var node = parser.create('node', 'mstyle', [math], { mathcolor: color });
        parser.Push(node);
    },
    DefineColor: function (parser, name) {
        var cname = parser.GetArgument(name);
        var model = parser.GetArgument(name);
        var def = parser.GetArgument(name);
        var colorModel = parser.configuration.packageData.get('color').model;
        colorModel.defineColor(model, cname, def);
        parser.Push(parser.itemFactory.create('null'));
    },
    ColorBox: function (parser, name) {
        var model = parser.GetBrackets(name, '');
        var cdef = parser.GetArgument(name);
        var math = ParseUtil_js_1.ParseUtil.internalMath(parser, parser.GetArgument(name));
        var colorModel = parser.configuration.packageData.get('color').model;
        var node = parser.create('node', 'mpadded', math, {
            mathbackground: colorModel.getColor(model, cdef),
        });
        NodeUtil_js_1.default.setProperties(node, padding(parser.options.color.padding));
        parser.Push(node);
    },
    FColorBox: function (parser, name) {
        var fmodel = parser.GetBrackets(name, '');
        var fname = parser.GetArgument(name);
        var cmodel = parser.GetBrackets(name, fmodel);
        var cname = parser.GetArgument(name);
        var math = ParseUtil_js_1.ParseUtil.internalMath(parser, parser.GetArgument(name));
        var options = parser.options.color;
        var colorModel = parser.configuration.packageData.get('color').model;
        var node = parser.create('node', 'mpadded', math, {
            mathbackground: colorModel.getColor(cmodel, cname),
            style: "border: ".concat(options.borderWidth, " solid ").concat(colorModel.getColor(fmodel, fname)),
        });
        NodeUtil_js_1.default.setProperties(node, padding(options.padding));
        parser.Push(node);
    },
};
//# sourceMappingURL=ColorMethods.js.map