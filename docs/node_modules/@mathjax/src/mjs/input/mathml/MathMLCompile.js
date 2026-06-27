import { AbstractMmlNode, TEXCLASS, } from '../../core/MmlTree/MmlNode.js';
import { userOptions, defaultOptions } from '../../util/Options.js';
import * as Entities from '../../util/Entities.js';
export class MathMLCompile {
    constructor(options = {}) {
        const Class = this.constructor;
        this.options = userOptions(defaultOptions({}, Class.OPTIONS), options);
    }
    setMmlFactory(mmlFactory) {
        this.factory = mmlFactory;
    }
    compile(node) {
        const mml = this.makeNode(node);
        mml.verifyTree(this.options['verify']);
        mml.setInheritedAttributes({}, false, 0, false);
        mml.walkTree(this.markMrows);
        return mml;
    }
    makeNode(node) {
        const adaptor = this.adaptor;
        let limits = false;
        const kind = adaptor.kind(node).replace(/^.*:/, '');
        let texClass = adaptor.getAttribute(node, 'data-mjx-texclass') || '';
        if (texClass) {
            texClass = this.filterAttribute('data-mjx-texclass', texClass) || '';
        }
        let type = texClass && kind === 'mrow' ? 'TeXAtom' : kind;
        for (const name of this.filterClassList(adaptor.allClasses(node))) {
            if (name.match(/^MJX-TeXAtom-/) && kind === 'mrow') {
                texClass = name.substring(12);
                type = 'TeXAtom';
            }
            else if (name === 'MJX-fixedlimits') {
                limits = true;
            }
        }
        if (!this.factory.getNodeClass(type)) {
            return this.unknownNode(type, node);
        }
        return this.createMml(type, node, texClass, limits);
    }
    createMml(type, node, texClass, limits) {
        const mml = this.factory.create(type);
        if (type === 'TeXAtom' && texClass === 'OP' && !limits) {
            mml.setProperty('movesupsub', true);
            mml.attributes.setInherited('movablelimits', true);
        }
        if (texClass) {
            mml.texClass = TEXCLASS[texClass];
            mml.setProperty('texClass', mml.texClass);
        }
        this.addAttributes(mml, node);
        this.checkClass(mml, node);
        this.addChildren(mml, node);
        return mml;
    }
    unknownNode(type, node) {
        if (this.factory.getNodeClass('html') &&
            this.options.allowHtmlInTokenNodes) {
            return this.factory.create('html').setHTML(node, this.adaptor);
        }
        this.error('Unknown node type "' + type + '"');
        return null;
    }
    addAttributes(mml, node) {
        let ignoreVariant = false;
        for (const attr of this.adaptor.allAttributes(node)) {
            const name = attr.name;
            const value = this.filterAttribute(name, attr.value);
            if (value === null || name === 'xmlns') {
                continue;
            }
            if (name.substring(0, 9) === 'data-mjx-') {
                switch (name.substring(9)) {
                    case 'alternate':
                        mml.setProperty('variantForm', true);
                        break;
                    case 'variant':
                        mml.attributes.set('mathvariant', value);
                        mml.setProperty('ignore-variant', true);
                        ignoreVariant = true;
                        break;
                    case 'smallmatrix':
                        mml.setProperty('smallmatrix', true);
                        mml.setProperty('useHeight', false);
                        break;
                    case 'mathaccent':
                        mml.setProperty('mathaccent', value === 'true');
                        break;
                    case 'auto-op':
                        mml.setProperty('autoOP', value === 'true');
                        break;
                    case 'script-align':
                        mml.setProperty('scriptalign', value);
                        break;
                    case 'vbox':
                        mml.setProperty('vbox', value);
                        break;
                    default:
                        mml.attributes.set(name, value);
                        break;
                }
            }
            else if (name !== 'class') {
                const val = value.toLowerCase();
                if (val === 'true' || val === 'false') {
                    mml.attributes.set(name, val === 'true');
                }
                else if (!ignoreVariant || name !== 'mathvariant') {
                    mml.attributes.set(name, value);
                }
            }
        }
    }
    filterAttribute(_name, value) {
        return value;
    }
    filterClassList(list) {
        return list;
    }
    addChildren(mml, node) {
        if (mml.arity === 0) {
            return;
        }
        const adaptor = this.adaptor;
        for (const child of adaptor.childNodes(node)) {
            const name = adaptor.kind(child);
            if (name === '#comment') {
                continue;
            }
            if (name === '#text') {
                this.addText(mml, child);
            }
            else if (mml.isKind('annotation-xml')) {
                mml.appendChild(this.factory.create('XML').setXML(child, adaptor));
            }
            else {
                const childMml = mml.appendChild(this.makeNode(child));
                if (childMml.arity === 0 &&
                    adaptor.childNodes(child).length &&
                    !childMml.isKind('html')) {
                    if (this.options['fixMisplacedChildren']) {
                        this.addChildren(mml, child);
                    }
                    else {
                        childMml.mError('There should not be children for ' + childMml.kind + ' nodes', this.options['verify'], true);
                    }
                }
            }
        }
        if (mml.isToken) {
            this.trimSpace(mml);
        }
    }
    addText(mml, child) {
        let text = this.adaptor.value(child);
        if ((mml.isToken || mml.getProperty('isChars')) && mml.arity) {
            if (mml.isToken) {
                text = Entities.translate(text);
                text = this.normalizeSpace(text);
            }
            mml.appendChild(this.factory.create('text').setText(text));
        }
        else if (text.match(/\S/)) {
            this.error('Unexpected text node "' + text + '"');
        }
    }
    checkClass(mml, node) {
        const classList = [];
        for (const name of this.filterClassList(this.adaptor.allClasses(node))) {
            if (name.substring(0, 4) === 'MJX-') {
                if (name === 'MJX-variant') {
                    mml.setProperty('variantForm', true);
                }
                else if (name.substring(0, 11) !== 'MJX-TeXAtom') {
                    mml.attributes.set('mathvariant', this.fixCalligraphic(name.substring(3)));
                }
            }
            else {
                classList.push(name);
            }
        }
        if (classList.length) {
            mml.attributes.set('class', classList.join(' '));
        }
    }
    fixCalligraphic(variant) {
        return variant.replace(/caligraphic/, 'calligraphic');
    }
    markMrows(mml) {
        if (mml.isKind('mrow') && !mml.isInferred && mml.childNodes.length >= 2) {
            const first = mml.childNodes[0];
            const last = mml.childNodes[mml.childNodes.length - 1];
            if (first.isKind('mo') &&
                first.attributes.get('fence') &&
                first.attributes.get('stretchy') &&
                last.isKind('mo') &&
                last.attributes.get('fence') &&
                last.attributes.get('stretchy')) {
                if (first.childNodes.length) {
                    mml.setProperty('open', first.getText());
                }
                if (last.childNodes.length) {
                    mml.setProperty('close', last.getText());
                }
            }
        }
    }
    normalizeSpace(text) {
        return text
            .replace(/[\t\n\r]/g, ' ')
            .replace(/  +/g, ' ');
    }
    trimSpace(mml) {
        let child = mml.childNodes[0];
        if (!child)
            return;
        if (child.isKind('text')) {
            child.setText(child.getText().replace(/^ +/, ''));
        }
        child = mml.childNodes[mml.childNodes.length - 1];
        if (child.isKind('text')) {
            child.setText(child.getText().replace(/ +$/, ''));
        }
    }
    error(message) {
        throw new Error(message);
    }
}
MathMLCompile.OPTIONS = {
    MmlFactory: null,
    allowHtmlInTokenNodes: false,
    fixMisplacedChildren: true,
    verify: Object.assign({}, AbstractMmlNode.verifyDefaults),
    translateEntities: true
};
//# sourceMappingURL=MathMLCompile.js.map