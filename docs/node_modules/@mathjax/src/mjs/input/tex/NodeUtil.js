import { AbstractMmlNode, AbstractMmlEmptyNode, } from '../../core/MmlTree/MmlNode.js';
import { MmlMo } from '../../core/MmlTree/MmlNodes/mo.js';
const NodeUtil = {
    attrs: new Set([
        'autoOP',
        'fnOP',
        'movesupsub',
        'subsupOK',
        'texprimestyle',
        'useHeight',
        'variantForm',
        'withDelims',
        'mathaccent',
        'open',
        'close',
    ]),
    createEntity(code) {
        return String.fromCodePoint(parseInt(code, 16));
    },
    getChildren(node) {
        return node.childNodes;
    },
    getText(node) {
        return node.getText();
    },
    appendChildren(node, children) {
        for (const child of children) {
            node.appendChild(child);
        }
    },
    setAttribute(node, attribute, value) {
        node.attributes.set(attribute, value);
    },
    setProperty(node, property, value) {
        node.setProperty(property, value);
    },
    setProperties(node, properties) {
        for (const name of Object.keys(properties)) {
            const value = properties[name];
            if (name === 'texClass') {
                node.texClass = value;
                node.setProperty(name, value);
            }
            else if (name === 'movablelimits') {
                node.setProperty('movablelimits', value);
                if (node.isKind('mo') || node.isKind('mstyle')) {
                    node.attributes.set('movablelimits', value);
                }
            }
            else if (name === 'inferred') {
            }
            else if (NodeUtil.attrs.has(name)) {
                node.setProperty(name, value);
            }
            else {
                node.attributes.set(name, value);
            }
        }
    },
    getProperty(node, property) {
        return node.getProperty(property);
    },
    getAttribute(node, attr) {
        return node.attributes.get(attr);
    },
    removeAttribute(node, attr) {
        node.attributes.unset(attr);
    },
    removeProperties(node, ...properties) {
        node.removeProperty(...properties);
    },
    getChildAt(node, position) {
        return node.childNodes[position];
    },
    setChild(node, position, child) {
        const children = node.childNodes;
        children[position] = child;
        if (child) {
            child.parent = node;
        }
    },
    copyChildren(oldNode, newNode) {
        const children = oldNode.childNodes;
        for (let i = 0; i < children.length; i++) {
            this.setChild(newNode, i, children[i]);
        }
    },
    copyAttributes(oldNode, newNode) {
        newNode.attributes = oldNode.attributes;
        for (const [prop, value] of Object.entries(oldNode.getAllProperties())) {
            newNode.setProperty(prop, value);
        }
    },
    isType(node, kind) {
        return node.isKind(kind);
    },
    isEmbellished(node) {
        return node.isEmbellished;
    },
    getTexClass(node) {
        return node.texClass;
    },
    getCoreMO(node) {
        return node.coreMO();
    },
    isNode(item) {
        return (item instanceof AbstractMmlNode || item instanceof AbstractMmlEmptyNode);
    },
    isInferred(node) {
        return node.isInferred;
    },
    getForm(node) {
        if (!node.isKind('mo')) {
            return null;
        }
        const mo = node;
        const forms = mo.getForms();
        for (const form of forms) {
            const symbol = this.getOp(mo, form);
            if (symbol) {
                return symbol;
            }
        }
        return null;
    },
    getOp(mo, form = 'infix') {
        return MmlMo.OPTABLE[form][mo.getText()] || null;
    },
    getMoAttribute(mo, attr) {
        var _a, _b;
        if (!mo.attributes.isSet(attr)) {
            for (const form of ['infix', 'postfix', 'prefix']) {
                const value = (_b = (_a = this.getOp(mo, form)) === null || _a === void 0 ? void 0 : _a[3]) === null || _b === void 0 ? void 0 : _b[attr];
                if (value !== undefined) {
                    return value;
                }
            }
        }
        return mo.attributes.get(attr);
    },
};
export default NodeUtil;
//# sourceMappingURL=NodeUtil.js.map