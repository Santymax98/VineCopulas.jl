import { expandable } from '../../util/Options.js';
import { SafeMethods } from './SafeMethods.js';
export class Safe {
    constructor(document, options) {
        this.filterAttributes = new Map([
            ['href', 'filterURL'],
            ['src', 'filterURL'],
            ['altimg', 'filterURL'],
            ['class', 'filterClassList'],
            ['style', 'filterStyles'],
            ['id', 'filterID'],
            ['fontsize', 'filterFontSize'],
            ['mathsize', 'filterFontSize'],
            ['scriptminsize', 'filterFontSize'],
            ['scriptsizemultiplier', 'filterSizeMultiplier'],
            ['scriptlevel', 'filterScriptLevel'],
            ['data-', 'filterData'],
        ]);
        this.filterMethods = Object.assign({}, SafeMethods);
        this.adaptor = document.adaptor;
        this.options = options;
        this.allow = this.options.allow;
    }
    sanitize(math, document) {
        try {
            math.root.walkTree(this.sanitizeNode.bind(this));
        }
        catch (err) {
            document.options.compileError(document, math, err);
        }
    }
    sanitizeNode(node) {
        const attributes = node.attributes.getAllAttributes();
        for (const id of Object.keys(attributes)) {
            const method = this.filterAttributes.get(id);
            if (method) {
                const value = this.filterMethods[method](this, attributes[id]);
                if (value) {
                    if (value !==
                        (typeof value === 'number'
                            ? parseFloat(attributes[id])
                            : attributes[id])) {
                        attributes[id] = value;
                    }
                }
                else {
                    delete attributes[id];
                }
            }
        }
    }
    mmlAttribute(id, value) {
        if (id === 'class')
            return null;
        const method = this.filterAttributes.get(id);
        const filter = method ||
            (id.substring(0, 5) === 'data-'
                ? this.filterAttributes.get('data-')
                : null);
        if (!filter) {
            return value;
        }
        const result = this.filterMethods[filter](this, value, id);
        return typeof result === 'number' || typeof result === 'boolean'
            ? String(result)
            : result;
    }
    mmlClassList(list) {
        return list
            .map((name) => this.filterMethods.filterClass(this, name))
            .filter((value) => value !== null);
    }
}
Safe.OPTIONS = {
    allow: {
        URLs: 'safe',
        classes: 'safe',
        cssIDs: 'safe',
        styles: 'safe',
    },
    lengthMax: 3,
    scriptsizemultiplierRange: [0.6, 1],
    scriptlevelRange: [-2, 2],
    classPattern: /^mjx-[-a-zA-Z0-9_.]+$/,
    idPattern: /^mjx-[-a-zA-Z0-9_.]+$/,
    dataPattern: /^data-mjx-/,
    safeProtocols: expandable({
        http: true,
        https: true,
        file: true,
        javascript: false,
        data: false,
    }),
    safeStyles: expandable({
        color: true,
        backgroundColor: true,
        border: true,
        cursor: true,
        margin: true,
        padding: true,
        textShadow: true,
        fontFamily: true,
        fontSize: true,
        fontStyle: true,
        fontWeight: true,
        opacity: true,
        outline: true,
    }),
    styleParts: expandable({
        border: true,
        padding: true,
        margin: true,
        outline: true,
    }),
    styleLengths: expandable({
        borderTop: 'borderTopWidth',
        borderRight: 'borderRightWidth',
        borderBottom: 'borderBottomWidth',
        borderLeft: 'borderLeftWidth',
        paddingTop: true,
        paddingRight: true,
        paddingBottom: true,
        paddingLeft: true,
        marginTop: true,
        marginRight: true,
        marginBottom: true,
        marginLeft: true,
        outlineTop: true,
        outlineRight: true,
        outlineBottom: true,
        outlineLeft: true,
        fontSize: [0.707, 1.44],
    }),
};
//# sourceMappingURL=safe.js.map