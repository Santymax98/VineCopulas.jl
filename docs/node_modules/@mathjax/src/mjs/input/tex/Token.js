export class Token {
    constructor(_token, _char, _attributes) {
        this._token = _token;
        this._char = _char;
        this._attributes = _attributes;
    }
    get token() {
        return this._token;
    }
    get char() {
        return this._char;
    }
    get attributes() {
        return this._attributes;
    }
}
export class Macro {
    constructor(_token, _func, _args = []) {
        this._token = _token;
        this._func = _func;
        this._args = _args;
    }
    get token() {
        return this._token;
    }
    get func() {
        return this._func;
    }
    get args() {
        return this._args;
    }
}
//# sourceMappingURL=Token.js.map