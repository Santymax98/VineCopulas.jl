import { ParseUtil } from '../ParseUtil.js';
import TexParser from '../TexParser.js';
export const EmpheqUtil = {
    splitOptions(text, allowed = null) {
        return ParseUtil.keyvalOptions(text, allowed, true);
    },
    columnCount(table) {
        let m = 0;
        for (const row of table.childNodes) {
            const n = row.childNodes.length - (row.isKind('mlabeledtr') ? 1 : 0);
            if (n > m)
                m = n;
        }
        return m;
    },
    cellBlock(tex, table, parser, env) {
        const mpadded = parser.create('node', 'mpadded', [], {
            height: 0,
            depth: 0,
            voffset: '-1height',
        });
        const result = new TexParser(tex, parser.stack.env, parser.configuration);
        const mml = result.mml();
        if (env && result.configuration.tags.label) {
            result.configuration.tags.currentTag.env = env;
            result.configuration.tags.getTag(true);
        }
        for (const child of mml.isInferred ? mml.childNodes : [mml]) {
            mpadded.appendChild(child);
        }
        mpadded.appendChild(parser.create('node', 'mphantom', [
            parser.create('node', 'mpadded', [table], { width: 0 }),
        ]));
        return mpadded;
    },
    topRowTable(original, parser) {
        const table = ParseUtil.copyNode(original, parser);
        table.setChildren(table.childNodes.slice(0, 1));
        table.attributes.set('align', 'baseline 1');
        return original.factory.create('mphantom', {}, [
            parser.create('node', 'mpadded', [table], { width: 0 }),
        ]);
    },
    rowspanCell(mtd, tex, table, parser, env) {
        mtd.appendChild(parser.create('node', 'mpadded', [
            this.cellBlock(tex, ParseUtil.copyNode(table, parser), parser, env),
            this.topRowTable(table, parser),
        ], { height: 0, depth: 0, voffset: 'height' }));
    },
    left(table, original, left, parser, env = '') {
        table.attributes.set('columnalign', 'right ' + table.attributes.get('columnalign'));
        table.attributes.set('columnspacing', '0em ' + table.attributes.get('columnspacing'));
        if (table.childNodes.length === 0) {
            table.appendChild(parser.create('node', 'mtr'));
        }
        let mtd;
        for (const row of table.childNodes.slice(0).reverse()) {
            mtd = parser.create('node', 'mtd');
            row.childNodes.unshift(mtd);
            mtd.parent = row;
            if (row.isKind('mlabeledtr')) {
                row.childNodes[0] = row.childNodes[1];
                row.childNodes[1] = mtd;
            }
        }
        this.rowspanCell(mtd, left, original, parser, env);
    },
    right(table, original, right, parser, env = '') {
        if (table.childNodes.length === 0) {
            table.appendChild(parser.create('node', 'mtr'));
        }
        const row = table.childNodes[0];
        const m = EmpheqUtil.columnCount(table) + (row.isKind('mlabeledtr') ? 1 : 0);
        while (row.childNodes.length < m) {
            row.appendChild(parser.create('node', 'mtd'));
        }
        const mtd = row.appendChild(parser.create('node', 'mtd'));
        EmpheqUtil.rowspanCell(mtd, right, original, parser, env);
        table.attributes.set('columnalign', (table.attributes.get('columnalign') || '')
            .split(/ /)
            .slice(0, m)
            .join(' ') + ' left');
        table.attributes.set('columnspacing', table.attributes.get('columnspacing')
            .split(/ /)
            .slice(0, m - 1)
            .join(' ') + ' 0em');
    },
    adjustTable(empheq, parser) {
        const left = empheq.getProperty('left');
        const right = empheq.getProperty('right');
        if (left || right) {
            const table = empheq.Last;
            const original = ParseUtil.copyNode(table, parser);
            if (left)
                this.left(table, original, left, parser);
            if (right)
                this.right(table, original, right, parser);
        }
    },
    allowEnv: {
        equation: true,
        align: true,
        gather: true,
        flalign: true,
        alignat: true,
        multline: true,
    },
    checkEnv(env) {
        return Object.hasOwn(this.allowEnv, env.replace(/\*$/, '')) || false;
    },
};
//# sourceMappingURL=EmpheqUtil.js.map