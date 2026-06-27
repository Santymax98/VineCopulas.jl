import { HandlerType } from '../HandlerTypes.js';
import TexParser from '../TexParser.js';
import { retryAfter } from '../../../util/Retries.js';
import BaseMethods from '../base/BaseMethods.js';
export const TextMacrosMethods = {
    Comment(parser, _c) {
        while (parser.i < parser.string.length &&
            parser.string.charAt(parser.i) !== '\n') {
            parser.i++;
        }
        parser.i++;
    },
    Math(parser, open) {
        parser.saveText();
        const i = parser.i;
        let j, c;
        let braces = 0;
        while ((c = parser.GetNext())) {
            j = parser.i++;
            switch (c) {
                case '\\': {
                    const cs = parser.GetCS();
                    if (cs === ')')
                        c = '\\(';
                }
                case '$':
                    if (braces === 0 && open === c) {
                        const config = parser.texParser.configuration;
                        const mml = new TexParser(parser.string.substring(i, j), parser.stack.env, config).mml();
                        parser.PushMath(mml);
                        return;
                    }
                    break;
                case '{':
                    braces++;
                    break;
                case '}':
                    if (braces === 0) {
                        parser.Error('ExtraCloseMissingOpen', 'Extra close brace or missing open brace');
                    }
                    braces--;
                    break;
            }
        }
        parser.Error('MathNotTerminated', 'Math mode is not properly terminated');
    },
    MathModeOnly(parser, c) {
        parser.Error('MathModeOnly', "'%1' allowed only in math mode", c);
    },
    Misplaced(parser, c) {
        parser.Error('Misplaced', "Misplaced '%1'", c);
    },
    OpenBrace(parser, _c) {
        const env = parser.stack.env;
        parser.envStack.push(env);
        parser.stack.env = Object.assign({}, env);
    },
    CloseBrace(parser, _c) {
        if (parser.envStack.length) {
            parser.saveText();
            parser.stack.env = parser.envStack.pop();
        }
        else {
            parser.Error('ExtraCloseMissingOpen', 'Extra close brace or missing open brace');
        }
    },
    OpenQuote(parser, c) {
        if (parser.string.charAt(parser.i) === c) {
            parser.text += '\u201C';
            parser.i++;
        }
        else {
            parser.text += '\u2018';
        }
    },
    CloseQuote(parser, c) {
        if (parser.string.charAt(parser.i) === c) {
            parser.text += '\u201D';
            parser.i++;
        }
        else {
            parser.text += '\u2019';
        }
    },
    Tilde(parser, _c) {
        parser.text += '\u00A0';
    },
    Space(parser, _c) {
        parser.text += ' ';
        parser.GetNext();
    },
    SelfQuote(parser, name) {
        parser.text += name.substring(1);
    },
    Insert(parser, _name, c) {
        parser.text += c;
    },
    Accent(parser, name, c) {
        const base = parser.ParseArg(name);
        const accent = parser.create('token', 'mo', {}, c);
        parser.addAttributes(accent);
        parser.Push(parser.create('node', 'mover', [base, accent]));
    },
    Emph(parser, name) {
        const variant = parser.stack.env.mathvariant === '-tex-mathit' ? 'normal' : '-tex-mathit';
        parser.Push(parser.ParseTextArg(name, { mathvariant: variant }));
    },
    TextFont(parser, name, variant) {
        parser.saveText();
        parser.Push(parser.ParseTextArg(name, { mathvariant: variant }));
    },
    SetFont(parser, _name, variant) {
        parser.saveText();
        parser.stack.env.mathvariant = variant;
    },
    SetSize(parser, _name, size) {
        parser.saveText();
        parser.stack.env.mathsize = size;
    },
    CheckAutoload(parser, name) {
        const autoload = parser.configuration.packageData.get('autoload');
        const texParser = parser.texParser;
        name = name.slice(1);
        const macro = texParser.lookup(HandlerType.MACRO, name);
        if (!macro || (autoload && macro._func === autoload.Autoload)) {
            texParser.parse(HandlerType.MACRO, [texParser, name]);
            if (!macro)
                return;
            retryAfter(Promise.resolve());
        }
        texParser.parse(HandlerType.MACRO, [parser, name]);
    },
    Macro: BaseMethods.Macro,
    Spacer: BaseMethods.Spacer,
    Hskip: BaseMethods.Hskip,
    rule: BaseMethods.rule,
    Rule: BaseMethods.Rule,
    HandleRef: BaseMethods.HandleRef,
    UnderOver: BaseMethods.UnderOver,
    Lap: BaseMethods.Lap,
    Phantom: BaseMethods.Phantom,
    Smash: BaseMethods.Smash,
    MmlToken: BaseMethods.MmlToken,
};
//# sourceMappingURL=TextMacrosMethods.js.map