"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Macro = exports.Token = void 0;
var Token = (function () {
    function Token(_token, _char, _attributes) {
        this._token = _token;
        this._char = _char;
        this._attributes = _attributes;
    }
    Object.defineProperty(Token.prototype, "token", {
        get: function () {
            return this._token;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Token.prototype, "char", {
        get: function () {
            return this._char;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Token.prototype, "attributes", {
        get: function () {
            return this._attributes;
        },
        enumerable: false,
        configurable: true
    });
    return Token;
}());
exports.Token = Token;
var Macro = (function () {
    function Macro(_token, _func, _args) {
        if (_args === void 0) { _args = []; }
        this._token = _token;
        this._func = _func;
        this._args = _args;
    }
    Object.defineProperty(Macro.prototype, "token", {
        get: function () {
            return this._token;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Macro.prototype, "func", {
        get: function () {
            return this._func;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Macro.prototype, "args", {
        get: function () {
            return this._args;
        },
        enumerable: false,
        configurable: true
    });
    return Macro;
}());
exports.Macro = Macro;
//# sourceMappingURL=Token.js.map