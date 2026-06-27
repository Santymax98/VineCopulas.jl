import { ArrayItem, EqnArrayItem } from '../base/BaseItems.js';
import { ParseUtil } from '../ParseUtil.js';
import NodeUtil from '../NodeUtil.js';
import TexError from '../TexError.js';
import { TexConstant } from '../TexConstants.js';
export class MultlineItem extends ArrayItem {
    constructor(factory, ...args) {
        super(factory);
        this.factory.configuration.tags.start('multline', true, args[0]);
    }
    get kind() {
        return 'multline';
    }
    EndEntry() {
        if (this.table.length) {
            ParseUtil.fixInitialMO(this.factory.configuration, this.nodes);
        }
        const shove = this.getProperty('shove');
        const mtd = this.create('node', 'mtd', this.nodes, shove ? { columnalign: shove } : {});
        this.setProperty('shove', null);
        this.row.push(mtd);
        this.Clear();
    }
    EndRow() {
        if (this.row.length !== 1) {
            throw new TexError('MultlineRowsOneCol', 'The rows within the %1 environment must have exactly one column', 'multline');
        }
        const row = this.create('node', 'mtr', this.row);
        this.table.push(row);
        this.row = [];
    }
    EndTable() {
        super.EndTable();
        if (this.table.length) {
            const m = this.table.length - 1;
            let label = -1;
            if (!NodeUtil.getAttribute(NodeUtil.getChildren(this.table[0])[0], 'columnalign')) {
                NodeUtil.setAttribute(NodeUtil.getChildren(this.table[0])[0], 'columnalign', TexConstant.Align.LEFT);
            }
            if (!NodeUtil.getAttribute(NodeUtil.getChildren(this.table[m])[0], 'columnalign')) {
                NodeUtil.setAttribute(NodeUtil.getChildren(this.table[m])[0], 'columnalign', TexConstant.Align.RIGHT);
            }
            const tag = this.factory.configuration.tags.getTag();
            if (tag) {
                label =
                    this.arraydef.side === TexConstant.Align.LEFT
                        ? 0
                        : this.table.length - 1;
                const mtr = this.table[label];
                const mlabel = this.create('node', 'mlabeledtr', [tag].concat(NodeUtil.getChildren(mtr)));
                NodeUtil.copyAttributes(mtr, mlabel);
                this.table[label] = mlabel;
            }
        }
        this.factory.configuration.tags.end();
    }
}
export class FlalignItem extends EqnArrayItem {
    get kind() {
        return 'flalign';
    }
    constructor(factory, name, numbered, padded, center) {
        super(factory);
        this.name = name;
        this.numbered = numbered;
        this.padded = padded;
        this.center = center;
        this.factory.configuration.tags.start(name, numbered, numbered);
    }
    EndEntry() {
        super.EndEntry();
        const n = this.getProperty('xalignat');
        if (!n)
            return;
        if (this.row.length > n) {
            throw new TexError('XalignOverflow', 'Extra %1 in row of %2', '&', this.name);
        }
    }
    EndRow() {
        let cell;
        const row = this.row;
        const n = this.getProperty('xalignat');
        while (row.length < n) {
            row.push(this.create('node', 'mtd'));
        }
        this.row = [];
        if (this.padded) {
            this.row.push(this.create('node', 'mtd'));
        }
        while ((cell = row.shift())) {
            this.row.push(cell);
            cell = row.shift();
            if (cell)
                this.row.push(cell);
            if (row.length || this.padded) {
                this.row.push(this.create('node', 'mtd'));
            }
        }
        if (this.row.length > this.maxrow) {
            this.maxrow = this.row.length;
        }
        super.EndRow();
        const mtr = this.table[this.table.length - 1];
        if (this.getProperty('zeroWidthLabel') && mtr.isKind('mlabeledtr')) {
            const mtd = NodeUtil.getChildren(mtr)[0];
            const side = this.factory.configuration.options['tagSide'];
            const def = Object.assign({ width: 0 }, (side === 'right' ? { lspace: '-1width' } : {}));
            const mpadded = this.create('node', 'mpadded', NodeUtil.getChildren(mtd), def);
            mtd.setChildren([mpadded]);
        }
    }
    EndTable() {
        super.EndTable();
        if (this.center) {
            if (this.maxrow <= 2) {
                const def = this.arraydef;
                delete def.width;
                delete this.global.indentalign;
            }
        }
    }
}
//# sourceMappingURL=AmsItems.js.map