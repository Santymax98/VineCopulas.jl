export function CommonMiMixin(Base) {
    return class CommonMiMixin extends Base {
        computeBBox(bbox, _recompute = false) {
            super.computeBBox(bbox);
            this.copySkewIC(bbox);
        }
    };
}
//# sourceMappingURL=mi.js.map