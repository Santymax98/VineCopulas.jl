import { InfoDialog } from './InfoDialog.js';
import { SelectionBox, } from '#menu/selection_box.js';
export class SelectionDialog extends SelectionBox {
    constructor(title, signature, selections, order, grid, menu) {
        super(title, signature, order, grid);
        this.attachMenu(menu);
        const factory = menu.factory;
        this.selections = selections.map((x) => factory.get('selectionMenu')(factory, x, this));
    }
    post() {
        const jax = Array.from(Object.values(this.menu.jax)).filter((j) => !!j)[0];
        const dialog = new InfoDialog({
            title: this.title,
            message: '',
            adaptor: jax.adaptor,
            styles: {
                'mjx-dialog > div': {
                    padding: 0,
                },
            },
        });
        dialog.attach();
        this.contentDiv = dialog.content;
        this.display();
    }
    display() {
        const THIS = this;
        THIS.order();
        if (!this.selections.length) {
            return;
        }
        const outerDivs = [];
        let maxWidth = 0;
        let balancedColumn = [];
        const chunks = THIS.getChunkSize(this.selections.length);
        for (let i = 0; i < this.selections.length; i += chunks) {
            const sels = this.selections.slice(i, i + chunks);
            const [div, width, height, column] = THIS.rowDiv(sels);
            outerDivs.push(div);
            maxWidth = Math.max(maxWidth, width);
            sels.forEach((sel) => (sel.html.style.height = height + 'px'));
            balancedColumn = THIS.combineColumn(balancedColumn, column);
        }
        if (THIS._balanced) {
            THIS.balanceColumn(outerDivs, balancedColumn);
            maxWidth = balancedColumn.reduce((x, y) => x + y - 2, 20);
        }
        outerDivs.forEach((div) => (div.style.width = maxWidth + 'px'));
    }
}
//# sourceMappingURL=SelectionDialog.js.map