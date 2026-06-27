import { AbstractMmlTokenNode, TEXCLASS } from '../MmlNode.js';
export class MmlMglyph extends AbstractMmlTokenNode {
    constructor() {
        super(...arguments);
        this.texclass = TEXCLASS.ORD;
    }
    get kind() {
        return 'mglyph';
    }
    verifyAttributes(options) {
        const { src, fontfamily, index } = this.attributes.getList('src', 'fontfamily', 'index');
        if (src === '' && (fontfamily === '' || index === '')) {
            this.mError('mglyph must have either src or fontfamily and index attributes', options, true);
        }
        else {
            super.verifyAttributes(options);
        }
    }
}
MmlMglyph.defaults = Object.assign(Object.assign({}, AbstractMmlTokenNode.defaults), { alt: '', src: '', index: '', width: 'auto', height: 'auto', valign: '0em' });
//# sourceMappingURL=mglyph.js.map