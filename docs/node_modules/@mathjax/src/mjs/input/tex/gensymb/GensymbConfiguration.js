import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { TexConstant } from '../TexConstants.js';
import { CharacterMap } from '../TokenMap.js';
function mathcharUnit(parser, mchar) {
    const def = mchar.attributes || {};
    def.mathvariant = TexConstant.Variant.NORMAL;
    def.class = 'MathML-Unit';
    const node = parser.create('token', 'mi', def, mchar.char);
    parser.Push(node);
}
new CharacterMap('gensymb-symbols', mathcharUnit, {
    ohm: '\u2126',
    degree: '\u00B0',
    celsius: '\u2103',
    perthousand: '\u2030',
    micro: '\u00B5',
});
export const GensymbConfiguration = Configuration.create('gensymb', {
    [ConfigurationType.HANDLER]: { [HandlerType.MACRO]: ['gensymb-symbols'] },
});
//# sourceMappingURL=GensymbConfiguration.js.map