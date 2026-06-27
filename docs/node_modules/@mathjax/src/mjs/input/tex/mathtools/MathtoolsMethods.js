import { ParseUtil } from '../ParseUtil.js';
import { UnitUtil } from '../UnitUtil.js';
import { AmsMethods } from '../ams/AmsMethods.js';
import BaseMethods from '../base/BaseMethods.js';
import TexParser from '../TexParser.js';
import TexError from '../TexError.js';
import NodeUtil from '../NodeUtil.js';
import { TEXCLASS } from '../../../core/MmlTree/MmlNode.js';
import { length2em, em } from '../../../util/lengths.js';
import { lookup } from '../../../util/Options.js';
import { HandlerType } from '../HandlerTypes.js';
import { Macro } from '../Token.js';
import { NewcommandUtil, NewcommandTables, } from '../newcommand/NewcommandUtil.js';
import NewcommandMethods from '../newcommand/NewcommandMethods.js';
import { PrioritizedList } from '../../../util/PrioritizedList.js';
import { MathtoolsUtil } from './MathtoolsUtil.js';
export const LEGACYCONFIG = {
    [HandlerType.MACRO]: ['mathtools-legacycolonsymbols'],
};
export const LEGACYPRIORITY = PrioritizedList.DEFAULTPRIORITY - 1;
export const MathtoolsMethods = {
    MtMatrix(parser, begin, open, close) {
        const align = parser.GetBrackets(`\\begin{${begin.getName()}}`, 'c');
        return MathtoolsMethods.Array(parser, begin, open, close, align);
    },
    MtSmallMatrix(parser, begin, open, close, align) {
        if (!align) {
            align = parser.GetBrackets(`\\begin{${begin.getName()}}`, parser.options.mathtools['smallmatrix-align']);
        }
        return MathtoolsMethods.Array(parser, begin, open, close, align, UnitUtil.em(1 / 3), '.2em', 'S', 1);
    },
    MtMultlined(parser, begin) {
        const name = `\\begin{${begin.getName()}}`;
        let pos = parser.options.mathtools['multlined-pos'] || 'c';
        let width = parser.options.mathtools['multlined-width'] || '';
        if (!parser.nextIsSpace()) {
            const arg = parser.GetBrackets(name, pos);
            if (arg.match(/^[ctb]$/)) {
                pos = arg;
                width = !parser.nextIsSpace() ? parser.GetBrackets(name, '') : '';
            }
            else {
                width = arg;
            }
            if (width && !UnitUtil.matchDimen(width)[0]) {
                throw new TexError('BadWidth', 'Width for %1 must be a dimension', name);
            }
        }
        parser.Push(begin);
        const item = parser.itemFactory.create('multlined', parser, begin);
        item.arraydef = {
            displaystyle: true,
            rowspacing: '.5em',
            width: width || 'auto',
            columnwidth: '100%',
        };
        return ParseUtil.setArrayAlign(item, pos);
    },
    HandleShove(parser, name, shove) {
        const top = parser.stack.Top();
        if (top.kind !== 'multline' && top.kind !== 'multlined') {
            throw new TexError('CommandInMultlined', '%1 can only appear within the multline or multlined environments', name);
        }
        if (top.Size()) {
            throw new TexError('CommandAtTheBeginingOfLine', '%1 must come at the beginning of the line', name);
        }
        top.setProperty('shove', shove);
        const shift = parser.GetBrackets(name);
        let mml = parser.ParseArg(name);
        if (shift) {
            const mrow = parser.create('node', 'mrow', []);
            const mspace = parser.create('node', 'mspace', [], { width: shift });
            if (shove === 'left') {
                mrow.appendChild(mspace);
                mrow.appendChild(mml);
            }
            else {
                mrow.appendChild(mml);
                mrow.appendChild(mspace);
            }
            mml = mrow;
        }
        parser.Push(mml);
    },
    SpreadLines(parser, begin) {
        if (parser.stack.env.closing === begin.getName()) {
            delete parser.stack.env.closing;
            const top = parser.stack.Pop();
            const mml = top.toMml();
            const spread = top.getProperty('spread');
            if (mml.isInferred) {
                for (const child of NodeUtil.getChildren(mml)) {
                    MathtoolsUtil.spreadLines(child, spread);
                }
            }
            else {
                MathtoolsUtil.spreadLines(mml, spread);
            }
            parser.Push(mml);
        }
        else {
            const spread = parser.GetDimen(`\\begin{${begin.getName()}}`);
            begin.setProperty('spread', spread);
            begin.setProperty('nestStart', true);
            ParseUtil.checkEqnEnv(parser);
            parser.Push(begin);
        }
    },
    Cases(parser, begin, open, close, style) {
        const array = parser.itemFactory
            .create('array')
            .setProperty('casesEnv', begin.getName());
        array.arraydef = {
            rowspacing: '.2em',
            columnspacing: '1em',
            columnalign: 'left',
        };
        if (style === 'D') {
            array.arraydef.displaystyle = true;
        }
        array.setProperties({ open, close });
        parser.Push(begin);
        return array;
    },
    MathLap(parser, name, pos, cramped) {
        const style = parser.GetBrackets(name, '').trim();
        const mml = parser.create('node', 'mstyle', [
            parser.create('node', 'mpadded', [parser.ParseArg(name)], Object.assign({ width: 0 }, (pos === 'r'
                ? {}
                : { lspace: pos === 'l' ? '-1width' : '-.5width' }))),
        ], { 'data-cramped': cramped });
        MathtoolsUtil.setDisplayLevel(mml, style);
        parser.Push(parser.create('node', 'TeXAtom', [mml]));
    },
    Cramped(parser, name) {
        const style = parser.GetBrackets(name, '').trim();
        const arg = parser.ParseArg(name);
        const mml = parser.create('node', 'mstyle', [arg], {
            'data-cramped': true,
        });
        MathtoolsUtil.setDisplayLevel(mml, style);
        parser.Push(mml);
    },
    MtLap(parser, name, pos) {
        const content = ParseUtil.internalMath(parser, parser.GetArgument(name), 0);
        const mml = parser.create('node', 'mpadded', content, { width: 0 });
        if (pos !== 'r') {
            NodeUtil.setAttribute(mml, 'lspace', pos === 'l' ? '-1width' : '-.5width');
        }
        parser.Push(mml);
    },
    MathMakeBox(parser, name) {
        const width = parser.GetBrackets(name);
        const pos = parser.GetBrackets(name, 'c');
        const mml = parser.create('node', 'mpadded', [parser.ParseArg(name)]);
        if (width) {
            NodeUtil.setAttribute(mml, 'width', width);
        }
        const align = lookup(pos.toLowerCase(), { c: 'center', r: 'right' }, '');
        if (align) {
            NodeUtil.setAttribute(mml, 'data-align', align);
        }
        if (pos.toLowerCase() !== pos) {
            NodeUtil.setAttribute(mml, 'data-overflow', 'linebreak');
        }
        parser.Push(mml);
    },
    MathMBox(parser, name) {
        parser.Push(parser.create('node', 'mrow', [parser.ParseArg(name)]));
    },
    UnderOverBracket(parser, name) {
        const thickness = length2em(parser.GetBrackets(name, '.1em'), 0.1);
        const height = parser.GetBrackets(name, '.2em');
        const arg = parser.GetArgument(name);
        const [pos, accent, border] = name.charAt(1) === 'o'
            ? ['over', 'accent', 'bottom']
            : ['under', 'accentunder', 'top'];
        const t = em(thickness);
        const base = new TexParser(arg, parser.stack.env, parser.configuration).mml();
        const copy = new TexParser(arg, parser.stack.env, parser.configuration).mml();
        const script = parser.create('node', 'mpadded', [parser.create('node', 'mphantom', [copy])], {
            style: `border: ${t} solid; border-${border}: none`,
            height: height,
            depth: 0,
        });
        const node = ParseUtil.underOver(parser, base, script, pos, true);
        const munderover = NodeUtil.getChildAt(NodeUtil.getChildAt(node, 0), 0);
        NodeUtil.setAttribute(munderover, accent, true);
        parser.Push(node);
    },
    Aboxed(parser, name, box = 'boxed', math = true) {
        const top = MathtoolsUtil.checkAlignment(parser, name);
        if (top.row.length % 2 === 1) {
            top.row.push(parser.create('node', 'mtd', []));
        }
        const arg = parser.GetArgument(name);
        const rest = parser.string.substring(parser.i);
        parser.string = arg + '&&\\endAboxed';
        parser.i = 0;
        const left = parser.GetUpTo(name, '&');
        const right = parser.GetUpTo(name, '&');
        parser.GetUpTo(name, '\\endAboxed');
        const [bmath, emath] = math ? ['', ''] : ['$\\displaystyle{', '}$'];
        const tex = ParseUtil.substituteArgs(parser, [left, right], `\\rlap{\\${box}{${bmath}#1{}#2${emath}}}` +
            '\\kern.267em\\phantom{#1}&\\phantom{{}#2}\\kern.267em');
        parser.string = tex + rest;
        parser.i = 0;
    },
    MakeAboxedCommand(parser, name) {
        const star = parser.GetStar();
        const cs = NewcommandUtil.GetCSname(parser, name);
        const box = NewcommandUtil.GetCSname(parser, name + '\\' + cs);
        const handlers = parser.configuration.handlers;
        if (handlers.get(HandlerType.MACRO).lookup(cs)) {
            throw new TexError('AlreadyDefined', '%1 is already defined', '\\' + cs);
        }
        const handler = handlers.retrieve(NewcommandTables.NEW_COMMAND);
        handler.add(cs, new Macro(cs, MathtoolsMethods.Aboxed, [box, star]));
        parser.Push(parser.itemFactory.create('null'));
    },
    ArrowBetweenLines(parser, name) {
        const top = MathtoolsUtil.checkAlignment(parser, name);
        if (top.Size() || top.row.length) {
            throw new TexError('BetweenLines', '%1 must be on a row by itself', name);
        }
        const star = parser.GetStar();
        const symbol = parser.GetBrackets(name, '\\Updownarrow');
        if (star) {
            top.EndEntry();
            top.EndEntry();
        }
        const tex = star ? '\\quad' + symbol : symbol + '\\quad';
        const mml = new TexParser(tex, parser.stack.env, parser.configuration).mml();
        parser.Push(mml);
        top.EndEntry();
        top.EndRow();
    },
    VDotsWithin(parser, name) {
        const arg = '\\mmlToken{mi}{}' + parser.GetArgument(name) + '\\mmlToken{mi}{}';
        const base = new TexParser(arg, parser.stack.env, parser.configuration).mml();
        const mml = parser.create('node', 'mpadded', [
            parser.create('node', 'mpadded', [parser.create('node', 'mo', [parser.create('text', '\u22EE')])], { width: 0, lspace: '-.5width' }),
            parser.create('node', 'mphantom', [base]),
        ], {
            lspace: '.5width',
        });
        parser.Push(mml);
    },
    ShortVDotsWithin(parser, _name) {
        const top = parser.stack.Top();
        const star = parser.GetStar();
        if (top.EndEntry) {
            MathtoolsMethods.FlushSpaceAbove(parser, '\\MTFlushSpaceAbove');
            if (!star) {
                top.EndEntry();
            }
        }
        MathtoolsMethods.VDotsWithin(parser, '\\vdotswithin');
        if (top.EndEntry) {
            if (star) {
                top.EndEntry();
            }
            MathtoolsMethods.FlushSpaceBelow(parser, '\\MTFlushSpaceBelow');
        }
    },
    FlushSpaceAbove(parser, name) {
        const top = MathtoolsUtil.checkAlignment(parser, name);
        if (top.table) {
            top.setProperty('flushspaceabove', top.table.length);
            top.addRowSpacing('-' + parser.options.mathtools['shortvdotsadjustabove']);
        }
    },
    FlushSpaceBelow(parser, name) {
        const top = MathtoolsUtil.checkAlignment(parser, name);
        if (top.table) {
            if (top.Size()) {
                top.EndEntry();
            }
            top.EndRow();
            top.addRowSpacing('-' + parser.options.mathtools['shortvdotsadjustbelow']);
        }
    },
    PairedDelimiters(parser, name, open, close, body = '#1', n = 1, pre = '', post = '') {
        const star = parser.GetStar();
        const size = star ? '' : parser.GetBrackets(name);
        const [left, right, after] = star
            ? ['\\mathopen{\\left', '\\right', '}\\mathclose{}']
            : size
                ? [size + 'l', size + 'r', '']
                : ['', '', ''];
        const delim = star ? '\\middle' : size || '';
        if (n) {
            const args = [];
            for (let i = args.length; i < n; i++) {
                args.push(parser.GetArgument(name));
            }
            pre = ParseUtil.substituteArgs(parser, args, pre);
            body = ParseUtil.substituteArgs(parser, args, body);
            post = ParseUtil.substituteArgs(parser, args, post);
        }
        body = body.replace(/\\delimsize/g, delim);
        parser.string = [
            pre,
            left,
            open,
            body,
            right,
            close,
            after,
            post,
            parser.string.substring(parser.i),
        ].reduce((s, part) => ParseUtil.addArgs(parser, s, part), '');
        parser.i = 0;
        ParseUtil.checkMaxMacros(parser);
    },
    DeclarePairedDelimiter(parser, name) {
        const cs = NewcommandUtil.GetCsNameArgument(parser, name);
        const open = parser.GetArgument(name);
        const close = parser.GetArgument(name);
        MathtoolsUtil.addPairedDelims(parser, cs, [open, close]);
        parser.Push(parser.itemFactory.create('null'));
    },
    DeclarePairedDelimiterX(parser, name) {
        const cs = NewcommandUtil.GetCsNameArgument(parser, name);
        const n = NewcommandUtil.GetArgCount(parser, name);
        const open = parser.GetArgument(name);
        const close = parser.GetArgument(name);
        const body = parser.GetArgument(name);
        MathtoolsUtil.addPairedDelims(parser, cs, [open, close, body, n]);
        parser.Push(parser.itemFactory.create('null'));
    },
    DeclarePairedDelimiterXPP(parser, name) {
        const cs = NewcommandUtil.GetCsNameArgument(parser, name);
        const n = NewcommandUtil.GetArgCount(parser, name);
        const pre = parser.GetArgument(name);
        const open = parser.GetArgument(name);
        const close = parser.GetArgument(name);
        const post = parser.GetArgument(name);
        const body = parser.GetArgument(name);
        MathtoolsUtil.addPairedDelims(parser, cs, [
            open,
            close,
            body,
            n,
            pre,
            post,
        ]);
        parser.Push(parser.itemFactory.create('null'));
    },
    CenterColon(parser, _name, center, force = false, thin = false) {
        const options = parser.options.mathtools;
        let mml = parser.create('token', 'mo', {}, ':');
        if (center && (options['centercolon'] || force)) {
            const dy = options['centercolon-offset'];
            mml = parser.create('node', 'mpadded', [mml], Object.assign({ voffset: dy, height: `+${dy}`, depth: `-${dy}` }, (thin
                ? { width: options['thincolon-dw'], lspace: options['thincolon-dx'] }
                : {})));
        }
        parser.Push(mml);
    },
    Relation(parser, _name, tex, unicode) {
        const options = parser.options.mathtools;
        if (options['use-unicode'] && unicode) {
            parser.Push(parser.create('token', 'mo', { texClass: TEXCLASS.REL }, unicode));
        }
        else {
            tex =
                '\\mathrel{' +
                    tex.replace(/:/g, '\\MTThinColon').replace(/-/g, '\\mathrel{-}') +
                    '}';
            parser.string = ParseUtil.addArgs(parser, tex, parser.string.substring(parser.i));
            parser.i = 0;
        }
    },
    NArrow(parser, _name, c, dy) {
        parser.Push(parser.create('node', 'TeXAtom', [
            parser.create('token', 'mtext', {}, c),
            parser.create('node', 'mpadded', [
                parser.create('node', 'mpadded', [
                    parser.create('node', 'menclose', [
                        parser.create('node', 'mspace', [], {
                            height: '.2em',
                            depth: 0,
                            width: '.4em',
                        }),
                    ], {
                        notation: 'updiagonalstrike',
                        'data-thickness': '.05em',
                        'data-padding': 0,
                    }),
                ], { width: 0, lspace: '-.5width', voffset: dy }),
                parser.create('node', 'mphantom', [
                    parser.create('token', 'mtext', {}, c),
                ]),
            ], { width: 0, lspace: '-.5width' }),
        ], { texClass: TEXCLASS.REL }));
    },
    SplitFrac(parser, name, display) {
        const num = parser.ParseArg(name);
        const den = parser.ParseArg(name);
        parser.Push(parser.create('node', 'mstyle', [
            parser.create('node', 'mfrac', [
                parser.create('node', 'mstyle', [
                    num,
                    parser.create('token', 'mi'),
                    parser.create('token', 'mspace', { width: '1em' }),
                ], { scriptlevel: 0 }),
                parser.create('node', 'mstyle', [
                    parser.create('token', 'mspace', { width: '1em' }),
                    parser.create('token', 'mi'),
                    den,
                ], { scriptlevel: 0 }),
            ], { linethickness: 0, numalign: 'left', denomalign: 'right' }),
        ], { displaystyle: display, scriptlevel: 0 }));
    },
    XMathStrut(parser, name) {
        let dd = parser.GetBrackets(name);
        let dh = parser.GetArgument(name);
        dh = MathtoolsUtil.plusOrMinus(name, dh);
        dd = MathtoolsUtil.plusOrMinus(name, dd || dh);
        parser.Push(parser.create('node', 'TeXAtom', [
            parser.create('node', 'mpadded', [
                parser.create('node', 'mphantom', [
                    parser.create('token', 'mo', { stretchy: false }, '('),
                ]),
            ], { width: 0, height: dh + 'height', depth: dd + 'depth' }),
        ], { texClass: TEXCLASS.ORD }));
    },
    Prescript(parser, name) {
        const sup = MathtoolsUtil.getScript(parser, name, 'sup');
        const sub = MathtoolsUtil.getScript(parser, name, 'sub');
        const base = MathtoolsUtil.getScript(parser, name, 'arg');
        if (NodeUtil.isType(sup, 'none') && NodeUtil.isType(sub, 'none')) {
            parser.Push(base);
            return;
        }
        const mml = parser.create('node', 'mmultiscripts', [base]);
        NodeUtil.getChildren(mml).push(null, null);
        NodeUtil.appendChildren(mml, [
            parser.create('node', 'mprescripts'),
            sub,
            sup,
        ]);
        mml.setProperty('fixPrescript', true);
        parser.Push(mml);
    },
    NewTagForm(parser, name, renew = false) {
        const tags = parser.tags;
        if (!('mtFormats' in tags)) {
            throw new TexError('TagsNotMT', '%1 can only be used with ams or mathtools tags', name);
        }
        const id = parser.GetArgument(name).trim();
        if (!id) {
            throw new TexError('InvalidTagFormID', "Tag form name can't be empty");
        }
        const format = parser.GetBrackets(name, '');
        const left = parser.GetArgument(name);
        const right = parser.GetArgument(name);
        if (!renew && tags.mtFormats.has(id)) {
            throw new TexError('DuplicateTagForm', 'Duplicate tag form: %1', id);
        }
        tags.mtFormats.set(id, [left, right, format]);
        parser.Push(parser.itemFactory.create('null'));
    },
    UseTagForm(parser, name) {
        const tags = parser.tags;
        if (!('mtFormats' in tags)) {
            throw new TexError('TagsNotMT', '%1 can only be used with ams or mathtools tags', name);
        }
        const id = parser.GetArgument(name).trim();
        if (!id) {
            tags.mtCurrent = null;
            parser.Push(parser.itemFactory.create('null'));
            return;
        }
        if (!tags.mtFormats.has(id)) {
            throw new TexError('UndefinedTagForm', 'Undefined tag form: %1', id);
        }
        tags.mtCurrent = tags.mtFormats.get(id);
        parser.Push(parser.itemFactory.create('null'));
    },
    SetOptions(parser, name) {
        const options = parser.options.mathtools;
        if (!options['allow-mathtoolsset']) {
            throw new TexError('ForbiddenMathtoolsSet', '%1 is disabled', name);
        }
        const allowed = {};
        Object.keys(options).forEach((id) => {
            if (id !== 'pariedDelimiters' &&
                id !== 'tagforms' &&
                id !== 'allow-mathtoolsset') {
                allowed[id] = 1;
            }
        });
        const args = parser.GetArgument(name);
        const keys = ParseUtil.keyvalOptions(args, allowed, true);
        for (const id of Object.keys(keys)) {
            if (id === 'legacycolonsymbols' && options[id] !== keys[id]) {
                if (options[id]) {
                    parser.configuration.handlers.remove(LEGACYCONFIG, {});
                }
                else {
                    parser.configuration.handlers.add(LEGACYCONFIG, {}, LEGACYPRIORITY);
                }
            }
            options[id] = keys[id];
        }
        parser.Push(parser.itemFactory.create('null'));
    },
    Array: BaseMethods.Array,
    Macro: BaseMethods.Macro,
    xArrow: AmsMethods.xArrow,
    HandleRef: AmsMethods.HandleRef,
    AmsEqnArray: AmsMethods.AmsEqnArray,
    MacroWithTemplate: NewcommandMethods.MacroWithTemplate,
};
//# sourceMappingURL=MathtoolsMethods.js.map