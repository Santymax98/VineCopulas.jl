"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiteAdaptor = exports.LiteBase = void 0;
exports.liteAdaptor = liteAdaptor;
var DOMAdaptor_js_1 = require("../core/DOMAdaptor.js");
var NodeMixin_js_1 = require("./NodeMixin.js");
var Document_js_1 = require("./lite/Document.js");
var Element_js_1 = require("./lite/Element.js");
var Text_js_1 = require("./lite/Text.js");
var Window_js_1 = require("./lite/Window.js");
var Parser_js_1 = require("./lite/Parser.js");
var Styles_js_1 = require("../util/Styles.js");
var LiteBase = (function (_super) {
    __extends(LiteBase, _super);
    function LiteBase() {
        var _this = _super.call(this) || this;
        _this.parser = new Parser_js_1.LiteParser();
        _this.window = new Window_js_1.LiteWindow();
        return _this;
    }
    LiteBase.prototype.parse = function (text, format) {
        return this.parser.parseFromString(text, format, this);
    };
    LiteBase.prototype.create = function (kind, _ns) {
        if (_ns === void 0) { _ns = null; }
        return new Element_js_1.LiteElement(kind);
    };
    LiteBase.prototype.text = function (text) {
        return new Text_js_1.LiteText(text);
    };
    LiteBase.prototype.comment = function (text) {
        return new Text_js_1.LiteComment(text);
    };
    LiteBase.prototype.createDocument = function () {
        return new Document_js_1.LiteDocument();
    };
    LiteBase.prototype.head = function (doc) {
        if (doc === void 0) { doc = this.document; }
        return doc.head;
    };
    LiteBase.prototype.body = function (doc) {
        if (doc === void 0) { doc = this.document; }
        return doc.body;
    };
    LiteBase.prototype.root = function (doc) {
        if (doc === void 0) { doc = this.document; }
        return doc.root;
    };
    LiteBase.prototype.doctype = function (doc) {
        if (doc === void 0) { doc = this.document; }
        return doc.type;
    };
    LiteBase.prototype.tags = function (node, name, ns, stop) {
        if (ns === void 0) { ns = null; }
        if (stop === void 0) { stop = null; }
        var stack = [];
        var tags = [];
        if (ns) {
            return tags;
        }
        var n = node;
        while (n) {
            var kind = n.kind;
            if (kind !== '#text' && kind !== '#comment') {
                n = n;
                if (kind === name) {
                    tags.push(n);
                    if (tags.length === stop) {
                        return tags;
                    }
                }
                if (n.children.length) {
                    stack = n.children.concat(stack);
                }
            }
            n = stack.shift();
        }
        return tags;
    };
    LiteBase.prototype.elementById = function (node, id) {
        var stack = [];
        var n = node;
        while (n) {
            if (n.kind !== '#text' && n.kind !== '#comment') {
                n = n;
                if (n.attributes['id'] === id) {
                    return n;
                }
                if (n.children.length) {
                    stack = n.children.concat(stack);
                }
            }
            n = stack.shift();
        }
        return null;
    };
    LiteBase.prototype.elementsByClass = function (node, name, stop) {
        if (stop === void 0) { stop = null; }
        var stack = [];
        var tags = [];
        var n = node;
        while (n) {
            if (n.kind !== '#text' && n.kind !== '#comment') {
                n = n;
                var classes = (n.attributes['class'] || '').trim().split(/ +/);
                if (classes.includes(name)) {
                    tags.push(n);
                    if (tags.length === stop) {
                        return tags;
                    }
                }
                if (n.children.length) {
                    stack = n.children.concat(stack);
                }
            }
            n = stack.shift();
        }
        return tags;
    };
    LiteBase.prototype.elementsByAttribute = function (node, name, value, stop) {
        if (stop === void 0) { stop = null; }
        var stack = [];
        var tags = [];
        var n = node;
        while (n) {
            if (n.kind !== '#text' && n.kind !== '#comment') {
                n = n;
                var attribute = n.attributes[name];
                if (attribute === value) {
                    tags.push(n);
                    if (tags.length === stop) {
                        return tags;
                    }
                }
                if (n.children.length) {
                    stack = n.children.concat(stack);
                }
            }
            n = stack.shift();
        }
        return tags;
    };
    LiteBase.prototype.getElements = function (nodes, document) {
        var e_1, _a;
        var containers = [];
        var body = this.body(document);
        try {
            for (var nodes_1 = __values(nodes), nodes_1_1 = nodes_1.next(); !nodes_1_1.done; nodes_1_1 = nodes_1.next()) {
                var node = nodes_1_1.value;
                if (typeof node === 'string') {
                    if (node.charAt(0) === '#') {
                        var n = this.elementById(body, node.slice(1));
                        if (n) {
                            containers.push(n);
                        }
                    }
                    else if (node.charAt(0) === '.') {
                        containers = containers.concat(this.elementsByClass(body, node.slice(1)));
                    }
                    else if (node.match(/^[-a-z][-a-z0-9]*$/i)) {
                        containers = containers.concat(this.tags(body, node));
                    }
                    else {
                        var match = node.match(/^\[(.*?)="(.*?)"\]$/);
                        if (match) {
                            containers = containers.concat(this.elementsByAttribute(body, match[1], match[2]));
                        }
                    }
                }
                else if (Array.isArray(node)) {
                    containers = containers.concat(node);
                }
                else if (node instanceof this.window.NodeList ||
                    node instanceof this.window.HTMLCollection) {
                    containers = containers.concat(node.nodes);
                }
                else {
                    containers.push(node);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (nodes_1_1 && !nodes_1_1.done && (_a = nodes_1.return)) _a.call(nodes_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return containers;
    };
    LiteBase.prototype.getElement = function (selector, node) {
        if (node === void 0) { node = this.document; }
        if (node instanceof Document_js_1.LiteDocument) {
            node = this.body(node);
        }
        if (selector.charAt(0) === '#') {
            return this.elementById(node, selector.slice(1));
        }
        if (selector.charAt(0) === '.') {
            return this.elementsByClass(node, selector.slice(1), 1)[0];
        }
        if (selector.match(/^[-a-z][-a-z0-9]*$/i)) {
            return this.tags(node, selector, null, 1)[0];
        }
        var match = selector.match(/^\[(.*?)="(.*?)"\]$/);
        if (match) {
            return this.elementsByAttribute(node, match[1], match[2], 1)[0];
        }
        return null;
    };
    LiteBase.prototype.contains = function (container, node) {
        while (node && node !== container) {
            node = this.parent(node);
        }
        return !!node;
    };
    LiteBase.prototype.parent = function (node) {
        return node.parent;
    };
    LiteBase.prototype.childIndex = function (node) {
        return node.parent ? node.parent.children.findIndex(function (n) { return n === node; }) : -1;
    };
    LiteBase.prototype.append = function (node, child) {
        if (child.parent) {
            this.remove(child);
        }
        node.children.push(child);
        child.parent = node;
        return child;
    };
    LiteBase.prototype.insert = function (nchild, ochild) {
        if (nchild.parent) {
            this.remove(nchild);
        }
        if (ochild && ochild.parent) {
            var i = this.childIndex(ochild);
            ochild.parent.children.splice(i, 0, nchild);
            nchild.parent = ochild.parent;
        }
    };
    LiteBase.prototype.remove = function (child) {
        var i = this.childIndex(child);
        if (i >= 0) {
            child.parent.children.splice(i, 1);
        }
        child.parent = null;
        return child;
    };
    LiteBase.prototype.replace = function (nnode, onode) {
        var i = this.childIndex(onode);
        if (i >= 0) {
            onode.parent.children[i] = nnode;
            nnode.parent = onode.parent;
            onode.parent = null;
        }
        return onode;
    };
    LiteBase.prototype.clone = function (node, deep) {
        var _this = this;
        if (deep === void 0) { deep = true; }
        var nnode = new Element_js_1.LiteElement(node.kind);
        nnode.attributes = __assign({}, node.attributes);
        nnode.children = !deep
            ? []
            : node.children.map(function (n) {
                if (n.kind === '#text') {
                    return new Text_js_1.LiteText(n.value);
                }
                else if (n.kind === '#comment') {
                    return new Text_js_1.LiteComment(n.value);
                }
                else {
                    var m = _this.clone(n);
                    m.parent = nnode;
                    return m;
                }
            });
        return nnode;
    };
    LiteBase.prototype.split = function (node, n) {
        var text = new Text_js_1.LiteText(node.value.slice(n));
        node.value = node.value.slice(0, n);
        node.parent.children.splice(this.childIndex(node) + 1, 0, text);
        text.parent = node.parent;
        return text;
    };
    LiteBase.prototype.next = function (node) {
        var parent = node.parent;
        if (!parent)
            return null;
        var i = this.childIndex(node) + 1;
        return i >= 0 && i < parent.children.length ? parent.children[i] : null;
    };
    LiteBase.prototype.previous = function (node) {
        var parent = node.parent;
        if (!parent)
            return null;
        var i = this.childIndex(node) - 1;
        return i >= 0 ? parent.children[i] : null;
    };
    LiteBase.prototype.firstChild = function (node) {
        return node.children[0];
    };
    LiteBase.prototype.lastChild = function (node) {
        return node.children[node.children.length - 1];
    };
    LiteBase.prototype.childNodes = function (node) {
        return __spreadArray([], __read(node.children), false);
    };
    LiteBase.prototype.childNode = function (node, i) {
        return node.children[i];
    };
    LiteBase.prototype.kind = function (node) {
        return node.kind;
    };
    LiteBase.prototype.value = function (node) {
        return node.kind === '#text'
            ? node.value
            : node.kind === '#comment'
                ? node.value.replace(/^<!(--)?((?:.|\n)*)\1>$/, '$2')
                : '';
    };
    LiteBase.prototype.textContent = function (node) {
        var _this = this;
        return node.children.reduce(function (s, n) {
            return (s +
                (n.kind === '#text'
                    ? n.value
                    : n.kind === '#comment'
                        ? ''
                        : _this.textContent(n)));
        }, '');
    };
    LiteBase.prototype.innerHTML = function (node) {
        return this.parser.serializeInner(this, node);
    };
    LiteBase.prototype.outerHTML = function (node) {
        return this.parser.serialize(this, node);
    };
    LiteBase.prototype.serializeXML = function (node) {
        return this.parser.serialize(this, node, true);
    };
    LiteBase.prototype.setAttribute = function (node, name, value, ns) {
        if (ns === void 0) { ns = null; }
        if (typeof value !== 'string') {
            value = String(value);
        }
        if (ns) {
            name = ns.replace(/.*\//, '') + ':' + name.replace(/^.*:/, '');
        }
        node.attributes[name] = value;
        if (name === 'style') {
            node.styles = null;
        }
    };
    LiteBase.prototype.getAttribute = function (node, name) {
        return node.attributes[name];
    };
    LiteBase.prototype.removeAttribute = function (node, name) {
        delete node.attributes[name];
    };
    LiteBase.prototype.hasAttribute = function (node, name) {
        return Object.hasOwn(node.attributes, name);
    };
    LiteBase.prototype.allAttributes = function (node) {
        var e_2, _a;
        var attributes = node.attributes;
        var list = [];
        try {
            for (var _b = __values(Object.keys(attributes)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var name_1 = _c.value;
                list.push({ name: name_1, value: attributes[name_1] });
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return list;
    };
    LiteBase.prototype.addClass = function (node, name) {
        var classString = node.attributes['class'];
        var classes = (classString === null || classString === void 0 ? void 0 : classString.split(/ /)) || [];
        if (!classes.includes(name)) {
            classes.push(name);
            node.attributes['class'] = classes.join(' ');
        }
    };
    LiteBase.prototype.removeClass = function (node, name) {
        var classString = node.attributes['class'];
        var classes = (classString === null || classString === void 0 ? void 0 : classString.split(/ /)) || [];
        var i = classes.indexOf(name);
        if (i >= 0) {
            classes.splice(i, 1);
            node.attributes['class'] = classes.join(' ');
        }
    };
    LiteBase.prototype.hasClass = function (node, name) {
        var classes = (node.attributes['class'] || '').split(/ /);
        return classes.includes(name);
    };
    LiteBase.prototype.setStyle = function (node, name, value) {
        if (!node.styles) {
            node.styles = new Styles_js_1.Styles(this.getAttribute(node, 'style'));
        }
        node.styles.set(name, value);
        node.attributes['style'] = node.styles.cssText;
    };
    LiteBase.prototype.getStyle = function (node, name) {
        if (!node.styles) {
            var style = this.getAttribute(node, 'style');
            if (!style) {
                return '';
            }
            node.styles = new Styles_js_1.Styles(style);
        }
        return node.styles.get(name);
    };
    LiteBase.prototype.allStyles = function (node) {
        return this.getAttribute(node, 'style');
    };
    LiteBase.prototype.insertRules = function (node, rules) {
        node.children = [
            this.text(this.textContent(node) + '\n\n' + rules.join('\n\n')),
        ];
    };
    LiteBase.prototype.fontSize = function (_node) {
        return 0;
    };
    LiteBase.prototype.fontFamily = function (_node) {
        return '';
    };
    LiteBase.prototype.nodeSize = function (_node, _em, _local) {
        if (_em === void 0) { _em = 1; }
        if (_local === void 0) { _local = null; }
        return [0, 0];
    };
    LiteBase.prototype.nodeBBox = function (_node) {
        return { left: 0, right: 0, top: 0, bottom: 0 };
    };
    LiteBase.prototype.createWorker = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, null];
            });
        });
    };
    return LiteBase;
}(DOMAdaptor_js_1.AbstractDOMAdaptor));
exports.LiteBase = LiteBase;
var LiteAdaptor = (function (_super) {
    __extends(LiteAdaptor, _super);
    function LiteAdaptor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return LiteAdaptor;
}((0, NodeMixin_js_1.NodeMixin)(LiteBase)));
exports.LiteAdaptor = LiteAdaptor;
function liteAdaptor(options) {
    if (options === void 0) { options = null; }
    return new LiteAdaptor(null, options);
}
//# sourceMappingURL=liteAdaptor.js.map