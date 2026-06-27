import { BBox } from '../../util/BBox.js';
export class LineBBox extends BBox {
    static from(bbox, leading, indent = null) {
        const nbox = new this();
        Object.assign(nbox, bbox);
        nbox.lineLeading = leading;
        if (indent) {
            nbox.indentData = indent;
        }
        return nbox;
    }
    constructor(def, start = null) {
        super(def);
        this.indentData = null;
        this.isFirst = false;
        this.originalL = this.L;
        if (start) {
            this.start = start;
        }
    }
    append(cbox) {
        if (this.isFirst) {
            cbox.originalL += cbox.L;
            cbox.L = 0;
        }
        if (cbox.indentData) {
            this.indentData = cbox.indentData;
        }
        this.lineLeading = cbox.lineLeading;
        super.append(cbox);
        this.isFirst = cbox.isFirst;
    }
    copy() {
        const bbox = LineBBox.from(this, this.lineLeading);
        bbox.indentData = this.indentData;
        bbox.lineLeading = this.lineLeading;
        return bbox;
    }
    getIndentData(node) {
        let { indentalign, indentshift, indentalignfirst, indentshiftfirst, indentalignlast, indentshiftlast, } = node.attributes.getAllAttributes();
        if (indentalignfirst === 'indentalign') {
            indentalignfirst = node.attributes.getInherited('indentalign');
        }
        if (indentshiftfirst === 'indentshift') {
            indentshiftfirst = node.attributes.getInherited('indentshift');
        }
        if (indentalignlast === 'indentalign') {
            indentalignlast = indentalign;
        }
        if (indentshiftlast === 'indentshift') {
            indentshiftlast = indentshift;
        }
        this.indentData = [
            [indentalignfirst, indentshiftfirst],
            [indentalign, indentshift],
            [indentalignlast, indentshiftlast],
        ];
    }
    copyIndentData(bbox) {
        return bbox.indentData.map(([align, indent]) => [align, indent]);
    }
}
//# sourceMappingURL=LineBBox.js.map