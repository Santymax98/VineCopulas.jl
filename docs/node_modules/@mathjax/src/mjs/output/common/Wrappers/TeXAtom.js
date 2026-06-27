export function CommonTeXAtomMixin(Base) {
    return class CommonTeXAtomMixin extends Base {
        computeBBox(bbox, recompute = false) {
            super.computeBBox(bbox, recompute);
            if (this.childNodes[0] && this.childNodes[0].bbox.ic) {
                bbox.ic = this.childNodes[0].bbox.ic;
            }
        }
    };
}
//# sourceMappingURL=TeXAtom.js.map