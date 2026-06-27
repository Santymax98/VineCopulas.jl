export class Collapse {
    constructor(visitor) {
        this.cutoff = {
            identifier: 3,
            number: 3,
            text: 10,
            infixop: 15,
            relseq: 15,
            multirel: 15,
            fenced: 18,
            bigop: 20,
            integral: 20,
            fraction: 12,
            sqrt: 9,
            root: 12,
            vector: 15,
            matrix: 15,
            cases: 15,
            superscript: 9,
            subscript: 9,
            subsup: 9,
            punctuated: {
                endpunct: Collapse.NOCOLLAPSE,
                startpunct: Collapse.NOCOLLAPSE,
                value: 12,
            },
        };
        this.marker = {
            identifier: 'x',
            number: '#',
            text: '...',
            appl: {
                'limit function': 'lim',
                value: 'f()',
            },
            fraction: '/',
            sqrt: '\u221A',
            root: '\u221A',
            superscript: '\u25FD\u02D9',
            subscript: '\u25FD.',
            subsup: '\u25FD:',
            vector: {
                binomial: '(:)',
                determinant: '|:|',
                value: '\u27E8:\u27E9',
            },
            matrix: {
                squarematrix: '[::]',
                rowvector: '\u27E8\u22EF\u27E9',
                columnvector: '\u27E8\u22EE\u27E9',
                determinant: '|::|',
                value: '(::)',
            },
            cases: '{:',
            infixop: {
                addition: '+',
                subtraction: '\u2212',
                multiplication: '\u22C5',
                implicit: '\u22C5',
                value: '+',
            },
            punctuated: {
                text: '...',
                value: ',',
            },
        };
        this.collapse = new Map([
            [
                'fenced',
                (node, complexity) => {
                    complexity = this.uncollapseChild(complexity, node, 1);
                    if (complexity > this.cutoff.fenced &&
                        node.attributes.get('data-semantic-role') === 'leftright') {
                        complexity = this.recordCollapse(node, complexity, this.getText(node.childNodes[0]) +
                            this.getText(node.childNodes[node.childNodes.length - 1]));
                    }
                    return complexity;
                },
            ],
            [
                'appl',
                (node, complexity) => {
                    if (this.canUncollapse(node, 2, 2)) {
                        complexity = this.complexity.visitNode(node, false);
                        const marker = this.marker.appl;
                        const text = marker[node.attributes.get('data-semantic-role')] ||
                            marker.value;
                        complexity = this.recordCollapse(node, complexity, text);
                    }
                    return complexity;
                },
            ],
            [
                'sqrt',
                (node, complexity) => {
                    complexity = this.uncollapseChild(complexity, node, 0);
                    if (complexity > this.cutoff.sqrt) {
                        node.setProperty('collapse-variant', true);
                        complexity = this.recordCollapse(node, complexity, this.marker.sqrt);
                    }
                    return complexity;
                },
            ],
            [
                'root',
                (node, complexity) => {
                    complexity = this.uncollapseChild(complexity, node, 0, 2);
                    if (complexity > this.cutoff.sqrt) {
                        node.setProperty('collapse-variant', true);
                        complexity = this.recordCollapse(node, complexity, this.marker.sqrt);
                    }
                    return complexity;
                },
            ],
            [
                'enclose',
                (node, complexity) => {
                    if (this.splitAttribute(node, 'children').length === 1) {
                        const child = this.canUncollapse(node, 1);
                        if (child) {
                            const marker = child.getProperty('collapse-marker');
                            this.unrecordCollapse(child);
                            complexity = this.recordCollapse(node, this.complexity.visitNode(node, false), marker);
                        }
                    }
                    return complexity;
                },
            ],
            [
                'bigop',
                (node, complexity) => {
                    if (complexity > this.cutoff.bigop || !node.isKind('mo')) {
                        const id = this.splitAttribute(node, 'content').pop();
                        const op = this.findChildText(node, id);
                        complexity = this.recordCollapse(node, complexity, op);
                    }
                    return complexity;
                },
            ],
            [
                'integral',
                (node, complexity) => {
                    if (complexity > this.cutoff.integral ||
                        !node.isKind('mo')) {
                        const id = this.splitAttribute(node, 'content').pop();
                        const op = this.findChildText(node, id);
                        complexity = this.recordCollapse(node, complexity, op);
                    }
                    return complexity;
                },
            ],
            [
                'relseq',
                (node, complexity) => {
                    if (complexity > this.cutoff.relseq) {
                        const id = this.splitAttribute(node, 'content')[0];
                        const text = this.findChildText(node, id);
                        complexity = this.recordCollapse(node, complexity, text);
                    }
                    return complexity;
                },
            ],
            [
                'multirel',
                (node, complexity) => {
                    if (complexity > this.cutoff.relseq) {
                        const id = this.splitAttribute(node, 'content')[0];
                        const text = this.findChildText(node, id) + '\u22EF';
                        complexity = this.recordCollapse(node, complexity, text);
                    }
                    return complexity;
                },
            ],
            [
                'superscript',
                (node, complexity) => {
                    complexity = this.uncollapseChild(complexity, node, 0, 2);
                    if (complexity > this.cutoff.superscript) {
                        complexity = this.recordCollapse(node, complexity, this.marker.superscript);
                    }
                    return complexity;
                },
            ],
            [
                'subscript',
                (node, complexity) => {
                    complexity = this.uncollapseChild(complexity, node, 0, 2);
                    if (complexity > this.cutoff.subscript) {
                        complexity = this.recordCollapse(node, complexity, this.marker.subscript);
                    }
                    return complexity;
                },
            ],
            [
                'subsup',
                (node, complexity) => {
                    complexity = this.uncollapseChild(complexity, node, 0, 3);
                    if (complexity > this.cutoff.subsup) {
                        complexity = this.recordCollapse(node, complexity, this.marker.subsup);
                    }
                    return complexity;
                },
            ],
        ]);
        this.idCount = 0;
        this.complexity = visitor;
    }
    check(node, complexity) {
        const type = node.attributes.get('data-semantic-type');
        if (this.collapse.has(type)) {
            return this.collapse.get(type).call(this, node, complexity);
        }
        if (Object.hasOwn(this.cutoff, type)) {
            return this.defaultCheck(node, complexity, type);
        }
        return complexity;
    }
    defaultCheck(node, complexity, type) {
        const role = node.attributes.get('data-semantic-role');
        const check = this.cutoff[type];
        const cutoff = typeof check === 'number' ? check : check[role] || check.value;
        if (complexity > cutoff) {
            const marker = this.marker[type] || '??';
            const text = typeof marker === 'string' ? marker : marker[role] || marker.value;
            complexity = this.recordCollapse(node, complexity, text);
        }
        return complexity;
    }
    recordCollapse(node, complexity, text) {
        text = '\u25C2' + text + '\u25B8';
        node.setProperty('collapse-marker', text);
        node.setProperty('collapse-complexity', complexity);
        return text.length * this.complexity.complexity.text;
    }
    unrecordCollapse(node) {
        const complexity = node.getProperty('collapse-complexity');
        if (complexity != null) {
            node.attributes.set('data-semantic-complexity', complexity);
            node.removeProperty('collapse-complexity');
            node.removeProperty('collapse-marker');
        }
    }
    canUncollapse(node, n, m = 1) {
        if (this.splitAttribute(node, 'children').length === m) {
            const mml = node.childNodes.length === 1 && node.childNodes[0].isInferred
                ? node.childNodes[0]
                : node;
            if (mml && mml.childNodes[n]) {
                const child = mml.childNodes[n];
                if (child.getProperty('collapse-marker')) {
                    return child;
                }
            }
        }
        return null;
    }
    uncollapseChild(complexity, node, n, m = 1) {
        const child = this.canUncollapse(node, n, m);
        if (child) {
            this.unrecordCollapse(child);
            if (child.parent !== node) {
                child.parent.attributes.set('data-semantic-complexity', undefined);
            }
            complexity = this.complexity.visitNode(node, false);
        }
        return complexity;
    }
    splitAttribute(node, id) {
        return (node.attributes.get('data-semantic-' + id) || '').split(/,/);
    }
    getText(node) {
        if (node.isToken)
            return node.getText();
        return node.childNodes.map((n) => this.getText(n)).join('');
    }
    findChildText(node, id) {
        const child = this.findChild(node, id);
        return this.getText(child.coreMO() || child);
    }
    findChild(node, id) {
        if (!node || node.attributes.get('data-semantic-id') === id)
            return node;
        if (!node.isToken) {
            for (const mml of node.childNodes) {
                const child = this.findChild(mml, id);
                if (child)
                    return child;
            }
        }
        return null;
    }
    makeCollapse(node, id) {
        let oldCount = null;
        if (id === null) {
            id = this.idCount;
        }
        else {
            oldCount = this.idCount;
            this.idCount = id;
        }
        const nodes = [];
        node.walkTree((child) => {
            if (child.getProperty('collapse-marker')) {
                nodes.push(child);
            }
        });
        this.makeActions(nodes);
        if (oldCount !== null) {
            this.idCount = oldCount;
        }
        return id;
    }
    makeActions(nodes) {
        for (const node of nodes) {
            this.makeAction(node);
        }
    }
    makeId() {
        return 'mjx-collapse-' + this.idCount++;
    }
    makeAction(node) {
        if (node.isKind('math')) {
            node = this.addMrow(node);
        }
        const factory = this.complexity.factory;
        const marker = node.getProperty('collapse-marker');
        const parent = node.parent;
        const variant = { 'data-mjx-collapsed': true };
        if (node.getProperty('collapse-variant')) {
            variant.mathvariant = '-tex-variant';
        }
        const maction = factory.create('maction', {
            actiontype: 'toggle',
            selection: 2,
            'data-collapsible': true,
            id: this.makeId(),
            'data-semantic-complexity': node.attributes.get('data-semantic-complexity'),
        }, [
            factory.create('mtext', variant, [
                factory.create('text').setText(marker),
            ]),
        ]);
        maction.inheritAttributesFrom(node);
        node.attributes.set('data-semantic-complexity', node.getProperty('collapse-complexity'));
        node.removeProperty('collapse-marker');
        node.removeProperty('collapse-complexity');
        parent.replaceChild(maction, node);
        maction.appendChild(node);
    }
    addMrow(node) {
        const mrow = this.complexity.factory.create('mrow', null, node.childNodes[0].childNodes);
        node.childNodes[0].setChildren([mrow]);
        const attributes = node.attributes.getAllAttributes();
        for (const name of Object.keys(attributes)) {
            if (name.substring(0, 14) === 'data-semantic-' ||
                name.substring(0, 12) === 'data-speech-' ||
                name.substring(0, 5) === 'aria-' ||
                name === 'role') {
                mrow.attributes.set(name, attributes[name]);
                delete attributes[name];
            }
        }
        mrow.setProperty('collapse-marker', node.getProperty('collapse-marker'));
        mrow.setProperty('collapse-complexity', node.getProperty('collapse-complexity'));
        node.removeProperty('collapse-marker');
        node.removeProperty('collapse-complexity');
        return mrow;
    }
}
Collapse.NOCOLLAPSE = 10000000;
//# sourceMappingURL=collapse.js.map