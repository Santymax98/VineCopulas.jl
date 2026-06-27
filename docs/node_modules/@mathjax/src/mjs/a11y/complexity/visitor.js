import { MmlVisitor } from '../../core/MmlTree/MmlVisitor.js';
import { Collapse } from './collapse.js';
import { userOptions, defaultOptions } from '../../util/Options.js';
export class ComplexityVisitor extends MmlVisitor {
    constructor(factory, options) {
        super(factory);
        this.complexity = {
            text: .5,
            token: .5,
            child: 1,
            script: .8,
            sqrt: 2,
            subsup: 2,
            underover: 2,
            fraction: 2,
            enclose: 2,
            action: 2,
            phantom: 0,
            xml: 2,
            glyph: 2
        };
        const CLASS = this.constructor;
        this.options = userOptions(defaultOptions({}, CLASS.OPTIONS), options);
        this.collapse = new this.options.Collapse(this);
        this.factory = factory;
    }
    visitTree(node, id) {
        super.visitTree(node, true);
        if (this.options.makeCollapsible) {
            id = this.collapse.makeCollapse(node, id);
        }
        return id;
    }
    visitNode(node, save) {
        if (node.attributes.get('data-semantic-complexity'))
            return;
        return super.visitNode(node, save);
    }
    visitDefault(node, save) {
        let complexity;
        if (node.isToken) {
            const text = node.getText();
            complexity = this.complexity.text * text.length + this.complexity.token;
        }
        else {
            complexity = this.childrenComplexity(node);
        }
        return this.setComplexity(node, complexity, save);
    }
    visitMfracNode(node, save) {
        const complexity = this.childrenComplexity(node) * this.complexity.script +
            this.complexity.fraction;
        return this.setComplexity(node, complexity, save);
    }
    visitMsqrtNode(node, save) {
        const complexity = this.childrenComplexity(node) + this.complexity.sqrt;
        return this.setComplexity(node, complexity, save);
    }
    visitMrootNode(node, save) {
        const complexity = this.childrenComplexity(node) +
            this.complexity.sqrt -
            (1 - this.complexity.script) * this.getComplexity(node.childNodes[1]);
        return this.setComplexity(node, complexity, save);
    }
    visitMphantomNode(node, save) {
        return this.setComplexity(node, this.complexity.phantom, save);
    }
    visitMsNode(node, save) {
        const text = node.attributes.get('lquote') +
            node.getText() +
            node.attributes.get('rquote');
        const complexity = text.length * this.complexity.text;
        return this.setComplexity(node, complexity, save);
    }
    visitMsubsupNode(node, save) {
        super.visitDefault(node, true);
        const sub = node.childNodes[node.sub];
        const sup = node.childNodes[node.sup];
        const base = node.childNodes[node.base];
        let complexity = Math.max(sub ? this.getComplexity(sub) : 0, sup ? this.getComplexity(sup) : 0) * this.complexity.script;
        complexity += this.complexity.child * ((sub ? 1 : 0) + (sup ? 1 : 0));
        complexity += base ? this.getComplexity(base) + this.complexity.child : 0;
        complexity += this.complexity.subsup;
        return this.setComplexity(node, complexity, save);
    }
    visitMsubNode(node, save) {
        return this.visitMsubsupNode(node, save);
    }
    visitMsupNode(node, save) {
        return this.visitMsubsupNode(node, save);
    }
    visitMunderoverNode(node, save) {
        super.visitDefault(node, true);
        const under = node.childNodes[node.under];
        const over = node.childNodes[node.over];
        const base = node.childNodes[node.base];
        let complexity = Math.max(under ? this.getComplexity(under) : 0, over ? this.getComplexity(over) : 0) * this.complexity.script;
        if (base) {
            complexity = Math.max(this.getComplexity(base), complexity);
        }
        complexity +=
            this.complexity.child *
                ((under ? 1 : 0) + (over ? 1 : 0) + (base ? 1 : 0));
        complexity += this.complexity.underover;
        return this.setComplexity(node, complexity, save);
    }
    visitMunderNode(node, save) {
        return this.visitMunderoverNode(node, save);
    }
    visitMoverNode(node, save) {
        return this.visitMunderoverNode(node, save);
    }
    visitMencloseNode(node, save) {
        const complexity = this.childrenComplexity(node) + this.complexity.enclose;
        return this.setComplexity(node, complexity, save);
    }
    visitMactionNode(node, save) {
        this.childrenComplexity(node);
        const complexity = this.getComplexity(node.selected);
        return this.setComplexity(node, complexity, save);
    }
    visitMsemanticsNode(node, save) {
        const child = node.childNodes[0];
        let complexity = 0;
        if (child) {
            this.visitNode(child, true);
            complexity = this.getComplexity(child);
        }
        return this.setComplexity(node, complexity, save);
    }
    visitAnnotationNode(node, save) {
        return this.setComplexity(node, this.complexity.xml, save);
    }
    visitAnnotation_xmlNode(node, save) {
        return this.setComplexity(node, this.complexity.xml, save);
    }
    visitMglyphNode(node, save) {
        return this.setComplexity(node, this.complexity.glyph, save);
    }
    getComplexity(node) {
        const collapsed = node.getProperty('collapsedComplexity');
        return (collapsed != null
            ? collapsed
            : node.attributes.get('data-semantic-complexity'));
    }
    setComplexity(node, complexity, save) {
        if (save) {
            if (this.options.identifyCollapsible) {
                complexity = this.collapse.check(node, complexity);
            }
            node.attributes.set('data-semantic-complexity', complexity);
        }
        return complexity;
    }
    childrenComplexity(node) {
        super.visitDefault(node, true);
        let complexity = 0;
        for (const child of node.childNodes) {
            complexity += this.getComplexity(child);
        }
        if (node.childNodes.length > 1) {
            complexity += node.childNodes.length * this.complexity.child;
        }
        return complexity;
    }
}
ComplexityVisitor.OPTIONS = {
    identifyCollapsible: true,
    makeCollapsible: true,
    Collapse: Collapse
};
//# sourceMappingURL=visitor.js.map