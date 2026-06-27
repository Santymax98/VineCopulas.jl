import { Token, Macro } from './Token.js';
import { MapHandler } from './MapHandler.js';
export function parseResult(result) {
    return result === void 0 ? true : result;
}
export class AbstractTokenMap {
    constructor(_name, _parser) {
        this._name = _name;
        this._parser = _parser;
        MapHandler.register(this);
    }
    get name() {
        return this._name;
    }
    parserFor(token) {
        return this.contains(token) ? this.parser : null;
    }
    parse([env, token]) {
        const parser = this.parserFor(token);
        const mapped = this.lookup(token);
        return parser && mapped ? parseResult(parser(env, mapped)) : null;
    }
    set parser(parser) {
        this._parser = parser;
    }
    get parser() {
        return this._parser;
    }
}
export class RegExpMap extends AbstractTokenMap {
    constructor(name, parser, _regExp) {
        super(name, parser);
        this._regExp = _regExp;
    }
    contains(token) {
        return this._regExp.test(token);
    }
    lookup(token) {
        return this.contains(token) ? token : null;
    }
}
export class AbstractParseMap extends AbstractTokenMap {
    constructor() {
        super(...arguments);
        this.map = new Map();
    }
    lookup(token) {
        return this.map.get(token);
    }
    contains(token) {
        return this.map.has(token);
    }
    add(token, object) {
        this.map.set(token, object);
    }
    remove(token) {
        this.map.delete(token);
    }
}
export class CharacterMap extends AbstractParseMap {
    constructor(name, parser, json) {
        super(name, parser);
        for (const key of Object.keys(json)) {
            const value = json[key];
            const [char, attrs] = typeof value === 'string' ? [value, null] : value;
            const character = new Token(key, char, attrs);
            this.add(key, character);
        }
    }
}
export class DelimiterMap extends CharacterMap {
    parse([env, token]) {
        return super.parse([env, '\\' + token]);
    }
}
export class MacroMap extends AbstractParseMap {
    constructor(name, json, functionMap = {}) {
        super(name, null);
        const getMethod = (func) => typeof func === 'string' ? functionMap[func] : func;
        for (const [key, value] of Object.entries(json)) {
            let func;
            let args;
            if (Array.isArray(value)) {
                func = getMethod(value[0]);
                args = value.slice(1);
            }
            else {
                func = getMethod(value);
                args = [];
            }
            const character = new Macro(key, func, args);
            this.add(key, character);
        }
    }
    parserFor(token) {
        const macro = this.lookup(token);
        return macro ? macro.func : null;
    }
    parse([env, token]) {
        const macro = this.lookup(token);
        const parser = this.parserFor(token);
        if (!macro || !parser) {
            return null;
        }
        return parseResult(parser(env, macro.token, ...macro.args));
    }
}
export class CommandMap extends MacroMap {
    parse([env, token]) {
        const macro = this.lookup(token);
        const parser = this.parserFor(token);
        if (!macro || !parser) {
            return null;
        }
        const saveCommand = env.currentCS;
        env.currentCS = '\\' + token;
        const result = parser(env, '\\' + macro.token, ...macro.args);
        env.currentCS = saveCommand;
        return parseResult(result);
    }
}
export class EnvironmentMap extends MacroMap {
    constructor(name, parser, json, functionMap = {}) {
        super(name, json, functionMap);
        this.parser = parser;
    }
    parse([env, token]) {
        const macro = this.lookup(token);
        const envParser = this.parserFor(token);
        if (!macro || !envParser) {
            return null;
        }
        return parseResult(this.parser(env, macro.token, envParser, macro.args));
    }
}
//# sourceMappingURL=TokenMap.js.map