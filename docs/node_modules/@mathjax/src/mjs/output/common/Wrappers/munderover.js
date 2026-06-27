export function CommonMunderMixin(Base) {
    return class CommonMunderMixin extends Base {
        get scriptChild() {
            return this.childNodes[this.node.under];
        }
        constructor(...args) {
            super(...args);
            this.stretchChildren();
        }
        computeBBox(bbox, recompute = false) {
            if (this.hasMovableLimits()) {
                super.computeBBox(bbox, recompute);
                return;
            }
            bbox.empty();
            const basebox = this.baseChild.getOuterBBox();
            const underbox = this.scriptChild.getOuterBBox();
            const v = this.getUnderKV(basebox, underbox)[1];
            const delta = this.isLineBelow
                ? 0
                : this.getDelta(this.scriptChild, true);
            const [bw, uw] = this.getDeltaW([basebox, underbox], [0, -delta]);
            bbox.combine(basebox, bw, 0);
            bbox.combine(underbox, uw, v);
            bbox.d += this.font.params.big_op_spacing5;
            bbox.clean();
            this.setChildPWidths(recompute);
        }
    };
}
export function CommonMoverMixin(Base) {
    return class CommonMoverMixin extends Base {
        get scriptChild() {
            return this.childNodes[this.node.over];
        }
        constructor(...args) {
            super(...args);
            this.stretchChildren();
        }
        computeBBox(bbox) {
            if (this.hasMovableLimits()) {
                super.computeBBox(bbox);
                return;
            }
            bbox.empty();
            const basebox = this.baseChild.getOuterBBox();
            const overbox = this.scriptChild.getOuterBBox();
            if (this.node.attributes.get('accent')) {
                basebox.h = Math.max(basebox.h, this.font.params.x_height * this.baseScale);
            }
            const u = this.getOverKU(basebox, overbox)[1];
            const delta = this.isLineAbove ? 0 : this.getDelta(this.scriptChild);
            const [bw, ow] = this.getDeltaW([basebox, overbox], [0, delta]);
            bbox.combine(basebox, bw, 0);
            bbox.combine(overbox, ow, u);
            bbox.h += this.font.params.big_op_spacing5;
            bbox.clean();
        }
    };
}
export function CommonMunderoverMixin(Base) {
    return class CommonMunderoverMixin extends Base {
        get underChild() {
            return this.childNodes[this.node.under];
        }
        get overChild() {
            return this.childNodes[this.node.over];
        }
        get subChild() {
            return this.underChild;
        }
        get supChild() {
            return this.overChild;
        }
        constructor(...args) {
            super(...args);
            this.stretchChildren();
        }
        computeBBox(bbox) {
            if (this.hasMovableLimits()) {
                super.computeBBox(bbox);
                return;
            }
            bbox.empty();
            const overbox = this.overChild.getOuterBBox();
            const basebox = this.baseChild.getOuterBBox();
            const underbox = this.underChild.getOuterBBox();
            if (this.node.attributes.get('accent')) {
                basebox.h = Math.max(basebox.h, this.font.params.x_height * this.baseScale);
            }
            const u = this.getOverKU(basebox, overbox)[1];
            const v = this.getUnderKV(basebox, underbox)[1];
            const odelta = this.getDelta(this.overChild);
            const udelta = this.getDelta(this.underChild, true);
            const [bw, uw, ow] = this.getDeltaW([basebox, underbox, overbox], [0, this.isLineBelow ? 0 : -udelta, this.isLineAbove ? 0 : odelta]);
            bbox.combine(basebox, bw, 0);
            bbox.combine(overbox, ow, u);
            bbox.combine(underbox, uw, v);
            const z = this.font.params.big_op_spacing5;
            bbox.h += z;
            bbox.d += z;
            bbox.clean();
        }
    };
}
//# sourceMappingURL=munderover.js.map