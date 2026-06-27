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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubHandlers = exports.SubHandler = exports.MapHandler = void 0;
var TokenMap_js_1 = require("./TokenMap.js");
var PrioritizedList_js_1 = require("../../util/PrioritizedList.js");
var FunctionList_js_1 = require("../../util/FunctionList.js");
var maps = new Map();
exports.MapHandler = {
    register: function (map) {
        maps.set(map.name, map);
    },
    getMap: function (name) {
        return maps.get(name);
    },
};
var SubHandler = (function () {
    function SubHandler() {
        this._configuration = new PrioritizedList_js_1.PrioritizedList();
        this._fallback = new FunctionList_js_1.FunctionList();
    }
    SubHandler.prototype.add = function (maps, fallback, priority) {
        var e_1, _a;
        if (priority === void 0) { priority = PrioritizedList_js_1.PrioritizedList.DEFAULTPRIORITY; }
        try {
            for (var _b = __values(maps.slice().reverse()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var name_1 = _c.value;
                var map = exports.MapHandler.getMap(name_1);
                if (!map) {
                    this.warn("Configuration '".concat(name_1, "' not found! Omitted."));
                    return;
                }
                this._configuration.add(map, priority);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (fallback) {
            this._fallback.add(fallback, priority);
        }
    };
    SubHandler.prototype.remove = function (maps, fallback) {
        var e_2, _a;
        if (fallback === void 0) { fallback = null; }
        try {
            for (var maps_1 = __values(maps), maps_1_1 = maps_1.next(); !maps_1_1.done; maps_1_1 = maps_1.next()) {
                var name_2 = maps_1_1.value;
                var map = this.retrieve(name_2);
                if (map) {
                    this._configuration.remove(map);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (maps_1_1 && !maps_1_1.done && (_a = maps_1.return)) _a.call(maps_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        if (fallback) {
            this._fallback.remove(fallback);
        }
    };
    SubHandler.prototype.parse = function (input) {
        var e_3, _a;
        try {
            for (var _b = __values(this._configuration), _c = _b.next(); !_c.done; _c = _b.next()) {
                var map = _c.value.item;
                var result = map.parse(input);
                if (result === SubHandler.FALLBACK) {
                    break;
                }
                if (result) {
                    return result;
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        var _d = __read(input, 2), env = _d[0], token = _d[1];
        Array.from(this._fallback)[0].item(env, token);
        return;
    };
    SubHandler.prototype.lookup = function (token) {
        var map = this.applicable(token);
        return map ? map.lookup(token) : null;
    };
    SubHandler.prototype.contains = function (token) {
        var map = this.applicable(token);
        return (!!map && !(map instanceof TokenMap_js_1.CharacterMap && map.lookup(token).char === null));
    };
    SubHandler.prototype.toString = function () {
        var e_4, _a;
        var names = [];
        try {
            for (var _b = __values(this._configuration), _c = _b.next(); !_c.done; _c = _b.next()) {
                var map = _c.value.item;
                names.push(map.name);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return names.join(', ');
    };
    SubHandler.prototype.applicable = function (token) {
        var e_5, _a;
        try {
            for (var _b = __values(this._configuration), _c = _b.next(); !_c.done; _c = _b.next()) {
                var map = _c.value.item;
                if (map.contains(token)) {
                    return map;
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return null;
    };
    SubHandler.prototype.retrieve = function (name) {
        var e_6, _a;
        try {
            for (var _b = __values(this._configuration), _c = _b.next(); !_c.done; _c = _b.next()) {
                var map = _c.value.item;
                if (map.name === name) {
                    return map;
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
        }
        return null;
    };
    SubHandler.prototype.warn = function (message) {
        console.log('TexParser Warning: ' + message);
    };
    SubHandler.FALLBACK = Symbol('fallback');
    return SubHandler;
}());
exports.SubHandler = SubHandler;
var SubHandlers = (function () {
    function SubHandlers() {
        this.map = new Map();
    }
    SubHandlers.prototype.add = function (handlers, fallbacks, priority) {
        var e_7, _a;
        if (priority === void 0) { priority = PrioritizedList_js_1.PrioritizedList.DEFAULTPRIORITY; }
        try {
            for (var _b = __values(Object.keys(handlers)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                var name_3 = key;
                var subHandler = this.get(name_3);
                if (!subHandler) {
                    subHandler = new SubHandler();
                    this.set(name_3, subHandler);
                }
                subHandler.add(handlers[name_3], fallbacks[name_3], priority);
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_7) throw e_7.error; }
        }
    };
    SubHandlers.prototype.remove = function (handlers, fallbacks) {
        var e_8, _a;
        try {
            for (var _b = __values(Object.keys(handlers)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var name_4 = _c.value;
                var subHandler = this.get(name_4);
                if (subHandler) {
                    subHandler.remove(handlers[name_4], fallbacks[name_4]);
                }
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_8) throw e_8.error; }
        }
    };
    SubHandlers.prototype.set = function (name, subHandler) {
        this.map.set(name, subHandler);
    };
    SubHandlers.prototype.get = function (name) {
        return this.map.get(name);
    };
    SubHandlers.prototype.retrieve = function (name) {
        var e_9, _a;
        try {
            for (var _b = __values(this.map.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var handler = _c.value;
                var map = handler.retrieve(name);
                if (map) {
                    return map;
                }
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_9) throw e_9.error; }
        }
        return null;
    };
    SubHandlers.prototype.keys = function () {
        return this.map.keys();
    };
    return SubHandlers;
}());
exports.SubHandlers = SubHandlers;
//# sourceMappingURL=MapHandler.js.map