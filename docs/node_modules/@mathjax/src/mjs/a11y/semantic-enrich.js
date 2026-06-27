import { STATE, newState, } from '../core/MathItem.js';
import { SerializedMmlVisitor } from '../core/MmlTree/SerializedMmlVisitor.js';
import { expandable } from '../util/Options.js';
import * as Sre from './sre.js';
newState('ENRICHED', STATE.COMPILED + 10);
export class enrichVisitor extends SerializedMmlVisitor {
    visitTree(node, math) {
        this.mactionId = 0;
        const mml = super.visitTree(node);
        if (this.mactionId) {
            math.inputData.hasMaction = true;
        }
        return mml;
    }
    visitHtmlNode(node, _space) {
        return node.getSerializedXML();
    }
    visitMactionNode(node, space) {
        const [nl, endspace] = node.childNodes.length === 0 ? ['', ''] : ['\n', space];
        const children = this.childNodeMml(node, space + '  ', nl);
        let attributes = this.getAttributes(node);
        if (node.attributes.get('actiontype') === 'toggle') {
            const id = ++this.mactionId;
            node.setProperty('mactionId', id);
            attributes =
                ` data-maction-id="${id}" selection="${node.attributes.get('selection')}"` +
                    attributes
                        .replace(/ selection="\d+"/, '')
                        .replace(/ data-maction-id="\d+"/, '');
        }
        return (`${space}<maction${attributes}>` +
            (children.match(/\S/) ? nl + children + endspace : '') +
            '</maction>');
    }
}
export function EnrichedMathItemMixin(BaseMathItem, MmlJax, toMathML) {
    return class extends BaseMathItem {
        constructor() {
            super(...arguments);
            this.toMathML = toMathML;
        }
        serializeMml(node) {
            if ('outerHTML' in node) {
                return node.outerHTML;
            }
            if (typeof Element !== 'undefined' &&
                typeof window !== 'undefined' &&
                node instanceof Element) {
                const div = window.document.createElement('div');
                div.appendChild(node);
                return div.innerHTML;
            }
            return node.toString();
        }
        enrich(document, force = false) {
            if (this.state() >= STATE.ENRICHED)
                return;
            if (!this.isEscaped && (document.options.enableEnrichment || force)) {
                const math = new document.options.MathItem('', MmlJax);
                try {
                    let mml;
                    if (!this.inputData.originalMml) {
                        mml = this.inputData.originalMml = this.toMathML(this.root, this);
                    }
                    else {
                        mml = this.adjustSelections();
                    }
                    const enriched = Sre.toEnriched(mml);
                    this.inputData.enrichedMml = math.math = this.serializeMml(enriched);
                    math.math = math.math
                        .replace(/ role="treeitem"/g, ' data-speech-node="true"')
                        .replace(/ aria-level/g, ' data-semantic-level-number')
                        .replace(/ aria-(?:posinset|owns|setsize)=".*?"/g, '');
                    math.display = this.display;
                    math.compile(document);
                    this.root = math.root;
                }
                catch (err) {
                    document.options.enrichError(document, this, err);
                }
            }
            this.state(STATE.ENRICHED);
        }
        toEnriched(mml) {
            return this.serializeMml(Sre.toEnriched(mml));
        }
        unEnrich(document) {
            const mml = this.inputData.originalMml;
            if (!mml)
                return;
            const math = new document.options.MathItem('', MmlJax);
            math.math = mml;
            math.display = this.display;
            math.compile(document);
            this.root = math.root;
        }
        adjustSelections() {
            const mml = this.inputData.originalMml;
            if (!this.inputData.hasMaction)
                return mml;
            const maction = [];
            this.root.walkTree((node) => {
                if (node.isKind('maction')) {
                    maction[node.attributes.get('data-maction-id')] = node;
                }
            });
            return mml.replace(/(data-maction-id="(\d+)" selection=)"\d+"/g, (_match, prefix, id) => `${prefix}"${maction[id].attributes.get('selection')}"`);
        }
    };
}
export function EnrichedMathDocumentMixin(BaseDocument, MmlJax) {
    var _a;
    return _a = class extends BaseDocument {
            constructor(...args) {
                super(...args);
                MmlJax.setMmlFactory(this.mmlFactory);
                const ProcessBits = this.constructor
                    .ProcessBits;
                if (!ProcessBits.has('enriched')) {
                    ProcessBits.allocate('enriched');
                }
                const visitor = new enrichVisitor(this.mmlFactory);
                const toMathML = (node, math) => visitor.visitTree(node, math);
                this.options.MathItem = EnrichedMathItemMixin(this.options.MathItem, MmlJax, toMathML);
            }
            enrich() {
                if (!this.processed.isSet('enriched')) {
                    if (this.options.enableEnrichment) {
                        Sre.setupEngine(this.options.sre);
                        for (const math of this.math) {
                            math.enrich(this);
                        }
                    }
                    this.processed.set('enriched');
                }
                return this;
            }
            enrichError(_doc, _math, err) {
                console.warn('Enrichment error:', err);
            }
            state(state, restore = false) {
                super.state(state, restore);
                if (state < STATE.ENRICHED) {
                    this.processed.clear('enriched');
                    if (state >= STATE.COMPILED) {
                        for (const item of this.math) {
                            item.unEnrich(this);
                        }
                    }
                }
                return this;
            }
        },
        _a.OPTIONS = Object.assign(Object.assign({}, BaseDocument.OPTIONS), { enableEnrichment: true, enrichError: (doc, math, err) => doc.enrichError(doc, math, err), renderActions: expandable(Object.assign(Object.assign({}, BaseDocument.OPTIONS.renderActions), { enrich: [STATE.ENRICHED] })), sre: expandable({
                speech: 'none',
                locale: 'en',
                domain: 'clearspeak',
                style: 'default',
                braille: 'nemeth',
                structure: true,
                aria: true,
            }) }),
        _a;
}
export function EnrichHandler(handler, MmlJax) {
    MmlJax.setAdaptor(handler.adaptor);
    handler.documentClass = EnrichedMathDocumentMixin(handler.documentClass, MmlJax);
    return handler;
}
//# sourceMappingURL=semantic-enrich.js.map