import TexError from '../TexError.js';
import TexParser from '../TexParser.js';
import { ParseUtil } from '../ParseUtil.js';
import { UnitUtil } from '../UnitUtil.js';
import * as BussproofsUtil from './BussproofsUtil.js';
function paddedContent(parser, content) {
    const nodes = ParseUtil.internalMath(parser, UnitUtil.trimSpaces(content), 0);
    if (!nodes[0].childNodes[0].childNodes.length) {
        return parser.create('node', 'mrow', []);
    }
    const lpad = parser.create('node', 'mspace', [], { width: '.5ex' });
    const rpad = parser.create('node', 'mspace', [], { width: '.5ex' });
    return parser.create('node', 'mrow', [lpad, ...nodes, rpad]);
}
function createRule(parser, premise, conclusions, left, right, style, rootAtTop) {
    const upper = parser.create('node', 'mtr', [parser.create('node', 'mtd', [premise], {})], {});
    const lower = parser.create('node', 'mtr', [parser.create('node', 'mtd', conclusions, {})], {});
    let rule = parser.create('node', 'mtable', rootAtTop ? [lower, upper] : [upper, lower], { align: 'top 2', rowlines: style, framespacing: '0 0' });
    BussproofsUtil.setProperty(rule, 'inferenceRule', rootAtTop ? 'up' : 'down');
    let leftLabel, rightLabel;
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
    let children, label;
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
    const dollar = parser.GetNext();
    if (dollar !== '$') {
        throw new TexError('IllegalUseOfCommand', 'Use of %1 does not match its definition.', name);
    }
    parser.i++;
    const axiom = parser.GetUpTo(name, '$');
    if (!axiom.includes('\\fCenter')) {
        throw new TexError('MissingProofCommand', 'Missing %1 in %2.', '\\fCenter', name);
    }
    const [prem, conc] = axiom.split('\\fCenter');
    const premise = new TexParser(prem, parser.stack.env, parser.configuration).mml();
    const conclusion = new TexParser(conc, parser.stack.env, parser.configuration).mml();
    const fcenter = new TexParser('\\fCenter', parser.stack.env, parser.configuration).mml();
    const left = parser.create('node', 'mtd', [premise], {});
    const middle = parser.create('node', 'mtd', [fcenter], {});
    const right = parser.create('node', 'mtd', [conclusion], {});
    const row = parser.create('node', 'mtr', [left, middle, right], {});
    const table = parser.create('node', 'mtable', [row], {
        columnspacing: '.5ex',
        columnalign: 'center 2',
    });
    BussproofsUtil.setProperty(table, 'sequent', true);
    parser.configuration.addNode('sequent', row);
    return table;
}
const BussproofsMethods = {
    Prooftree(parser, begin) {
        parser.Push(begin);
        const newItem = parser.itemFactory.create('proofTree').setProperties({
            name: begin.getName(),
            line: 'solid',
            currentLine: 'solid',
            rootAtTop: false,
        });
        return newItem;
    },
    Axiom(parser, name) {
        const top = parser.stack.Top();
        if (top.kind !== 'proofTree') {
            throw new TexError('IllegalProofCommand', 'Proof commands only allowed in prooftree environment.');
        }
        const content = paddedContent(parser, parser.GetArgument(name));
        BussproofsUtil.setProperty(content, 'axiom', true);
        top.Push(content);
    },
    Inference(parser, name, n) {
        const top = parser.stack.Top();
        if (top.kind !== 'proofTree') {
            throw new TexError('IllegalProofCommand', 'Proof commands only allowed in prooftree environment.');
        }
        if (top.Size() < n) {
            throw new TexError('BadProofTree', 'Proof tree badly specified.');
        }
        const rootAtTop = top.getProperty('rootAtTop');
        const childCount = n === 1 && !top.Peek()[0].childNodes.length ? 0 : n;
        const children = [];
        do {
            if (children.length) {
                children.unshift(parser.create('node', 'mtd', [], {}));
            }
            children.unshift(parser.create('node', 'mtd', [top.Pop()], {
                rowalign: rootAtTop ? 'top' : 'bottom',
            }));
            n--;
        } while (n > 0);
        const row = parser.create('node', 'mtr', children, {});
        const table = parser.create('node', 'mtable', [row], {
            framespacing: '0 0',
        });
        const conclusion = paddedContent(parser, parser.GetArgument(name));
        const style = top.getProperty('currentLine');
        if (style !== top.getProperty('line')) {
            top.setProperty('currentLine', top.getProperty('line'));
        }
        const rule = createRule(parser, table, [conclusion], top.getProperty('left'), top.getProperty('right'), style, rootAtTop);
        top.setProperty('left', null);
        top.setProperty('right', null);
        BussproofsUtil.setProperty(rule, 'inference', childCount);
        parser.configuration.addNode('inference', rule);
        top.Push(rule);
    },
    Label(parser, name, side) {
        const top = parser.stack.Top();
        if (top.kind !== 'proofTree') {
            throw new TexError('IllegalProofCommand', 'Proof commands only allowed in prooftree environment.');
        }
        const content = ParseUtil.internalMath(parser, parser.GetArgument(name), 0);
        const label = content.length > 1
            ? parser.create('node', 'mrow', content, {})
            : content[0];
        top.setProperty(side, label);
    },
    SetLine(parser, _name, style, always) {
        const top = parser.stack.Top();
        if (top.kind !== 'proofTree') {
            throw new TexError('IllegalProofCommand', 'Proof commands only allowed in prooftree environment.');
        }
        top.setProperty('currentLine', style);
        if (always) {
            top.setProperty('line', style);
        }
    },
    RootAtTop(parser, _name, where) {
        const top = parser.stack.Top();
        if (top.kind !== 'proofTree') {
            throw new TexError('IllegalProofCommand', 'Proof commands only allowed in prooftree environment.');
        }
        top.setProperty('rootAtTop', where);
    },
    AxiomF(parser, name) {
        const top = parser.stack.Top();
        if (top.kind !== 'proofTree') {
            throw new TexError('IllegalProofCommand', 'Proof commands only allowed in prooftree environment.');
        }
        const line = parseFCenterLine(parser, name);
        BussproofsUtil.setProperty(line, 'axiom', true);
        top.Push(line);
    },
    FCenter(_parser, _name) { },
    InferenceF(parser, name, n) {
        const top = parser.stack.Top();
        if (top.kind !== 'proofTree') {
            throw new TexError('IllegalProofCommand', 'Proof commands only allowed in prooftree environment.');
        }
        if (top.Size() < n) {
            throw new TexError('BadProofTree', 'Proof tree badly specified.');
        }
        const rootAtTop = top.getProperty('rootAtTop');
        const childCount = n === 1 && !top.Peek()[0].childNodes.length ? 0 : n;
        const children = [];
        do {
            if (children.length) {
                children.unshift(parser.create('node', 'mtd', [], {}));
            }
            children.unshift(parser.create('node', 'mtd', [top.Pop()], {
                rowalign: rootAtTop ? 'top' : 'bottom',
            }));
            n--;
        } while (n > 0);
        const row = parser.create('node', 'mtr', children, {});
        const table = parser.create('node', 'mtable', [row], {
            framespacing: '0 0',
        });
        const conclusion = parseFCenterLine(parser, name);
        const style = top.getProperty('currentLine');
        if (style !== top.getProperty('line')) {
            top.setProperty('currentLine', top.getProperty('line'));
        }
        const rule = createRule(parser, table, [conclusion], top.getProperty('left'), top.getProperty('right'), style, rootAtTop);
        top.setProperty('left', null);
        top.setProperty('right', null);
        BussproofsUtil.setProperty(rule, 'inference', childCount);
        parser.configuration.addNode('inference', rule);
        top.Push(rule);
    },
};
export default BussproofsMethods;
//# sourceMappingURL=BussproofsMethods.js.map