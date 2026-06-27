export function CommonMfencedMixin(Base) {
    return class CommonMfencedMixin extends Base {
        createMrow() {
            const mmlFactory = this.node.factory;
            const mrow = mmlFactory.create('inferredMrow');
            mrow.inheritAttributesFrom(this.node);
            this.mrow = this.wrap(mrow);
            this.mrow.parent = this;
        }
        addMrowChildren() {
            const mfenced = this.node;
            const mrow = this.mrow;
            this.addMo(mfenced.open);
            if (this.childNodes.length) {
                mrow.childNodes.push(this.childNodes[0]);
            }
            let i = 0;
            for (const child of this.childNodes.slice(1)) {
                this.addMo(mfenced.separators[i++]);
                mrow.childNodes.push(child);
            }
            this.addMo(mfenced.close);
            mrow.stretchChildren();
        }
        addMo(node) {
            if (!node)
                return;
            const mo = this.wrap(node);
            this.mrow.childNodes.push(mo);
            mo.parent = this.mrow;
        }
        constructor(factory, node, parent = null) {
            super(factory, node, parent);
            this.mrow = null;
            this.createMrow();
            this.addMrowChildren();
        }
        computeBBox(bbox, recompute = false) {
            bbox.updateFrom(this.mrow.getOuterBBox());
            this.setChildPWidths(recompute);
        }
        get breakCount() {
            return this.mrow.breakCount;
        }
        computeLineBBox(i) {
            return this.mrow.getLineBBox(i);
        }
    };
}
//# sourceMappingURL=mfenced.js.map