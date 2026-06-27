import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { CommandMap } from '../TokenMap.js';
import TexError from '../TexError.js';
const BboxMethods = {
    BBox(parser, name) {
        const bbox = parser.GetBrackets(name, '');
        let math = parser.ParseArg(name);
        const parts = bbox.split(/,/);
        let def, background, style;
        for (let i = 0, m = parts.length; i < m; i++) {
            const part = parts[i].trim();
            const match = part.match(/^(\.\d+|\d+(\.\d*)?)(pt|em|ex|mu|px|in|cm|mm)$/);
            if (match) {
                if (def) {
                    throw new TexError('MultipleBBoxProperty', '%1 specified twice in %2', 'Padding', name);
                }
                const pad = BBoxPadding(match[1] + match[3]);
                if (pad) {
                    def = {
                        height: '+' + pad,
                        depth: '+' + pad,
                        lspace: pad,
                        width: '+' + 2 * parseInt(match[1], 10) + match[3],
                    };
                }
            }
            else if (part.match(/^([a-z0-9]+|#[0-9a-f]{6}|#[0-9a-f]{3})$/i)) {
                if (background) {
                    throw new TexError('MultipleBBoxProperty', '%1 specified twice in %2', 'Background', name);
                }
                background = part;
            }
            else if (part.match(/^[-a-z]+:/i)) {
                if (style) {
                    throw new TexError('MultipleBBoxProperty', '%1 specified twice in %2', 'Style', name);
                }
                style = BBoxStyle(part);
            }
            else if (part !== '') {
                throw new TexError('InvalidBBoxProperty', '"%1" doesn\'t look like a color, a padding dimension, or a style', part);
            }
        }
        if (def) {
            math = parser.create('node', 'mpadded', [math], def);
        }
        if (background || style) {
            def = {};
            if (background) {
                Object.assign(def, { mathbackground: background });
            }
            if (style) {
                Object.assign(def, { style: style });
            }
            math = parser.create('node', 'mstyle', [math], def);
        }
        parser.Push(math);
    },
};
function BBoxStyle(styles) {
    return styles;
}
function BBoxPadding(pad) {
    return pad;
}
new CommandMap('bbox', { bbox: BboxMethods.BBox });
export const BboxConfiguration = Configuration.create('bbox', {
    [ConfigurationType.HANDLER]: { [HandlerType.MACRO]: ['bbox'] },
});
//# sourceMappingURL=BboxConfiguration.js.map