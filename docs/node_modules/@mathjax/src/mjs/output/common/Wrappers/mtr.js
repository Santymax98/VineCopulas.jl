import { DIRECTION } from '../FontData.js';
export function CommonMtrMixin(Base) {
    return class CommonMtrMixin extends Base {
        get numCells() {
            return this.childNodes.length;
        }
        get labeled() {
            return false;
        }
        get tableCells() {
            return this.childNodes;
        }
        getChild(i) {
            return this.childNodes[i];
        }
        getChildBBoxes() {
            return this.childNodes.map((cell) => cell.getBBox());
        }
        stretchChildren(HD = null) {
            const stretchy = [];
            const children = this.labeled
                ? this.childNodes.slice(1)
                : this.childNodes;
            for (const mtd of children) {
                const child = mtd.childNodes[0];
                if (child.canStretch(DIRECTION.Vertical)) {
                    stretchy.push(child);
                }
            }
            const count = stretchy.length;
            const nodeCount = this.childNodes.length;
            if (count && nodeCount > 1 && !HD) {
                let H = 0;
                let D = 0;
                const all = count > 1 && count === nodeCount;
                for (const mtd of children) {
                    const child = mtd.childNodes[0];
                    const noStretch = child.stretch.dir === DIRECTION.None;
                    if (all || noStretch) {
                        const { h, d } = child.getBBox(noStretch);
                        if (h > H) {
                            H = h;
                        }
                        if (d > D) {
                            D = d;
                        }
                    }
                }
                HD = [H, D];
            }
            if (HD) {
                for (const child of stretchy) {
                    const rscale = child.coreRScale();
                    child.coreMO().getStretchedVariant(HD.map((x) => x * rscale));
                }
            }
        }
        get fixesPWidth() {
            return false;
        }
    };
}
export function CommonMlabeledtrMixin(Base) {
    return class CommonMlabeledtrMixin extends Base {
        get numCells() {
            return Math.max(0, this.childNodes.length - 1);
        }
        get labeled() {
            return true;
        }
        get tableCells() {
            return this.childNodes.slice(1);
        }
        getChild(i) {
            return this.childNodes[i + 1];
        }
        getChildBBoxes() {
            return this.childNodes.slice(1).map((cell) => cell.getBBox());
        }
    };
}
//# sourceMappingURL=mtr.js.map