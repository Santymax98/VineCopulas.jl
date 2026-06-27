"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var TexError_js_1 = __importDefault(require("../TexError.js"));
var TexParser_js_1 = __importDefault(require("../TexParser.js"));
var ParseUtil_js_1 = require("../ParseUtil.js");
var UnitUtil_js_1 = require("../UnitUtil.js");
var BussproofsUtil = __importStar(require("./BussproofsUtil.js"));
function paddedContent(parser, content) {
    var nodes = ParseUtil_js_1.ParseUtil.internalMath(parser, UnitUtil_js_1.UnitUtil.trimSpaces(content), 0);
    if (!nodes[0].childNodes[0].childNodes.length) {
        return parser.create('node', 'mrow', []);
    }
    var lpad = parser.create('node', 'mspace', [], { width: '.5ex' });
    var rpad = parser.create('node', 'mspace', [], { width: '.5ex' });
    return parser.create('node', 'mrow', __spreadArray(__spreadArray([lpad], __read(nodes), false), [rpad], false));
}
function createRule(parser, premise, conclusions, left, right, style, rootAtTop) {
    var upper = parser.create('node', 'mtr', [parser.create('node', 'mtd', [premise], {})], {});
    var lower = parser.create('node', 'mtr', [parser.create('node', 'mtd', conclusions, {})], {});
    var rule = parser.create('node', 'mtable', rootAtTop ? [lower, upper] : [upper, lower], { align: 'top 2', rowlines: style, framespacing: '0 0' });
    BussproofsUtil.setProperty(rule, 'inferenceRule', rootAtTop ? 'up' : 'down');
    var leftLabel, rightLabel;
    if (left) {
        leftLabel = parser.create('node', 'mpadded', [left], {
            height: '.25em',
            depth: '+.25em',
            width: '+.5ex',
            voffset: '-.25em',
        });
        BussproofsUtil.setProperty(leftLabel, 'prooflabel', 'left');
    }
    if (right) {
        rightLabel = parser.create('node', 'mpadded', [right], {
            height: '-.25em',
            depth: '+.25em',
            width: '+.5ex',
            voffset: '-.25em',
            lspace: '.5ex',
        });
        BussproofsUtil.setProperty(rightLabel, 'prooflabel', 'right');
    }
    var children, label;
    if (left && right) {
        children = [leftLabel, rule, rightLabel];
        label = 'both';
    }
    else if (left) {
        children = [leftLabel, rule];
        label = 'left';
    }
    else if (right) {
        children = [rule, rightLabel];
        label = 'right';
    }
    else {
        return rule;
    }
    rule = parser.create('node', 'mrow', children);
    BussproofsUtil.setProperty(rule, 'labelledRule', label);
    return rule;
}
function parseFCenterLine(parser, name) {
    var dollar = parser.GetNext();
    if (dollar !== '$') {
        throw new TexError_js_1.default('IllegalUseOfCommand', 'Use of %1 does not match its definition.', name);
    }
    parser.i++;
    var axiom = parser.GetUpTo(name, '$');
    if (!axiom.includes('\\fCenter')) {
        throw new TexError_js_1.default('MissingProofCommand', 'Missing %1 in %2.', '\\fCenter', name);
    }
    var _a = __read(axiom.split('\\fCenter'), 2), prem = _a[0], conc = _a[1];
    var premise = new TexParser_js_1.default(prem, parser.stack.env, parser.configuration).mml();
    var conclusion = new TexParser_js_1.default(conc, parser.stack.env, parser.configuration).mml();
    var fcenter = new TexParser_js_1.default('\\fCenter', parser.stack.env, parser.configuration).mml();
    var left = parser.create('node', 'mtd', [premise], {});
    var middle = parser.create('node', 'mtd', [fcenter], {});
    var right = parser.create('node', 'mtd', [conclusion], {});
    var row = parser.create('node', 'mtr', [left, middle, right], {});
    var table = parser.create('node', 'mtable', [row], {
        columnspacing: '.5ex',
        columnalign: 'center 2',
    });
    BussproofsUtil.setProperty(table, 'sequent', true);
    parser.configuration.addNode('sequent', row);
    return table;
}
var BussproofsMethods = {
    Prooftree: function (parser, begin) {
        parser.Push(begin);
        var newItem = parser.itemFactory.create('proofTree').setProperties({
            name: begin.getName(),
            line: 'solid',
            currentLine: 'solid',
            rootAtTop: false,
        });
        return newItem;
    },
    Axiom: function (parser, name) {
        var top = parser.stack.Top();
        if (top.kind !== 'proofTree') {
            throw new TexError_js_1.default('IllegalProofCommand', 'Proof commands only allowed in prooftree environment.');
        }
        var content = paddedContent(parser, parser.GetArgument(name));
        BussproofsUtil.setProperty(content, 'axiom', true);
        top.Push(content);
    },
    Inference: function (parser, name, n) {
        var top = parser.stack.Top();
        if (top.kind !== 'proofTree') {
            throw new TexError_js_1.default('IllegalProofCommand', 'Proof commands only allowed in prooftree environment.');
        }
        if (top.Size() < n) {
            throw new TexError_js_1.default('BadProofTree', 'Proof tree badly specified.');
        }
        var rootAtTop = top.getProperty('rootAtTop');
        var childCount = n === 1 && !top.Peek()[0].childNodes.length ? 0 : n;
        var children = [];
        do {
            if (children.length) {
                children.unshift(parser.create('node', 'mtd', [], {}));
            }
            children.unshift(parser.create('node', 'mtd', [top.Pop()], {
                rowalign: rootAtTop ? 'top' : 'bottom',
            }));
            n--;
        } while (n > 0);
        var row = parser.create('node', 'mtr', children, {});
        var table = parser.create('node', 'mtable', [row], {
            framespacing: '0 0',
        });
        var conclusion = paddedContent(parser, parser.GetArgument(name));
        var style = top.getProperty('currentLine');
        if (style !== top.getProperty('line')) {
            top.setProperty('currentLine', top.getProperty('line'));
        }
        var rule = createRule(parser, table, [conclusion], top.getProperty('left'), top.getProperty('right'), style, rootAtTop);
        top.setProperty('left', null);
        top.setProperty('right', null);
        BussproofsUtil.setProperty(rule, 'inference', childCount);
        parser.configuration.addNode('inference', rule);
        top.Push(rule);
    },
    Label: function (parser, name, side) {
        var top = parser.stack.Top();
        if (top.kind !== 'proofTree') {
            throw new TexError_js_1.default('IllegalProofCommand', 'Proof commands only allowed in prooftree environment.');
        }
        var content = ParseUtil_js_1.ParseUtil.internalMath(parser, parser.GetArgument(name), 0);
        var label = content.length > 1
            ? parser.create('node', 'mrow', content, {})
            : content[0];
        top.setProperty(side, label);
    },
    SetLine: function (parser, _name, style, always) {
        var top = parser.stack.Top();
        if (top.kind !== 'proofTree') {
            throw new TexError_js_1.default('IllegalProofCommand', 'Proof commands only allowed in prooftree environment.');
        }
        top.setProperty('currentLine', style);
        if (always) {
            top.setProperty('line', style);
        }
    },
    RootAtTop: function (parser, _name, where) {
        var top = parser.stack.Top();
        if (top.kind !== 'proofTree') {
            throw new TexError_js_1.default('IllegalProofCommand', 'Proof commands only allowed in prooftree environment.');
        }
        top.setProperty('rootAtTop', where);
    },
    AxiomF: function (parser, name) {
        var top = parser.stack.Top();
        if (top.kind !== 'proofTree') {
            throw new TexError_js_1.default('IllegalProofCommand', 'Proof commands only allowed in prooftree environment.');
        }
        var line = parseFCenterLine(parser, name);
        BussproofsUtil.setProperty(line, 'axiom', true);
        top.Push(line);
    },
    FCenter: function (_parser, _name) { },
    InferenceF: function (parser, name, n) {
        var top = parser.stack.Top();
        if (top.kind !== 'proofTree') {
            throw new TexError_js_1.default('IllegalProofCommand', 'Proof commands only allowed in prooftree environment.');
        }
        if (top.Size() < n) {
            throw new TexError_js_1.default('BadProofTree', 'Proof tree badly specified.');
        }
        var rootAtTop = top.getProperty('rootAtTop');
        var childCount = n === 1 && !top.Peek()[0].childNodes.length ? 0 : n;
        var children = [];
        do {
            if (children.length) {
                children.unshift(parser.create('node', 'mtd', [], {}));
            }
            children.unshift(parser.create('node', 'mtd', [top.Pop()], {
                rowalign: rootAtTop ? 'top' : 'bottom',
            }));
            n--;
        } while (n > 0);
        var row = parser.create('node', 'mtr', children, {});
        var table = parser.create('node', 'mtable', [row], {
            framespacing: '0 0',
        });
        var conclusion = parseFCenterLine(parser, name);
        var style = top.getProperty('currentLine');
        if (style !== top.getProperty('line')) {
            top.setProperty('currentLine', top.getProperty('line'));
        }
        var rule = createRule(parser, table, [conclusion], top.getProperty('left'), top.getProperty('right'), style, rootAtTop);
        top.setProperty('left', null);
        top.setProperty('right', null);
        BussproofsUtil.setProperty(rule, 'inference', childCount);
        parser.configuration.addNode('inference', rule);
        top.Push(rule);
    },
};
exports.default = BussproofsMethods;
//# sourceMappingURL=BussproofsMethods.js.map