import { ParseUtil } from '../ParseUtil.js';
import { UnitUtil } from '../UnitUtil.js';
import ParseMethods from '../ParseMethods.js';
import NodeUtil from '../NodeUtil.js';
import { TexConstant } from '../TexConstants.js';
import TexParser from '../TexParser.js';
import TexError from '../TexError.js';
import BaseMethods from '../base/BaseMethods.js';
import { splitAlignArray } from '../base/BaseMethods.js';
import { TEXCLASS } from '../../../core/MmlTree/MmlNode.js';
import { NewcommandUtil } from '../newcommand/NewcommandUtil.js';
function splitSideSet(mml) {
    if (!mml || (mml.isInferred && mml.childNodes.length === 0)) {
        return [null, null];
    }
    if (mml.isKind('msubsup') && checkSideSetBase(mml)) {
        return [mml, null];
    }
    const child = NodeUtil.getChildAt(mml, 0);
    if (!(mml.isInferred && child && checkSideSetBase(child))) {
        return [null, mml];
    }
    mml.childNodes.splice(0, 1);
    return [child, mml];
}
function checkSideSetBase(mml) {
    const base = mml.childNodes[0];
    return (base && base.isKind('mi') && base.getText() === '');
}
export const AmsMethods = {
    AmsEqnArray(parser, begin, numbered, taggable, align, balign, spacing, style) {
        const args = parser.GetBrackets('\\begin{' + begin.getName() + '}');
        const array = BaseMethods.EqnArray(parser, begin, numbered, taggable, align, balign, spacing, style);
        return ParseUtil.setArrayAlign(array, args, parser);
    },
    AlignAt(parser, begin, numbered, taggable) {
        const name = begin.getName();
        let valign;
        let align = '';
        let balign = '';
        const spacing = [];
        if (!taggable) {
            valign = parser.GetBrackets('\\begin{' + name + '}');
        }
        const n = parser.GetArgument('\\begin{' + name + '}');
        if (n.match(/[^0-9]/)) {
            throw new TexError('PositiveIntegerArg', 'Argument to %1 must be a positive integer', '\\begin{' + name + '}');
        }
        let count = parseInt(n, 10);
        while (count > 0) {
            align += 'rl';
            balign += 'bt';
            spacing.push('0em 0em');
            count--;
        }
        const spaceStr = spacing.join(' ');
        if (taggable) {
            return AmsMethods.EqnArray(parser, begin, numbered, taggable, align, balign, spaceStr);
        }
        const array = AmsMethods.EqnArray(parser, begin, numbered, taggable, align, balign, spaceStr);
        return ParseUtil.setArrayAlign(array, valign, parser);
    },
    Multline(parser, begin, numbered) {
        ParseUtil.checkEqnEnv(parser);
        parser.Push(begin);
        const padding = parser.options.ams['multlineIndent'];
        const item = parser.itemFactory.create('multline', numbered, parser.stack);
        item.arraydef = {
            displaystyle: true,
            rowspacing: '.5em',
            columnspacing: '100%',
            width: parser.options.ams['multlineWidth'],
            side: parser.options['tagSide'],
            minlabelspacing: parser.options['tagIndent'],
            'data-array-padding': `${padding} ${padding}`,
            'data-width-includes-label': true,
        };
        return item;
    },
    XalignAt(parser, begin, numbered, padded) {
        const n = parser.GetArgument('\\begin{' + begin.getName() + '}');
        if (n.match(/[^0-9]/)) {
            throw new TexError('PositiveIntegerArg', 'Argument to %1 must be a positive integer', '\\begin{' + begin.getName() + '}');
        }
        const align = padded ? 'crl' : 'rlc';
        const balign = padded ? 'mbt' : 'btm';
        const width = padded ? 'fit auto auto' : 'auto auto fit';
        const item = AmsMethods.FlalignArray(parser, begin, numbered, padded, false, align, balign, width, true);
        item.setProperty('xalignat', 2 * parseInt(n));
        return item;
    },
    FlalignArray(parser, begin, numbered, padded, center, align, balign, width, zeroWidthLabel = false) {
        ParseUtil.checkEqnEnv(parser);
        parser.Push(begin);
        align = align
            .split('')
            .join(' ')
            .replace(/r/g, 'right')
            .replace(/l/g, 'left')
            .replace(/c/g, 'center');
        balign = splitAlignArray(balign);
        const item = parser.itemFactory.create('flalign', begin.getName(), numbered, padded, center, parser.stack);
        item.arraydef = {
            width: '100%',
            displaystyle: true,
            columnalign: align,
            columnspacing: '0em',
            columnwidth: width,
            rowspacing: '3pt',
            'data-break-align': balign,
            side: parser.options['tagSide'],
            minlabelspacing: zeroWidthLabel ? '0' : parser.options['tagIndent'],
            'data-width-includes-label': true,
        };
        item.setProperty('zeroWidthLabel', zeroWidthLabel);
        return item;
    },
    HandleDeclareOp(parser, name) {
        const star = parser.GetStar() ? '*' : '';
        const cs = NewcommandUtil.GetCsNameArgument(parser, name);
        const op = parser.GetArgument(name);
        NewcommandUtil.addMacro(parser, cs, AmsMethods.Macro, [
            `\\operatorname${star}{${op}}`,
        ]);
        parser.Push(parser.itemFactory.create('null'));
    },
    HandleOperatorName(parser, name) {
        const star = parser.GetStar();
        const op = UnitUtil.trimSpaces(parser.GetArgument(name));
        let mml = new TexParser(op, Object.assign(Object.assign({}, parser.stack.env), { font: TexConstant.Variant.NORMAL, multiLetterIdentifiers: parser.options.ams.operatornamePattern, operatorLetters: true, noAutoOP: true }), parser.configuration).mml();
        if (mml.isKind('mi')) {
            mml.removeProperty('autoOP');
        }
        else {
            mml = parser.create('node', 'TeXAtom', [mml]);
        }
        NodeUtil.setProperties(mml, {
            movesupsub: star,
            movablelimits: true,
            texClass: TEXCLASS.OP,
        });
        if (!star) {
            const c = parser.GetNext();
            const i = parser.i;
            if (c === '\\' && ++parser.i && parser.GetCS() !== 'limits') {
                parser.i = i;
            }
        }
        parser.Push(parser.itemFactory.create('fn', mml));
    },
    SideSet(parser, name) {
        const [preScripts, preRest] = splitSideSet(parser.ParseArg(name));
        const [postScripts, postRest] = splitSideSet(parser.ParseArg(name));
        const base = parser.ParseArg(name);
        let mml = base;
        if (preScripts) {
            if (preRest) {
                preScripts.replaceChild(parser.create('node', 'mphantom', [
                    parser.create('node', 'mpadded', [ParseUtil.copyNode(base, parser)], { width: 0 }),
                ]), NodeUtil.getChildAt(preScripts, 0));
            }
            else {
                mml = parser.create('node', 'mmultiscripts', [base]);
                if (postScripts) {
                    NodeUtil.appendChildren(mml, [
                        NodeUtil.getChildAt(postScripts, 1) ||
                            parser.create('node', 'none'),
                        NodeUtil.getChildAt(postScripts, 2) ||
                            parser.create('node', 'none'),
                    ]);
                }
                NodeUtil.setProperty(mml, 'scriptalign', 'left');
                NodeUtil.appendChildren(mml, [
                    parser.create('node', 'mprescripts'),
                    NodeUtil.getChildAt(preScripts, 1) || parser.create('node', 'none'),
                    NodeUtil.getChildAt(preScripts, 2) || parser.create('node', 'none'),
                ]);
            }
        }
        if (postScripts && mml === base) {
            postScripts.replaceChild(base, NodeUtil.getChildAt(postScripts, 0));
            mml = postScripts;
        }
        const mrow = parser.create('node', 'TeXAtom', [], {
            texClass: TEXCLASS.OP,
            movesupsub: true,
            movablelimits: true,
        });
        if (preRest) {
            if (preScripts) {
                mrow.appendChild(preScripts);
            }
            mrow.appendChild(preRest);
        }
        mrow.appendChild(mml);
        if (postRest) {
            mrow.appendChild(postRest);
        }
        parser.Push(mrow);
    },
    operatorLetter(parser, c) {
        return parser.stack.env.operatorLetters
            ? ParseMethods.variable(parser, c)
            : false;
    },
    MultiIntegral(parser, name, integral) {
        let next = parser.GetNext();
        if (next === '\\') {
            const i = parser.i;
            next = parser.GetArgument(name);
            parser.i = i;
            if (next === '\\limits') {
                integral = '\\!\\!\\mathop{\\,\\,' + integral + '}';
            }
        }
        parser.string = integral + ' ' + parser.string.slice(parser.i);
        parser.i = 0;
    },
    xArrow(parser, name, chr, l, r, m = 0) {
        const def = {
            width: '+' + UnitUtil.em((l + r) / 18),
            lspace: UnitUtil.em(l / 18),
        };
        const bot = parser.GetBrackets(name);
        const first = parser.ParseArg(name);
        const dstrut = parser.create('node', 'mspace', [], { depth: '.2em' });
        let arrow = parser.create('token', 'mo', { stretchy: true, texClass: TEXCLASS.ORD }, String.fromCodePoint(chr));
        if (m) {
            arrow.attributes.set('minsize', UnitUtil.em(m));
        }
        arrow = parser.create('node', 'mstyle', [arrow], { scriptlevel: 0 });
        const mml = parser.create('node', 'munderover', [arrow]);
        let mpadded = parser.create('node', 'mpadded', [first, dstrut], def);
        NodeUtil.setAttribute(mpadded, 'voffset', '-.2em');
        NodeUtil.setAttribute(mpadded, 'height', '-.2em');
        NodeUtil.setChild(mml, mml.over, mpadded);
        if (bot) {
            const bottom = new TexParser(bot, parser.stack.env, parser.configuration).mml();
            const bstrut = parser.create('node', 'mspace', [], { height: '.75em' });
            mpadded = parser.create('node', 'mpadded', [bottom, bstrut], def);
            NodeUtil.setAttribute(mpadded, 'voffset', '.15em');
            NodeUtil.setAttribute(mpadded, 'depth', '-.15em');
            NodeUtil.setChild(mml, mml.under, mpadded);
        }
        NodeUtil.setProperty(mml, 'subsupOK', true);
        parser.Push(parser.create('node', 'TeXAtom', [
            parser.create('node', 'TeXAtom', [], {
                texClass: TEXCLASS.NONE,
            }),
            mml,
        ], { texClass: TEXCLASS.REL }));
    },
    HandleShove(parser, _name, shove) {
        const top = parser.stack.Top();
        if (top.kind !== 'multline') {
            throw new TexError('CommandOnlyAllowedInEnv', '%1 only allowed in %2 environment', parser.currentCS, 'multline');
        }
        if (top.Size()) {
            throw new TexError('CommandAtTheBeginingOfLine', '%1 must come at the beginning of the line', parser.currentCS);
        }
        top.setProperty('shove', shove);
    },
    CFrac(parser, name) {
        let lr = UnitUtil.trimSpaces(parser.GetBrackets(name, ''));
        const num = parser.GetArgument(name);
        const den = parser.GetArgument(name);
        const lrMap = {
            l: TexConstant.Align.LEFT,
            r: TexConstant.Align.RIGHT,
            '': '',
        };
        const numNode = new TexParser('\\strut\\textstyle{' + num + '}', parser.stack.env, parser.configuration).mml();
        const denNode = new TexParser('\\strut\\textstyle{' + den + '}', parser.stack.env, parser.configuration).mml();
        const frac = parser.create('node', 'mfrac', [numNode, denNode]);
        lr = lrMap[lr];
        if (lr == null) {
            throw new TexError('IllegalAlign', 'Illegal alignment specified in %1', parser.currentCS);
        }
        if (lr) {
            NodeUtil.setProperties(frac, { numalign: lr, denomalign: lr });
        }
        parser.Push(frac);
    },
    Genfrac(parser, name, left, right, thick, style) {
        if (left == null) {
            left = parser.GetDelimiterArg(name);
        }
        if (right == null) {
            right = parser.GetDelimiterArg(name);
        }
        if (thick == null) {
            thick = parser.GetArgument(name);
        }
        if (style == null) {
            style = UnitUtil.trimSpaces(parser.GetArgument(name));
        }
        const num = parser.ParseArg(name);
        const den = parser.ParseArg(name);
        let frac = parser.create('node', 'mfrac', [num, den]);
        if (thick !== '') {
            NodeUtil.setAttribute(frac, 'linethickness', thick);
        }
        if (left || right) {
            NodeUtil.setProperty(frac, 'withDelims', true);
            frac = ParseUtil.fixedFence(parser.configuration, left, frac, right);
        }
        if (style !== '') {
            const styleDigit = parseInt(style, 10);
            const styleAlpha = ['D', 'T', 'S', 'SS'][styleDigit];
            if (styleAlpha == null) {
                throw new TexError('BadMathStyleFor', 'Bad math style for %1', parser.currentCS);
            }
            frac = parser.create('node', 'mstyle', [frac]);
            if (styleAlpha === 'D') {
                NodeUtil.setProperties(frac, { displaystyle: true, scriptlevel: 0 });
            }
            else {
                NodeUtil.setProperties(frac, {
                    displaystyle: false,
                    scriptlevel: styleDigit - 1,
                });
            }
        }
        parser.Push(frac);
    },
    HandleTag(parser, name) {
        if (!parser.tags.currentTag.taggable && parser.tags.env) {
            throw new TexError('CommandNotAllowedInEnv', '%1 not allowed in %2 environment', parser.currentCS, parser.tags.env);
        }
        if (parser.tags.currentTag.tag) {
            throw new TexError('MultipleCommand', 'Multiple %1', parser.currentCS);
        }
        const star = parser.GetStar();
        const tagId = UnitUtil.trimSpaces(parser.GetArgument(name));
        parser.tags.tag(tagId, star);
        parser.Push(parser.itemFactory.create('null'));
    },
    HandleNoTag: BaseMethods.HandleNoTag,
    HandleRef: BaseMethods.HandleRef,
    Macro: BaseMethods.Macro,
    Accent: BaseMethods.Accent,
    Tilde: BaseMethods.Tilde,
    Array: BaseMethods.Array,
    Spacer: BaseMethods.Spacer,
    NamedOp: BaseMethods.NamedOp,
    EqnArray: BaseMethods.EqnArray,
    Equation: BaseMethods.Equation,
};
//# sourceMappingURL=AmsMethods.js.map