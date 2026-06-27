"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BegingroupStack = void 0;
exports.begingroupStack = begingroupStack;
var HandlerTypes_js_1 = require("../HandlerTypes.js");
var TokenMap_js_1 = require("../TokenMap.js");
var MapHandler_js_1 = require("../MapHandler.js");
var TexError_js_1 = __importDefault(require("../TexError.js"));
var NewcommandUtil_js_1 = require("../newcommand/NewcommandUtil.js");
var ParseMethods_js_1 = __importDefault(require("../ParseMethods.js"));
var BegingroupStack = (function () {
    function BegingroupStack(parser) {
        this.i = NewcommandUtil_js_1.NewcommandPriority;
        this.top = NewcommandUtil_js_1.NewcommandPriority;
        this.base = NewcommandUtil_js_1.NewcommandPriority;
        this.MARKER = Symbol('marker');
        this.handlers = parser.handlers;
        this.getGlobal();
    }
    BegingroupStack.prototype.getGlobal = function () {
        var _a;
        this.global = (_a = {},
            _a[NewcommandUtil_js_1.NewcommandTables.NEW_DELIMITER] = MapHandler_js_1.MapHandler.getMap(NewcommandUtil_js_1.NewcommandTables.NEW_DELIMITER),
            _a[NewcommandUtil_js_1.NewcommandTables.NEW_ENVIRONMENT] = MapHandler_js_1.MapHandler.getMap(NewcommandUtil_js_1.NewcommandTables.NEW_ENVIRONMENT),
            _a[NewcommandUtil_js_1.NewcommandTables.NEW_COMMAND] = MapHandler_js_1.MapHandler.getMap(NewcommandUtil_js_1.NewcommandTables.NEW_COMMAND),
            _a);
    };
    BegingroupStack.prototype.checkGlobal = function (tokens, maps) {
        var e_1, _a;
        var _this = this;
        try {
            for (var maps_1 = __values(maps), maps_1_1 = maps_1.next(); !maps_1_1.done; maps_1_1 = maps_1.next()) {
                var name_1 = maps_1_1.value;
                var token = tokens.shift();
                var handler = this.handlers.get(BegingroupStack.handlerMap[name_1]);
                this.global[name_1].add(token, this.MARKER);
                var item = void 0;
                do {
                    var map = handler.applicable(token);
                    item = map.lookup(token);
                    map.remove(token);
                } while (item && item !== this.MARKER);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (maps_1_1 && !maps_1_1.done && (_a = maps_1.return)) _a.call(maps_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return maps.map(function (name) { return _this.global[name]; });
    };
    BegingroupStack.prototype.push = function () {
        new TokenMap_js_1.DelimiterMap(NewcommandUtil_js_1.NewcommandTables.NEW_DELIMITER, ParseMethods_js_1.default.delimiter, {});
        new TokenMap_js_1.CommandMap(NewcommandUtil_js_1.NewcommandTables.NEW_COMMAND, {});
        new TokenMap_js_1.EnvironmentMap(NewcommandUtil_js_1.NewcommandTables.NEW_ENVIRONMENT, ParseMethods_js_1.default.environment, {});
        this.handlers.add(BegingroupStack.handlerConfig, {}, --this.i);
    };
    BegingroupStack.prototype.pop = function () {
        var e_2, _a;
        if (this.i === this.base) {
            throw new TexError_js_1.default('MissingBegingroup', 'Missing \\begingroup or extra \\endgroup');
        }
        this.handlers.remove(BegingroupStack.handlerConfig, {});
        try {
            for (var _b = __values([NewcommandUtil_js_1.NewcommandTables.NEW_COMMAND, NewcommandUtil_js_1.NewcommandTables.NEW_ENVIRONMENT, NewcommandUtil_js_1.NewcommandTables.NEW_DELIMITER]), _c = _b.next(); !_c.done; _c = _b.next()) {
                var name_2 = _c.value;
                MapHandler_js_1.MapHandler.register(this.handlers.retrieve(name_2));
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        this.i++;
    };
    BegingroupStack.prototype.finish = function () {
        this.top = this.i;
    };
    BegingroupStack.prototype.remove = function () {
        while (this.i < this.top) {
            this.pop();
        }
    };
    BegingroupStack.prototype.reset = function () {
        this.top = this.base;
        this.remove();
    };
    BegingroupStack.prototype.sandbox = function () {
        this.base = NewcommandUtil_js_1.NewcommandPriority;
        this.reset();
        this.push();
        this.getGlobal();
        this.base = NewcommandUtil_js_1.NewcommandPriority - 1;
    };
    BegingroupStack.handlerConfig = (_a = {},
        _a[HandlerTypes_js_1.HandlerType.DELIMITER] = [NewcommandUtil_js_1.NewcommandTables.NEW_DELIMITER],
        _a[HandlerTypes_js_1.HandlerType.ENVIRONMENT] = [NewcommandUtil_js_1.NewcommandTables.NEW_ENVIRONMENT],
        _a[HandlerTypes_js_1.HandlerType.MACRO] = [NewcommandUtil_js_1.NewcommandTables.NEW_DELIMITER, NewcommandUtil_js_1.NewcommandTables.NEW_COMMAND],
        _a);
    BegingroupStack.handlerMap = (_b = {},
        _b[NewcommandUtil_js_1.NewcommandTables.NEW_DELIMITER] = HandlerTypes_js_1.HandlerType.DELIMITER,
        _b[NewcommandUtil_js_1.NewcommandTables.NEW_ENVIRONMENT] = HandlerTypes_js_1.HandlerType.ENVIRONMENT,
        _b[NewcommandUtil_js_1.NewcommandTables.NEW_COMMAND] = HandlerTypes_js_1.HandlerType.MACRO,
        _b);
    return BegingroupStack;
}());
exports.BegingroupStack = BegingroupStack;
function begingroupStack(parser) {
    return parser.packageData.get('begingroup').stack;
}
//# sourceMappingURL=BegingroupStack.js.map