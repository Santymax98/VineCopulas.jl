import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { MapHandler } from '../MapHandler.js';
import TexError from '../TexError.js';
import NodeUtil from '../NodeUtil.js';
import { CharacterMap, RegExpMap } from '../TokenMap.js';
import * as bitem from './BaseItems.js';
import { AbstractTags } from '../Tags.js';
import './BaseMappings.js';
import { getRange } from '../../../core/MmlTree/OperatorDictionary.js';
import ParseMethods from '../ParseMethods.js';
import { ParseUtil } from '../ParseUtil.js';
import { TexConstant } from '../TexConstants.js';
import { context } from '../../../util/context.js';
const MATHVARIANT = TexConstant.Variant;
new CharacterMap('remap', null, {
    '-': '\u2212',
    '*': '\u2217',
    '`': '\u2018',
});
export function Other(parser, char) {
    const font = parser.stack.env['font'];
    const ifont = parser.stack.env['italicFont'];
    const def = font ? { mathvariant: font } : {};
    const remap = MapHandler.getMap('remap').lookup(char);
    const range = getRange(char);
    const type = range[3];
    const mo = parser.create('token', type, def, remap ? remap.char : char);
    const style = ParseUtil.isLatinOrGreekChar(char)
        ? parser.configuration.mathStyle(char, true) || ifont
        : '';
    const variant = range[4] || (font && style === MATHVARIANT.NORMAL ? '' : style);
    if (variant) {
        mo.attributes.set('mathvariant', variant);
    }
    if (type === 'mo') {
        NodeUtil.setProperty(mo, 'fixStretchy', true);
        parser.configuration.addNode('fixStretchy', mo);
    }
    parser.Push(mo);
}
function csUndefined(_parser, name) {
    throw new TexError('UndefinedControlSequence', 'Undefined control sequence %1', '\\' + name);
}
function envUndefined(_parser, env) {
    throw new TexError('UnknownEnv', "Unknown environment '%1'", env);
}
function filterNonscript({ data }) {
    for (const mml of data.getList('nonscript')) {
        if (mml.attributes.get('scriptlevel') > 0) {
            const parent = mml.parent;
            parent.childNodes.splice(parent.childIndex(mml), 1);
            data.removeFromList(mml.kind, [mml]);
            if (mml.isKind('mrow')) {
                const mstyle = mml.childNodes[0];
                data.removeFromList('mstyle', [mstyle]);
                data.removeFromList('mspace', mstyle.childNodes[0].childNodes);
            }
        }
        else if (mml.isKind('mrow')) {
            mml.parent.replaceChild(mml.childNodes[0], mml);
            data.removeFromList('mrow', [mml]);
        }
    }
}
export class BaseTags extends AbstractTags {
}
export const BaseConfiguration = Configuration.create('base', {
    [ConfigurationType.CONFIG]: function (config, jax) {
        const options = jax.parseOptions.options;
        if (options.digits) {
            options.numberPattern = options.digits;
        }
        new RegExpMap('digit', ParseMethods.digit, options.initialDigit);
        new RegExpMap('letter', ParseMethods.variable, options.initialLetter);
        const handler = config.handlers.get(HandlerType.CHARACTER);
        handler.add(['letter', 'digit'], null, 4);
    },
    [ConfigurationType.HANDLER]: {
        [HandlerType.CHARACTER]: ['command', 'special'],
        [HandlerType.DELIMITER]: ['delimiter'],
        [HandlerType.MACRO]: [
            'delimiter',
            'macros',
            'lcGreek',
            'ucGreek',
            'mathchar0mi',
            'mathchar0mo',
            'mathchar7',
        ],
        [HandlerType.ENVIRONMENT]: ['environment'],
    },
    [ConfigurationType.FALLBACK]: {
        [HandlerType.CHARACTER]: Other,
        [HandlerType.MACRO]: csUndefined,
        [HandlerType.ENVIRONMENT]: envUndefined,
    },
    [ConfigurationType.ITEMS]: {
        [bitem.StartItem.prototype.kind]: bitem.StartItem,
        [bitem.StopItem.prototype.kind]: bitem.StopItem,
        [bitem.OpenItem.prototype.kind]: bitem.OpenItem,
        [bitem.CloseItem.prototype.kind]: bitem.CloseItem,
        [bitem.NullItem.prototype.kind]: bitem.NullItem,
        [bitem.PrimeItem.prototype.kind]: bitem.PrimeItem,
        [bitem.SubsupItem.prototype.kind]: bitem.SubsupItem,
        [bitem.OverItem.prototype.kind]: bitem.OverItem,
        [bitem.LeftItem.prototype.kind]: bitem.LeftItem,
        [bitem.Middle.prototype.kind]: bitem.Middle,
        [bitem.RightItem.prototype.kind]: bitem.RightItem,
        [bitem.BreakItem.prototype.kind]: bitem.BreakItem,
        [bitem.BeginItem.prototype.kind]: bitem.BeginItem,
        [bitem.EndItem.prototype.kind]: bitem.EndItem,
        [bitem.StyleItem.prototype.kind]: bitem.StyleItem,
        [bitem.PositionItem.prototype.kind]: bitem.PositionItem,
        [bitem.CellItem.prototype.kind]: bitem.CellItem,
        [bitem.MmlItem.prototype.kind]: bitem.MmlItem,
        [bitem.FnItem.prototype.kind]: bitem.FnItem,
        [bitem.NotItem.prototype.kind]: bitem.NotItem,
        [bitem.NonscriptItem.prototype.kind]: bitem.NonscriptItem,
        [bitem.DotsItem.prototype.kind]: bitem.DotsItem,
        [bitem.ArrayItem.prototype.kind]: bitem.ArrayItem,
        [bitem.EqnArrayItem.prototype.kind]: bitem.EqnArrayItem,
        [bitem.EquationItem.prototype.kind]: bitem.EquationItem,
        [bitem.MstyleItem.prototype.kind]: bitem.MstyleItem,
    },
    [ConfigurationType.OPTIONS]: {
        maxMacros: 1000,
        digits: '',
        numberPattern: /^(?:[0-9]+(?:\{,\}[0-9]{3})*(?:\.[0-9]*)?|\.[0-9]+)/,
        initialDigit: /[0-9.,]/,
        identifierPattern: /^[a-zA-Z]+/,
        initialLetter: /[a-zA-Z]/,
        baseURL: !context.document ||
            context.document.getElementsByTagName('base').length === 0
            ? ''
            : String(context.document.location).replace(/#.*$/, ''),
    },
    [ConfigurationType.TAGS]: {
        base: BaseTags,
    },
    [ConfigurationType.POSTPROCESSORS]: [[filterNonscript, -4]],
});
//# sourceMappingURL=BaseConfiguration.js.map