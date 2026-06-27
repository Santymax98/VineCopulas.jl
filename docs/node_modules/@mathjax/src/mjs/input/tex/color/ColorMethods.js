import NodeUtil from '../NodeUtil.js';
import { ParseUtil } from '../ParseUtil.js';
export function padding(colorPadding) {
    const pad = `+${colorPadding}`;
    const unit = colorPadding.replace(/^.*?([a-z]*)$/, '$1');
    const pad2 = 2 * parseFloat(pad);
    return {
        width: `+${pad2}${unit}`,
        height: pad,
        depth: pad,
        lspace: colorPadding,
    };
}
export const ColorMethods = {
    Color(parser, name) {
        const model = parser.GetBrackets(name, '');
        const colorDef = parser.GetArgument(name);
        const colorModel = parser.configuration.packageData.get('color').model;
        const color = colorModel.getColor(model, colorDef);
        const style = parser.itemFactory
            .create('style')
            .setProperties({ styles: { mathcolor: color } });
        parser.stack.env['color'] = color;
        parser.Push(style);
    },
    TextColor(parser, name) {
        const model = parser.GetBrackets(name, '');
        const colorDef = parser.GetArgument(name);
        const colorModel = parser.configuration.packageData.get('color').model;
        const color = colorModel.getColor(model, colorDef);
        const old = parser.stack.env['color'];
        parser.stack.env['color'] = color;
        const math = parser.ParseArg(name);
        if (old) {
            parser.stack.env['color'] = old;
        }
        else {
            delete parser.stack.env['color'];
        }
        const node = parser.create('node', 'mstyle', [math], { mathcolor: color });
        parser.Push(node);
    },
    DefineColor(parser, name) {
        const cname = parser.GetArgument(name);
        const model = parser.GetArgument(name);
        const def = parser.GetArgument(name);
        const colorModel = parser.configuration.packageData.get('color').model;
        colorModel.defineColor(model, cname, def);
        parser.Push(parser.itemFactory.create('null'));
    },
    ColorBox(parser, name) {
        const model = parser.GetBrackets(name, '');
        const cdef = parser.GetArgument(name);
        const math = ParseUtil.internalMath(parser, parser.GetArgument(name));
        const colorModel = parser.configuration.packageData.get('color').model;
        const node = parser.create('node', 'mpadded', math, {
            mathbackground: colorModel.getColor(model, cdef),
        });
        NodeUtil.setProperties(node, padding(parser.options.color.padding));
        parser.Push(node);
    },
    FColorBox(parser, name) {
        const fmodel = parser.GetBrackets(name, '');
        const fname = parser.GetArgument(name);
        const cmodel = parser.GetBrackets(name, fmodel);
        const cname = parser.GetArgument(name);
        const math = ParseUtil.internalMath(parser, parser.GetArgument(name));
        const options = parser.options.color;
        const colorModel = parser.configuration.packageData.get('color').model;
        const node = parser.create('node', 'mpadded', math, {
            mathbackground: colorModel.getColor(cmodel, cname),
            style: `border: ${options.borderWidth} solid ${colorModel.getColor(fmodel, fname)}`,
        });
        NodeUtil.setProperties(node, padding(options.padding));
        parser.Push(node);
    },
};
//# sourceMappingURL=ColorMethods.js.map