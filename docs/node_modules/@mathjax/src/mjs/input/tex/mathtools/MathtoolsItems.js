import { MultlineItem } from '../ams/AmsItems.js';
import NodeUtil from '../NodeUtil.js';
import { TexConstant } from '../TexConstants.js';
export class MultlinedItem extends MultlineItem {
    get kind() {
        return 'multlined';
    }
    EndTable() {
        if (this.Size() || this.row.length) {
            this.EndEntry();
            this.EndRow();
        }
        if (this.table.length > 1) {
            const options = this.factory.configuration.options.mathtools;
            const gap = options['multlined-gap'];
            const firstskip = options['firstline-afterskip'] || gap;
            const lastskip = options['lastline-preskip'] || gap;
            const first = NodeUtil.getChildren(this.table[0])[0];
            if (NodeUtil.getAttribute(first, 'columnalign') !== TexConstant.Align.RIGHT) {
                first.appendChild(this.create('node', 'mspace', [], { width: firstskip }));
            }
            const last = NodeUtil.getChildren(this.table[this.table.length - 1])[0];
            if (NodeUtil.getAttribute(last, 'columnalign') !== TexConstant.Align.LEFT) {
                const top = NodeUtil.getChildren(last)[0];
                top.childNodes.unshift(null);
                const space = this.create('node', 'mspace', [], { width: lastskip });
                NodeUtil.setChild(top, 0, space);
            }
        }
        super.EndTable.call(this);
    }
}
//# sourceMappingURL=MathtoolsItems.js.map