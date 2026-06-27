import { HandlerType } from './HandlerTypes.js';
import { UnitUtil } from './UnitUtil.js';
import Stack from './Stack.js';
import TexError from './TexError.js';
import { AbstractMmlNode } from '../../core/MmlTree/MmlNode.js';
import { BaseItem } from './StackItem.js';
import { TexConstant } from './TexConstants.js';
export default class TexParser {
    constructor(_string, env, configuration) {
        this._string = _string;
        this.configuration = configuration;
        this.macroCount = 0;
        this.i = 0;
        this.currentCS = '';
        this.saveI = 0;
        const inner = Object.hasOwn(env, 'isInner');
        const isInner = env['isInner'];
        delete env['isInner'];
        let ENV;
        if (env) {
            ENV = {};
            for (const id of Object.keys(env)) {
                ENV[id] = env[id];
            }
        }
        this.configuration.pushParser(this);
        this.stack = new Stack(this.itemFactory, ENV, inner ? isInner : true);
        this.Parse();
        this.Push(this.itemFactory.create('stop'));
        this.stack.env = ENV;
    }
    get options() {
        return this.configuration.options;
    }
    get itemFactory() {
        return this.configuration.itemFactory;
    }
    get tags() {
        return this.configuration.tags;
    }
    set string(str) {
        this._string = str;
    }
    get string() {
        return this._string;
    }
    parse(kind, input) {
        const i = this.saveI;
        this.saveI = this.i - (kind === 'character' && input[1] !== '&' ? 1 : 0);
        const result = this.configuration.handlers.get(kind).parse(input);
        if (kind !== 'macro') {
            this.updateResult(input[1], i);
        }
        this.saveI = i;
        return result;
    }
    lookup(kind, token) {
        return this.configuration.handlers.get(kind).lookup(token);
    }
    contains(kind, token) {
        return this.configuration.handlers.get(kind).contains(token);
    }
    toString() {
        let str = '';
        for (const config of Array.from(this.configuration.handlers.keys())) {
            str +=
                config +
                    ': ' +
                    this.configuration.handlers.get(config) +
                    '\n';
        }
        return str;
    }
    Parse() {
        let c;
        while (this.i < this.string.length) {
            c = this.getCodePoint();
            this.i += c.length;
            this.parse(HandlerType.CHARACTER, [this, c]);
        }
    }
    Push(arg) {
        if (arg instanceof BaseItem) {
            arg.startI = this.saveI;
            arg.stopI = this.i;
            arg.startStr = this.string;
        }
        if (arg instanceof AbstractMmlNode && arg.isInferred) {
            this.PushAll(arg.childNodes);
        }
        else {
            this.stack.Push(arg);
        }
    }
    PushAll(args) {
        for (const arg of args) {
            this.stack.Push(arg);
        }
    }
    mml() {
        if (!this.stack.Top().isKind('mml')) {
            return null;
        }
        const node = this.stack.Top().First;
        this.configuration.popParser();
        const latex = this.trimTex(this.string);
        if (latex) {
            node.attributes.set(TexConstant.Attr.LATEX, latex);
        }
        return node;
    }
    convertDelimiter(c) {
        var _a;
        const token = this.lookup(HandlerType.DELIMITER, c);
        return (_a = token === null || token === void 0 ? void 0 : token.char) !== null && _a !== void 0 ? _a : null;
    }
    getCodePoint() {
        const code = this.string.codePointAt(this.i);
        return code === undefined ? '' : String.fromCodePoint(code);
    }
    nextIsSpace() {
        return !!this.string.charAt(this.i).match(/\s/);
    }
    GetNext() {
        while (this.nextIsSpace()) {
            this.i++;
        }
        return this.getCodePoint();
    }
    GetCS() {
        const CS = this.string
            .slice(this.i)
            .match(/^(([a-z]+) ?|[\uD800-\uDBFF].|.)/i);
        if (CS) {
            this.i += CS[0].length;
            return CS[2] || CS[1];
        }
        else {
            this.i++;
            return ' ';
        }
    }
    GetArgument(_name, noneOK = false) {
        switch (this.GetNext()) {
            case '':
                if (!noneOK) {
                    throw new TexError('MissingArgFor', 'Missing argument for %1', this.currentCS);
                }
                return null;
            case '}':
                if (!noneOK) {
                    throw new TexError('ExtraCloseMissingOpen', 'Extra close brace or missing open brace');
                }
                return null;
            case '\\':
                this.i++;
                return '\\' + this.GetCS();
            case '{': {
                const j = ++this.i;
                let parens = 1;
                while (this.i < this.string.length) {
                    switch (this.string.charAt(this.i++)) {
                        case '\\':
                            this.i++;
                            break;
                        case '{':
                            parens++;
                            break;
                        case '}':
                            if (--parens === 0) {
                                return this.string.slice(j, this.i - 1);
                            }
                            break;
                    }
                }
                throw new TexError('MissingCloseBrace', 'Missing close brace');
            }
        }
        const c = this.getCodePoint();
        this.i += c.length;
        return c;
    }
    GetBrackets(_name, def, matchBrackets = false) {
        if (this.GetNext() !== '[') {
            return def;
        }
        const j = ++this.i;
        let braces = 0;
        let brackets = 0;
        while (this.i < this.string.length) {
            switch (this.string.charAt(this.i++)) {
                case '{':
                    braces++;
                    break;
                case '\\':
                    this.i++;
                    break;
                case '}':
                    if (braces-- <= 0) {
                        throw new TexError('ExtraCloseLooking', 'Extra close brace while looking for %1', "']'");
                    }
                    break;
                case '[':
                    if (braces === 0)
                        brackets++;
                    break;
                case ']':
                    if (braces === 0) {
                        if (!matchBrackets || brackets === 0) {
                            return this.string.slice(j, this.i - 1);
                        }
                        brackets--;
                    }
                    break;
            }
        }
        throw new TexError('MissingCloseBracket', "Could not find closing ']' for argument to %1", this.currentCS);
    }
    GetDelimiter(name, braceOK = false) {
        let c = this.GetNext();
        this.i += c.length;
        if (this.i <= this.string.length) {
            if (c === '\\') {
                c += this.GetCS();
            }
            else if (c === '{' && braceOK) {
                this.i--;
                c = this.GetArgument(name).trim();
            }
            if (this.contains(HandlerType.DELIMITER, c)) {
                return this.convertDelimiter(c);
            }
        }
        throw new TexError('MissingOrUnrecognizedDelim', 'Missing or unrecognized delimiter for %1', this.currentCS);
    }
    GetDimen(name) {
        if (this.GetNext() === '{') {
            const dimen = this.GetArgument(name);
            const [value, unit] = UnitUtil.matchDimen(dimen);
            if (value) {
                return value + unit;
            }
        }
        else {
            const dimen = this.string.slice(this.i);
            const [value, unit, length] = UnitUtil.matchDimen(dimen, true);
            if (value) {
                this.i += length;
                return value + unit;
            }
        }
        throw new TexError('MissingDimOrUnits', 'Missing dimension or its units for %1', this.currentCS);
    }
    GetUpTo(_name, token) {
        while (this.nextIsSpace()) {
            this.i++;
        }
        const j = this.i;
        let braces = 0;
        while (this.i < this.string.length) {
            const k = this.i;
            let c = this.GetNext();
            this.i += c.length;
            switch (c) {
                case '\\':
                    c += this.GetCS();
                    break;
                case '{':
                    braces++;
                    break;
                case '}':
                    if (braces === 0) {
                        throw new TexError('ExtraCloseLooking', 'Extra close brace while looking for %1', token);
                    }
                    braces--;
                    break;
            }
            if (braces === 0 && c === token) {
                return this.string.slice(j, k);
            }
        }
        throw new TexError('TokenNotFoundForCommand', 'Could not find %1 for %2', token, this.currentCS);
    }
    ParseArg(name) {
        return new TexParser(this.GetArgument(name), this.stack.env, this.configuration).mml();
    }
    ParseUpTo(name, token) {
        return new TexParser(this.GetUpTo(name, token), this.stack.env, this.configuration).mml();
    }
    GetDelimiterArg(name) {
        const c = UnitUtil.trimSpaces(this.GetArgument(name));
        if (c === '') {
            return null;
        }
        if (this.contains(HandlerType.DELIMITER, c)) {
            return c;
        }
        throw new TexError('MissingOrUnrecognizedDelim', 'Missing or unrecognized delimiter for %1', this.currentCS);
    }
    GetStar() {
        const star = this.GetNext() === '*';
        if (star) {
            this.i++;
        }
        return star;
    }
    create(kind, ...rest) {
        const node = this.configuration.nodeFactory.create(kind, ...rest);
        if (node.isToken && node.attributes.hasExplicit('mathvariant')) {
            if (node.attributes.get('mathvariant').charAt(0) === '-') {
                node.setProperty('ignore-variant', true);
            }
        }
        return node;
    }
    trimTex(tex) {
        return tex.trim() + (tex.match(/(?:^|[^\\])(?:\\\\)*\\\s+$/) ? ' ' : '');
    }
    updateResult(input, old) {
        const node = this.stack.Prev(true);
        if (!node) {
            return;
        }
        const LATEX = TexConstant.Attr.LATEX;
        const latex = node.attributes.get(LATEX);
        const existing = node.attributes.get(TexConstant.Attr.LATEXITEM);
        if (existing !== undefined) {
            if (!latex) {
                if (input === '}' || existing === '}') {
                    this.composeBraces(node);
                }
                else {
                    node.attributes.set(LATEX, existing);
                }
            }
            return;
        }
        old = old < this.saveI ? this.saveI : old;
        const str = this.trimTex(old !== this.i ? this.string.slice(old, this.i) : input);
        if (!str || str === latex || (input === '\\' && str === '\\')) {
            return;
        }
        if (str === '_' || str === '^') {
            node.setProperty('sub-sup', str);
        }
        else {
            switch (node.getProperty('sub-sup')) {
                case '^':
                    if (node.childNodes[2]) {
                        if (str === '}') {
                            this.composeBraces(node.childNodes[2]);
                        }
                        else if (!node.childNodes[2].attributes.hasExplicit(LATEX)) {
                            node.childNodes[2].attributes.set(LATEX, str);
                        }
                    }
                    if (node.childNodes[1]) {
                        const sub = node.childNodes[1].attributes.get(LATEX);
                        this.composeLatex(node, `_${sub}^`, 0, 2);
                    }
                    else {
                        this.composeLatex(node, '^', 0, 2);
                    }
                    return;
                case '_':
                    if (node.childNodes[1]) {
                        if (str === '}') {
                            this.composeBraces(node.childNodes[1]);
                        }
                        else if (!node.childNodes[1].attributes.hasExplicit(LATEX)) {
                            node.childNodes[1].attributes.set(LATEX, str);
                        }
                    }
                    if (node.childNodes[2]) {
                        const sup = node.childNodes[2].attributes.get(LATEX);
                        this.composeLatex(node, `^${sup}_`, 0, 1);
                    }
                    else {
                        this.composeLatex(node, '_', 0, 1);
                    }
                    return;
            }
            if (str === '}') {
                this.composeBraces(node);
                return;
            }
        }
        node.attributes.set(LATEX, str);
    }
    composeLatex(node, comp, pos1, pos2) {
        if (!node.childNodes[pos1] || !node.childNodes[pos2])
            return;
        const LATEX = TexConstant.Attr.LATEX;
        const expr = (node.childNodes[pos1].attributes.get(LATEX) || '') +
            comp +
            node.childNodes[pos2].attributes.get(LATEX);
        node.attributes.set(LATEX, expr);
    }
    composeBraces(atom) {
        const str = this.composeBracedContent(atom);
        atom.attributes.set(TexConstant.Attr.LATEX, `{${str}}`);
    }
    composeBracedContent(atom) {
        var _a, _b;
        const children = ((_a = atom.childNodes[0]) === null || _a === void 0 ? void 0 : _a.childNodes) || [];
        let expr = '';
        for (const child of children) {
            const att = (((_b = child === null || child === void 0 ? void 0 : child.attributes) === null || _b === void 0 ? void 0 : _b.get(TexConstant.Attr.LATEX)) ||
                '');
            if (!att)
                continue;
            expr +=
                expr && expr.match(/[a-zA-Z]$/) && att.match(/^[a-zA-Z]/)
                    ? ' ' + att
                    : att;
        }
        return expr;
    }
}
//# sourceMappingURL=TexParser.js.map