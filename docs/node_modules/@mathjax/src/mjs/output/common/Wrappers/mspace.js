import { BBox } from '../../../util/BBox.js';
import { LineBBox } from '../LineBBox.js';
export function CommonMspaceMixin(Base) {
    return class CommonMspaceMixin extends Base {
        get canBreak() {
            return this.node.canBreak;
        }
        get breakCount() {
            return this.breakStyle ? 1 : 0;
        }
        setBreakStyle(linebreak = '') {
            this.breakStyle =
                linebreak ||
                    (this.node.hasNewline ||
                        this.node.getProperty('forcebreak')
                        ? 'before'
                        : '');
        }
        constructor(factory, node, parent = null) {
            super(factory, node, parent);
            this.setBreakStyle();
        }
        computeBBox(bbox, _recompute = false) {
            const attributes = this.node.attributes;
            bbox.w = this.length2em(attributes.get('width'), 0);
            bbox.h = this.length2em(attributes.get('height'), 0);
            bbox.d = this.length2em(attributes.get('depth'), 0);
        }
        computeLineBBox(i) {
            const leadingString = this.node.attributes.get('data-lineleading');
            const leading = this.length2em(leadingString, this.linebreakOptions.lineleading);
            const bbox = LineBBox.from(BBox.zero(), leading);
            if (i === 1) {
                bbox.getIndentData(this.node);
                bbox.w = this.getBBox().w;
                bbox.isFirst = bbox.w === 0;
            }
            return bbox;
        }
    };
}
//# sourceMappingURL=mspace.js.map