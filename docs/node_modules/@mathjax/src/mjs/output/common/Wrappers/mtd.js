export function CommonMtdMixin(Base) {
    return class CommonMtdMixin extends Base {
        get fixesPWidth() {
            return false;
        }
        invalidateBBox() {
            this.bboxComputed = false;
            this.lineBBox = [];
        }
        getWrapWidth(_j) {
            const table = this.parent.parent;
            const row = this.parent;
            const i = this.node.childPosition() - (row.labeled ? 1 : 0);
            return (typeof table.cWidths[i] === 'number'
                ? table.cWidths[i]
                : table.getTableData().W[i]);
        }
        getChildAlign(_i) {
            return this.node.attributes.get('columnalign');
        }
    };
}
//# sourceMappingURL=mtd.js.map