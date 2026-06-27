import { TEXCLASS } from '../../core/MmlTree/MmlNode.js';
import NodeUtil from './NodeUtil.js';
import TexParser from './TexParser.js';
import TexError from './TexError.js';
import { entities } from '../../util/Entities.js';
import { UnitUtil } from './UnitUtil.js';
export class KeyValueDef {
    static oneof(...values) {
        return new this('string', (value) => values.includes(value), (value) => value);
    }
    constructor(name, verify, convert) {
        this.name = name;
        this.verify = verify;
        this.convert = convert;
    }
}
export const KeyValueTypes = {
    boolean: new KeyValueDef('boolean', (value) => value === 'true' || value === 'false', (value) => value === 'true'),
    number: new KeyValueDef('number', (value) => !!value.match(/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$/), (value) => parseFloat(value)),
    integer: new KeyValueDef('integer', (value) => !!value.match(/^[-+]?\d+$/), (value) => parseInt(value)),
    string: new KeyValueDef('string', (_value) => true, (value) => value),
    dimen: new KeyValueDef('dimen', (value) => UnitUtil.matchDimen(value)[0] !== null, (value) => value),
};
function readKeyval(text, l3keys = false) {
    const options = {};
    let rest = text;
    let end, key, val;
    let dropBrace = true;
    while (rest) {
        [key, end, rest] = readValue(rest, ['=', ','], l3keys, dropBrace);
        dropBrace = false;
        if (end === '=') {
            [val, end, rest] = readValue(rest, [','], l3keys);
            val = val === 'false' || val === 'true' ? JSON.parse(val) : val;
            options[key] = val;
        }
        else if (key) {
            options[key] = true;
        }
    }
    return options;
}
function removeBraces(text, count) {
    if (count === 0) {
        return text
            .replace(/^\s+/, '')
            .replace(/([^\\\s]|^)((?:\\\\)*(?:\\\s)?)?\s+$/, '$1$2');
    }
    while (count > 0) {
        text = text.trim().slice(1, -1);
        count--;
    }
    return text;
}
function readValue(text, end, l3keys = false, dropBrace = false) {
    const length = text.length;
    let braces = 0;
    let value = '';
    let index = 0;
    let start = 0;
    let countBraces = true;
    while (index < length) {
        const c = text[index++];
        switch (c) {
            case '\\':
                value += c + (text[index++] || '');
                countBraces = false;
                continue;
            case ' ':
                break;
            case '{':
                if (countBraces) {
                    start++;
                }
                braces++;
                break;
            case '}':
                if (!braces) {
                    throw new TexError('ExtraCloseMissingOpen', 'Extra close brace or missing open brace');
                }
                braces--;
                countBraces = false;
                break;
            default:
                if (!braces && end.includes(c)) {
                    return [
                        removeBraces(value, l3keys ? Math.min(1, start) : start),
                        c,
                        text.slice(index),
                    ];
                }
                if (start > braces) {
                    start = braces;
                }
                countBraces = false;
        }
        value += c;
    }
    if (braces) {
        throw new TexError('ExtraOpenMissingClose', 'Extra open brace or missing close brace');
    }
    return dropBrace && start
        ? ['', '', removeBraces(value, 1)]
        : [
            removeBraces(value, l3keys ? Math.min(1, start) : start),
            '',
            text.slice(index),
        ];
}
export const ParseUtil = {
    cols(...W) {
        return W.map((n) => UnitUtil.em(n)).join(' ');
    },
    fenced(configuration, open, mml, close, big = '', color = '') {
        const nf = configuration.nodeFactory;
        const mrow = nf.create('node', 'mrow', [], {
            open: open,
            close: close,
            texClass: TEXCLASS.INNER,
        });
        let mo;
        if (big) {
            mo = new TexParser('\\' + big + 'l' + open, configuration.parser.stack.env, configuration).mml();
        }
        else {
            const openNode = nf.create('text', open);
            mo = nf.create('node', 'mo', [], {
                fence: true,
                stretchy: true,
                symmetric: true,
                texClass: TEXCLASS.OPEN,
            }, openNode);
        }
        NodeUtil.appendChildren(mrow, [mo, mml]);
        if (big) {
            mo = new TexParser('\\' + big + 'r' + close, configuration.parser.stack.env, configuration).mml();
        }
        else {
            const closeNode = nf.create('text', close);
            mo = nf.create('node', 'mo', [], {
                fence: true,
                stretchy: true,
                symmetric: true,
                texClass: TEXCLASS.CLOSE,
            }, closeNode);
        }
        if (color) {
            mo.attributes.set('mathcolor', color);
        }
        NodeUtil.appendChildren(mrow, [mo]);
        return mrow;
    },
    fixedFence(configuration, open, mml, close) {
        const mrow = configuration.nodeFactory.create('node', 'mrow', [], {
            open: open,
            close: close,
            texClass: TEXCLASS.ORD,
        });
        if (open) {
            NodeUtil.appendChildren(mrow, [
                ParseUtil.mathPalette(configuration, open, 'l'),
            ]);
        }
        if (NodeUtil.isType(mml, 'mrow')) {
            NodeUtil.appendChildren(mrow, NodeUtil.getChildren(mml));
        }
        else {
            NodeUtil.appendChildren(mrow, [mml]);
        }
        if (close) {
            NodeUtil.appendChildren(mrow, [
                ParseUtil.mathPalette(configuration, close, 'r'),
            ]);
        }
        return mrow;
    },
    mathPalette(configuration, fence, side) {
        if (fence === '{' || fence === '}') {
            fence = '\\' + fence;
        }
        const D = '{\\bigg' + side + ' ' + fence + '}';
        const T = '{\\big' + side + ' ' + fence + '}';
        return new TexParser('\\mathchoice' + D + T + T + T, {}, configuration).mml();
    },
    fixInitialMO(configuration, nodes) {
        for (let i = 0, m = nodes.length; i < m; i++) {
            const child = nodes[i];
            if (child &&
                !NodeUtil.isType(child, 'mspace') &&
                (!NodeUtil.isType(child, 'TeXAtom') ||
                    (NodeUtil.getChildren(child)[0] &&
                        NodeUtil.getChildren(NodeUtil.getChildren(child)[0]).length))) {
                if (NodeUtil.isEmbellished(child) ||
                    (NodeUtil.isType(child, 'TeXAtom') &&
                        NodeUtil.getTexClass(child) === TEXCLASS.REL)) {
                    const mi = configuration.nodeFactory.create('node', 'mi');
                    nodes.unshift(mi);
                }
                break;
            }
        }
    },
    internalMath(parser, text, level, font) {
        text = text.replace(/ +/g, ' ');
        if (parser.configuration.options.internalMath) {
            return parser.configuration.options.internalMath(parser, text, level, font);
        }
        const mathvariant = font || parser.stack.env.font;
        const def = mathvariant ? { mathvariant } : {};
        let mml = [], i = 0, k = 0, c, node, match = '', braces = 0;
        if (text.match(/\\?[${}\\]|\\\(|\\(?:eq)?ref\s*\{|\\U/)) {
            while (i < text.length) {
                c = text.charAt(i++);
                if (c === '$') {
                    if (match === '$' && braces === 0) {
                        node = parser.create('node', 'TeXAtom', [
                            new TexParser(text.slice(k, i - 1), {}, parser.configuration).mml(),
                        ]);
                        mml.push(node);
                        match = '';
                        k = i;
                    }
                    else if (match === '') {
                        if (k < i - 1) {
                            mml.push(ParseUtil.internalText(parser, text.slice(k, i - 1), def));
                        }
                        match = '$';
                        k = i;
                    }
                }
                else if (c === '{' && match !== '') {
                    braces++;
                }
                else if (c === '}') {
                    if (match === '}' && braces === 0) {
                        const atom = new TexParser(text.slice(k, i), {}, parser.configuration).mml();
                        node = parser.create('node', 'TeXAtom', [atom], def);
                        mml.push(node);
                        match = '';
                        k = i;
                    }
                    else if (match !== '') {
                        if (braces) {
                            braces--;
                        }
                    }
                }
                else if (c === '\\') {
                    if (match === '' && text.substring(i).match(/^(eq)?ref\s*\{/)) {
                        const len = RegExp['$&'].length;
                        if (k < i - 1) {
                            mml.push(ParseUtil.internalText(parser, text.slice(k, i - 1), def));
                        }
                        match = '}';
                        k = i - 1;
                        i += len;
                    }
                    else {
                        c = text.charAt(i++);
                        if (c === '(' && match === '') {
                            if (k < i - 2) {
                                mml.push(ParseUtil.internalText(parser, text.slice(k, i - 2), def));
                            }
                            match = ')';
                            k = i;
                        }
                        else if (c === ')' && match === ')' && braces === 0) {
                            node = parser.create('node', 'TeXAtom', [
                                new TexParser(text.slice(k, i - 2), {}, parser.configuration).mml(),
                            ]);
                            mml.push(node);
                            match = '';
                            k = i;
                        }
                        else if (c.match(/[${}\\]/) && match === '') {
                            i--;
                            text = text.substring(0, i - 1) + text.substring(i);
                        }
                        else if (c === 'U') {
                            const arg = text
                                .substring(i)
                                .match(/^\s*(?:([0-9A-F])|\{\s*([0-9A-F]+)\s*\})/);
                            if (!arg) {
                                throw new TexError('BadRawUnicode', 'Argument to %1 must a hexadecimal number with 1 to 6 digits', '\\U');
                            }
                            const c = String.fromCodePoint(parseInt(arg[1] || arg[2], 16));
                            text =
                                text.substring(0, i - 2) +
                                    c +
                                    text.substring(i + arg[0].length);
                            i = i - 2 + c.length;
                        }
                    }
                }
            }
            if (match !== '') {
                throw new TexError('MathNotTerminated', 'Math mode is not properly terminated');
            }
        }
        if (k < text.length) {
            mml.push(ParseUtil.internalText(parser, text.slice(k), def));
        }
        if (level != null) {
            mml = [
                parser.create('node', 'mstyle', mml, {
                    displaystyle: false,
                    scriptlevel: level,
                }),
            ];
        }
        else if (mml.length > 1) {
            mml = [parser.create('node', 'mrow', mml)];
        }
        return mml;
    },
    internalText(parser, text, def) {
        text = text
            .replace(/\n+/g, ' ')
            .replace(/^ +/, entities.nbsp)
            .replace(/ +$/, entities.nbsp);
        const textNode = parser.create('text', text);
        return parser.create('node', 'mtext', [], def, textNode);
    },
    underOver(parser, base, script, pos, stack) {
        ParseUtil.checkMovableLimits(base);
        if (NodeUtil.isType(base, 'munderover') && NodeUtil.isEmbellished(base)) {
            NodeUtil.setProperties(NodeUtil.getCoreMO(base), {
                lspace: 0,
                rspace: 0,
            });
            const mo = parser.create('node', 'mo', [], { rspace: 0 });
            base = parser.create('node', 'mrow', [mo, base]);
        }
        const mml = parser.create('node', 'munderover', [base]);
        NodeUtil.setChild(mml, pos === 'over' ? mml.over : mml.under, script);
        let node = mml;
        if (stack) {
            node = parser.create('node', 'TeXAtom', [
                parser.create('node', 'mstyle', [mml], {
                    displaystyle: true,
                    scriptlevel: 0,
                }),
            ], {
                texClass: TEXCLASS.OP,
                movesupsub: true,
            });
        }
        NodeUtil.setProperty(node, 'subsupOK', true);
        return node;
    },
    checkMovableLimits(base) {
        const symbol = NodeUtil.isType(base, 'mo') ? NodeUtil.getForm(base) : null;
        if (NodeUtil.getProperty(base, 'movablelimits') ||
            (symbol && symbol[3] && symbol[3].movablelimits)) {
            NodeUtil.setProperties(base, { movablelimits: false });
        }
    },
    setArrayAlign(array, align, parser) {
        if (!parser) {
            align = UnitUtil.trimSpaces(align || '');
        }
        if (align === 't') {
            array.arraydef.align = 'baseline 1';
        }
        else if (align === 'b') {
            array.arraydef.align = 'baseline -1';
        }
        else if (align === 'c') {
            array.arraydef.align = 'axis';
        }
        else if (align) {
            if (parser) {
                parser.string = `[${align}]` + parser.string.slice(parser.i);
                parser.i = 0;
            }
            else {
                array.arraydef.align = align;
            }
        }
        return array;
    },
    substituteArgs(parser, args, str) {
        let text = '';
        let newstring = '';
        let i = 0;
        while (i < str.length) {
            let c = str.charAt(i++);
            if (c === '\\') {
                text += c + str.charAt(i++);
            }
            else if (c === '#') {
                c = str.charAt(i++);
                if (c === '#') {
                    text += c;
                }
                else {
                    if (!c.match(/[1-9]/) || parseInt(c, 10) > args.length) {
                        throw new TexError('IllegalMacroParam', 'Illegal macro parameter reference');
                    }
                    newstring = ParseUtil.addArgs(parser, ParseUtil.addArgs(parser, newstring, text), args[parseInt(c, 10) - 1]);
                    text = '';
                }
            }
            else {
                text += c;
            }
        }
        return ParseUtil.addArgs(parser, newstring, text);
    },
    addArgs(parser, s1, s2) {
        if (s2.match(/^[a-z]/i) && s1.match(/(^|[^\\])(\\\\)*\\[a-z]+$/i)) {
            s1 += ' ';
        }
        if (s1.length + s2.length > parser.configuration.options['maxBuffer']) {
            throw new TexError('MaxBufferSize', 'MathJax internal buffer size exceeded; is there a' +
                ' recursive macro call?');
        }
        return s1 + s2;
    },
    checkMaxMacros(parser, isMacro = true) {
        if (++parser.macroCount <= parser.configuration.options['maxMacros']) {
            return;
        }
        if (isMacro) {
            throw new TexError('MaxMacroSub1', 'MathJax maximum macro substitution count exceeded; ' +
                'is here a recursive macro call?');
        }
        else {
            throw new TexError('MaxMacroSub2', 'MathJax maximum substitution count exceeded; ' +
                'is there a recursive latex environment?');
        }
    },
    checkEqnEnv(parser, nestable = true) {
        const top = parser.stack.Top();
        const first = top.First;
        if ((top.getProperty('nestable') && nestable && !first) ||
            top.getProperty('nestStart')) {
            return;
        }
        if (!top.isKind('start') || first) {
            throw new TexError('ErroneousNestingEq', 'Erroneous nesting of equation structures');
        }
    },
    copyNode(node, parser) {
        const tree = node.copy();
        const options = parser.configuration;
        tree.walkTree((n) => {
            options.addNode(n.kind, n);
            const lists = (n.getProperty('in-lists') || '').split(/,/);
            for (const list of lists) {
                if (list) {
                    options.addNode(list, n);
                }
            }
        });
        return tree;
    },
    mmlFilterAttribute(_parser, _name, value) {
        return value;
    },
    getFontDef(parser) {
        const font = parser.stack.env['font'];
        return font ? { mathvariant: font } : {};
    },
    keyvalOptions(attrib, allowed = null, error = false, l3keys = false) {
        const def = readKeyval(attrib, l3keys);
        if (allowed) {
            for (const key of Object.keys(def)) {
                if (Object.hasOwn(allowed, key)) {
                    if (allowed[key] instanceof KeyValueDef) {
                        const type = allowed[key];
                        const value = String(def[key]);
                        if (!type.verify(value)) {
                            throw new TexError('InvalidValue', "Value for key '%1' is not of the expected type", key);
                        }
                        def[key] = type.convert(value);
                    }
                }
                else {
                    if (error) {
                        throw new TexError('InvalidOption', 'Invalid option: %1', key);
                    }
                    delete def[key];
                }
            }
        }
        return def;
    },
    isLatinOrGreekChar(c) {
        return !!c.normalize('NFD').match(/[a-zA-Z\u0370-\u03F0]/);
    },
};
//# sourceMappingURL=ParseUtil.js.map