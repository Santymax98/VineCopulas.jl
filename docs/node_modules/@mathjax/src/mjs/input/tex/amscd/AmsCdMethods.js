import TexParser from '../TexParser.js';
import { Other } from '../base/BaseConfiguration.js';
import { TEXCLASS } from '../../../core/MmlTree/MmlNode.js';
import NodeUtil from '../NodeUtil.js';
const AmsCdMethods = {
    CD(parser, begin) {
        parser.Push(begin);
        const item = parser.itemFactory.create('array');
        const options = parser.configuration.options.amscd;
        item.setProperties({
            minw: parser.stack.env.CD_minw || options.harrowsize,
            minh: parser.stack.env.CD_minh || options.varrowsize,
        });
        item.arraydef = {
            columnalign: 'center',
            columnspacing: options.colspace,
            rowspacing: options.rowspace,
            displaystyle: true,
        };
        return item;
    },
    arrow(parser, name) {
        const i = parser.i;
        const c = parser.GetNext();
        if (!c.match(/[><VA.|=]/)) {
            parser.i = i;
            return Other(parser, name);
        }
        else {
            parser.i++;
        }
        let first = parser.stack.Top();
        if (!first.isKind('array') || first.Size()) {
            AmsCdMethods.cell(parser, name);
            first = parser.stack.Top();
        }
        const top = first;
        const arrowRow = top.table.length % 2 === 1;
        let n = (top.row.length + (arrowRow ? 0 : 1)) % 2;
        while (n) {
            AmsCdMethods.cell(parser, name);
            n--;
        }
        let mml;
        const hdef = { minsize: top.getProperty('minw'), stretchy: true };
        const vdef = {
            minsize: top.getProperty('minh'),
            stretchy: true,
            symmetric: true,
            lspace: 0,
            rspace: 0,
        };
        if (c === '|') {
            mml = parser.create('token', 'mo', vdef, '\u2225');
        }
        else if (c === '=') {
            mml = parser.create('token', 'mo', hdef, '=');
        }
        else if (c !== '.') {
            const arrow = {
                '>': '\u2192',
                '<': '\u2190',
                V: '\u2193',
                A: '\u2191',
            }[c];
            let a = parser.GetUpTo(name + c, c);
            const b = parser.GetUpTo(name + c, c);
            if (c === '>' || c === '<') {
                mml = parser.create('token', 'mo', hdef, arrow);
                if (!a) {
                    a = '\\kern ' + top.getProperty('minw');
                }
                const pad = { width: '+.67em', lspace: '.33em' };
                mml = parser.create('node', 'munderover', [mml]);
                const nodeA = new TexParser(a, parser.stack.env, parser.configuration).mml();
                const mpadded = parser.create('node', 'mpadded', [nodeA], pad);
                NodeUtil.setAttribute(mpadded, 'voffset', '.1em');
                NodeUtil.setChild(mml, mml.over, mpadded);
                if (b) {
                    const nodeB = new TexParser(b, parser.stack.env, parser.configuration).mml();
                    NodeUtil.setChild(mml, mml.under, parser.create('node', 'mpadded', [nodeB], pad));
                }
                if (parser.configuration.options.amscd.hideHorizontalLabels) {
                    mml = parser.create('node', 'mpadded', [mml], {
                        depth: 0,
                        height: '.67em',
                    });
                }
            }
            else {
                const arrowNode = parser.create('token', 'mo', vdef, arrow);
                mml = arrowNode;
                if (a || b) {
                    mml = parser.create('node', 'mrow');
                    if (a) {
                        NodeUtil.appendChildren(mml, [
                            new TexParser('\\scriptstyle\\raise.125em{\\vcenter{\\llap{' + a + '}}}', parser.stack.env, parser.configuration).mml(),
                        ]);
                    }
                    arrowNode.texClass = TEXCLASS.ORD;
                    NodeUtil.appendChildren(mml, [arrowNode]);
                    if (b) {
                        NodeUtil.appendChildren(mml, [
                            new TexParser('\\scriptstyle\\raise.125em{\\vcenter{\\rlap{' + b + '}}}', parser.stack.env, parser.configuration).mml(),
                        ]);
                    }
                }
            }
        }
        if (mml) {
            parser.Push(mml);
        }
        AmsCdMethods.cell(parser, name);
    },
    cell(parser, name) {
        const top = parser.stack.Top();
        if ((top.table || []).length % 2 === 0 && (top.row || []).length === 0) {
            parser.Push(parser.create('node', 'mpadded', [], { height: '8.5pt', depth: '2pt' }));
        }
        parser.Push(parser.itemFactory
            .create('cell')
            .setProperties({ isEntry: true, name: name }));
    },
    minCDarrowwidth(parser, name) {
        parser.stack.env.CD_minw = parser.GetDimen(name);
    },
    minCDarrowheight(parser, name) {
        parser.stack.env.CD_minh = parser.GetDimen(name);
    },
};
export default AmsCdMethods;
//# sourceMappingURL=AmsCdMethods.js.map