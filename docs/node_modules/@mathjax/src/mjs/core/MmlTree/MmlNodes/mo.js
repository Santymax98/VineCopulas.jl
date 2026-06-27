import { AbstractMmlTokenNode, TEXCLASS, } from '../MmlNode.js';
import { OPTABLE, OPDEF, getRange, MMLSPACING, } from '../OperatorDictionary.js';
import { unicodeChars, unicodeString } from '../../../util/string.js';
export class MmlMo extends AbstractMmlTokenNode {
    constructor() {
        super(...arguments);
        this._texClass = null;
        this.lspace = 5 / 18;
        this.rspace = 5 / 18;
    }
    get texClass() {
        if (this._texClass === null) {
            return this.getOperatorDef(this.getText())[2];
        }
        return this._texClass;
    }
    set texClass(value) {
        this._texClass = value;
    }
    get kind() {
        return 'mo';
    }
    get isEmbellished() {
        return true;
    }
    coreParent() {
        let embellished = null;
        let parent = this;
        const math = this.factory.getNodeClass('math');
        while (parent &&
            parent.isEmbellished &&
            parent.coreMO() === this &&
            !(parent instanceof math)) {
            embellished = parent;
            parent = parent.parent;
        }
        return embellished || this;
    }
    coreText(parent) {
        if (!parent) {
            return '';
        }
        if (parent.isEmbellished) {
            return parent.coreMO().getText();
        }
        while ((((parent.isKind('mrow') ||
            parent.isKind('TeXAtom') ||
            parent.isKind('mstyle') ||
            parent.isKind('mphantom')) &&
            parent.childNodes.length === 1) ||
            parent.isKind('munderover')) &&
            parent.childNodes[0]) {
            parent = parent.childNodes[0];
        }
        return parent.isToken ? parent.getText() : '';
    }
    hasSpacingAttributes() {
        return this.attributes.isSet('lspace') || this.attributes.isSet('rspace');
    }
    get isAccent() {
        let accent = false;
        const node = this.coreParent().parent;
        if (node) {
            const key = node.isKind('mover')
                ? node.childNodes[node.over].coreMO()
                    ? 'accent'
                    : ''
                : node.isKind('munder')
                    ? node.childNodes[node.under].coreMO()
                        ? 'accentunder'
                        : ''
                    : node.isKind('munderover')
                        ? this === node.childNodes[node.over].coreMO()
                            ? 'accent'
                            : this === node.childNodes[node.under].coreMO()
                                ? 'accentunder'
                                : ''
                        : '';
            if (key) {
                const value = node.attributes.getExplicit(key);
                accent = (value !== undefined ? accent : this.attributes.get('accent'));
            }
        }
        return accent;
    }
    setTeXclass(prev) {
        const { form, fence } = this.attributes.getList('form', 'fence');
        if (this.getProperty('texClass') === undefined &&
            this.hasSpacingAttributes()) {
            return null;
        }
        if (fence && this.texClass === TEXCLASS.REL) {
            if (form === 'prefix') {
                this.texClass = TEXCLASS.OPEN;
            }
            if (form === 'postfix') {
                this.texClass = TEXCLASS.CLOSE;
            }
        }
        return this.adjustTeXclass(prev);
    }
    adjustTeXclass(prev) {
        const texClass = this.texClass;
        let prevClass = this.prevClass;
        if (texClass === TEXCLASS.NONE) {
            return prev;
        }
        if (prev) {
            if (prev.getProperty('autoOP') &&
                (texClass === TEXCLASS.BIN || texClass === TEXCLASS.REL)) {
                prevClass = prev.texClass = TEXCLASS.ORD;
            }
            prevClass = this.prevClass = prev.texClass || TEXCLASS.ORD;
            this.prevLevel = this.attributes.getInherited('scriptlevel');
        }
        else {
            prevClass = this.prevClass = TEXCLASS.NONE;
        }
        if (texClass === TEXCLASS.BIN &&
            (prevClass === TEXCLASS.NONE ||
                prevClass === TEXCLASS.BIN ||
                prevClass === TEXCLASS.OP ||
                prevClass === TEXCLASS.REL ||
                prevClass === TEXCLASS.OPEN ||
                prevClass === TEXCLASS.PUNCT)) {
            this.texClass = TEXCLASS.ORD;
        }
        else if (prevClass === TEXCLASS.BIN &&
            (texClass === TEXCLASS.REL ||
                texClass === TEXCLASS.CLOSE ||
                texClass === TEXCLASS.PUNCT)) {
            prev.texClass = this.prevClass = TEXCLASS.ORD;
        }
        else if (texClass === TEXCLASS.BIN) {
            let child = null;
            let parent = this.parent;
            while (parent &&
                parent.parent &&
                parent.isEmbellished &&
                (parent.childNodes.length === 1 ||
                    (!parent.isKind('mrow') && parent.core() === child))) {
                child = parent;
                parent = parent.parent;
            }
            child = child || this;
            if (parent.childNodes[parent.childNodes.length - 1] === child) {
                this.texClass = TEXCLASS.ORD;
            }
        }
        return this;
    }
    setInheritedAttributes(attributes = {}, display = false, level = 0, prime = false) {
        super.setInheritedAttributes(attributes, display, level, prime);
        const mo = this.getText();
        this.checkOperatorTable(mo);
        this.checkPseudoScripts(mo);
        this.checkPrimes(mo);
        this.checkMathAccent(mo);
    }
    getOperatorDef(mo) {
        const [form1, form2, form3] = this.handleExplicitForm(this.getForms());
        this.attributes.setInherited('form', form1);
        const CLASS = this.constructor;
        const OPTABLE = CLASS.OPTABLE;
        const def = OPTABLE[form1][mo] || OPTABLE[form2][mo] || OPTABLE[form3][mo];
        if (def) {
            return def;
        }
        this.setProperty('noDictDef', true);
        const limits = this.attributes.get('movablelimits');
        const isOP = !!mo.match(CLASS.opPattern);
        if ((isOP || limits) && this.getProperty('texClass') === undefined) {
            return OPDEF(1, 2, TEXCLASS.OP);
        }
        const range = getRange(mo);
        const [l, r] = CLASS.MMLSPACING[range[2]];
        return OPDEF(l, r, range[2]);
    }
    checkOperatorTable(mo) {
        const def = this.getOperatorDef(mo);
        if (this.getProperty('texClass') === undefined) {
            this.texClass = def[2];
        }
        for (const name of Object.keys(def[3] || {})) {
            this.attributes.setInherited(name, def[3][name]);
        }
        this.lspace = def[0] / 18;
        this.rspace = def[1] / 18;
    }
    getForms() {
        let core = null;
        let parent = this.parent;
        let Parent = this.Parent;
        while (Parent && Parent.isEmbellished) {
            core = parent;
            parent = Parent.parent;
            Parent = Parent.Parent;
        }
        core = core || this;
        if (parent &&
            parent.isKind('mrow') &&
            parent.nonSpaceLength() !== 1) {
            if (parent.firstNonSpace() === core) {
                return ['prefix', 'infix', 'postfix'];
            }
            if (parent.lastNonSpace() === core) {
                return ['postfix', 'infix', 'prefix'];
            }
        }
        return ['infix', 'prefix', 'postfix'];
    }
    handleExplicitForm(forms) {
        if (this.attributes.isSet('form')) {
            const form = this.attributes.get('form');
            forms = [form].concat(forms.filter((name) => name !== form));
        }
        return forms;
    }
    checkPseudoScripts(mo) {
        const PSEUDOSCRIPTS = this.constructor.pseudoScripts;
        if (!mo.match(PSEUDOSCRIPTS))
            return;
        const parent = this.coreParent().Parent;
        const isPseudo = !parent || !(parent.isKind('msubsup') && !parent.isKind('msub'));
        this.setProperty('pseudoscript', isPseudo);
        if (isPseudo) {
            this.attributes.setInherited('lspace', 0);
            this.attributes.setInherited('rspace', 0);
        }
    }
    checkPrimes(mo) {
        const PRIMES = this.constructor.primes;
        if (!mo.match(PRIMES))
            return;
        const REMAP = this.constructor.remapPrimes;
        const primes = unicodeString(unicodeChars(mo).map((c) => REMAP[c]));
        this.setProperty('primes', primes);
    }
    checkMathAccent(mo) {
        const parent = this.Parent;
        if (this.getProperty('mathaccent') !== undefined ||
            !parent ||
            !parent.isKind('munderover')) {
            return;
        }
        const [base, under, over] = parent.childNodes;
        if (base.isEmbellished && base.coreMO() === this)
            return;
        const isUnder = !!(under && under.isEmbellished && under.coreMO() === this);
        const isOver = !!(over && over.isEmbellished && under.coreMO() === this);
        if (!isUnder && !isOver)
            return;
        if (this.isMathAccent(mo)) {
            this.setProperty('mathaccent', true);
        }
        else if (this.isMathAccentWithWidth(mo)) {
            this.setProperty('mathaccent', false);
        }
    }
    isMathAccent(mo = this.getText()) {
        const MATHACCENT = this.constructor.mathaccents;
        return !!mo.match(MATHACCENT);
    }
    isMathAccentWithWidth(mo = this.getText()) {
        const MATHACCENT = this.constructor.mathaccentsWithWidth;
        return !!mo.match(MATHACCENT);
    }
}
MmlMo.defaults = Object.assign(Object.assign({}, AbstractMmlTokenNode.defaults), { form: 'infix', fence: false, separator: false, lspace: 'thickmathspace', rspace: 'thickmathspace', stretchy: false, symmetric: false, maxsize: 'infinity', minsize: '0em', largeop: false, movablelimits: false, accent: false, linebreak: 'auto', lineleading: '100%', linebreakstyle: 'before', indentalign: 'auto', indentshift: '0', indenttarget: '', indentalignfirst: 'indentalign', indentshiftfirst: 'indentshift', indentalignlast: 'indentalign', indentshiftlast: 'indentshift' });
MmlMo.MMLSPACING = MMLSPACING;
MmlMo.OPTABLE = OPTABLE;
MmlMo.pseudoScripts = new RegExp([
    '^["\'*`',
    '\u00AA',
    '\u00B0',
    '\u00B2-\u00B4',
    '\u00B9',
    '\u00BA',
    '\u2018-\u201F',
    '\u2032-\u2037\u2057',
    '\u2070\u2071',
    '\u2074-\u207F',
    '\u2080-\u208E',
    ']+$'
].join(''));
MmlMo.primes = new RegExp([
    '^["\'',
    '\u2018-\u201F',
    ']+$',
].join(''));
MmlMo.opPattern = /^[a-zA-Z]{2,}$/;
MmlMo.remapPrimes = {
    0x0022: 0x2033,
    0x0027: 0x2032,
    0x2018: 0x2035,
    0x2019: 0x2032,
    0x201a: 0x2032,
    0x201b: 0x2035,
    0x201c: 0x2036,
    0x201d: 0x2033,
    0x201e: 0x2033,
    0x201f: 0x2036,
};
MmlMo.mathaccents = new RegExp([
    '^[',
    '\u00B4\u0301\u02CA',
    '\u0060\u0300\u02CB',
    '\u00A8\u0308',
    '\u007E\u0303\u02DC',
    '\u00AF\u0304\u02C9',
    '\u02D8\u0306',
    '\u02C7\u030C',
    '\u005E\u0302\u02C6',
    '\u20D0\u20D1',
    '\u20D6\u20D7\u20E1',
    '\u02D9\u0307',
    '\u02DA\u030A',
    '\u20DB',
    '\u20DC',
    ']$'
].join(''));
MmlMo.mathaccentsWithWidth = new RegExp([
    '^[',
    '\u2190\u2192\u2194',
    '\u23DC\u23DD',
    '\u23DE\u23DF',
    ']$'
].join(''));
//# sourceMappingURL=mo.js.map