import { AbstractVisitor } from '../../core/Tree/Visitor.js';
import { LineBBox } from './LineBBox.js';
import { TEXCLASS } from '../../core/MmlTree/MmlNode.js';
import { OPTABLE } from '../../core/MmlTree/OperatorDictionary.js';
export const NOBREAK = 1000000;
export class Linebreaks extends AbstractVisitor {
    breakToWidth(_wrapper, _W) { }
}
export class LinebreakVisitor extends Linebreaks {
    constructor() {
        super(...arguments);
        this.PENALTY = {
            newline: (_p) => 0,
            nobreak: (_p) => NOBREAK,
            goodbreak: (p) => p - 200 * this.state.depth,
            badbreak: (p) => p + 200 * this.state.depth,
            auto: (p) => p,
        };
        this.FACTORS = {
            depth: (p) => p + 800 * this.state.depth,
            width: (p) => p +
                Math.floor(((this.state.width - this.state.w) / this.state.width) * 2500),
            tail: (p) => p +
                Math.floor((this.state.width /
                    Math.max(0.0001, this.state.mathLeft - this.state.w)) *
                    500),
            open: (p, mo) => {
                const prevClass = mo.node.prevClass;
                if (prevClass === TEXCLASS.BIN ||
                    prevClass === TEXCLASS.REL ||
                    prevClass === TEXCLASS.OP) {
                    return p + 5000;
                }
                const prev = this.getPrevious(mo);
                if (prev &&
                    (prev.attributes.get('form') !== 'postfix' ||
                        prev.attributes.get('linebreak') === 'nobreak')) {
                    return p + 5000;
                }
                const parent = mo.node.Parent;
                if ((parent === null || parent === void 0 ? void 0 : parent.isKind('mmultiscripts')) &&
                    mo.node === this.getFirstToken(parent)) {
                    const prescripts = !!parent.childNodes.filter((node) => node.isKind('mprescripts')).length;
                    if (prescripts)
                        return NOBREAK;
                }
                return p - 500;
            },
            close: (p, mo) => {
                var _a;
                const parent = mo.node.Parent;
                if ((parent === null || parent === void 0 ? void 0 : parent.isKind('msubsup')) &&
                    !(parent.isKind('mmultiscripts') &&
                        ((_a = parent.childNodes[1]) === null || _a === void 0 ? void 0 : _a.isKind('mprescripts'))) &&
                    mo.node === this.getLastToken(parent.childNodes[0])) {
                    return NOBREAK;
                }
                return p + 500;
            },
            space: (p, node) => {
                const mspace = node;
                if (!mspace.canBreak)
                    return NOBREAK;
                const w = mspace.getBBox().w;
                return w < 0 ? NOBREAK : w < 1 ? p : p - 100 * (w + 4);
            },
            separator: (p) => p + 500,
            fuzz: (p) => p * 0.99,
        };
        this.TEXCLASS = {
            [TEXCLASS.BIN]: (p) => p - 250,
            [TEXCLASS.REL]: (p) => p - 500,
        };
    }
    breakToWidth(wrapper, W) {
        const state = this.state;
        this.state = this.createState(wrapper);
        this.state.width = W;
        const n = wrapper.breakCount;
        for (let i = 0; i <= n; i++) {
            const line = wrapper.lineBBox[i] || wrapper.getLineBBox(i);
            if (line.w > W) {
                this.breakLineToWidth(wrapper, i);
            }
        }
        for (const [ww, ij] of this.state.breaks) {
            if (ij === null) {
                const mo = ww.coreMO();
                mo.setBreakStyle(mo.node.attributes.get('linebreakstyle') || 'before');
            }
            else {
                ww.setBreakAt(ij);
            }
            ww.invalidateBBox();
        }
        this.state = state;
    }
    createState(wrapper) {
        const mathWidth = wrapper.getBBox().w;
        return {
            breaks: new Set(),
            potential: [],
            width: 0,
            w: 0,
            prevWidth: 0,
            prevBreak: null,
            depth: 0,
            mathWidth: mathWidth,
            mathLeft: mathWidth,
        };
    }
    breakLineToWidth(wrapper, i) {
        const state = this.state;
        state.potential = [];
        state.w = 0;
        state.prevWidth = 0;
        state.prevBreak = null;
        state.depth = 0;
        this.visitNode(wrapper, i);
    }
    addWidth(bbox, w = null) {
        if (w === null) {
            w = bbox.L + bbox.w + bbox.R;
        }
        if (!w)
            return;
        w *= bbox.rscale;
        this.state.w += w;
        if (this.state.potential.length) {
            this.state.potential[0][4] += w;
        }
        this.processBreak();
    }
    processBreak() {
        const state = this.state;
        while (state.potential.length && state.w > this.state.width) {
            const br = state.potential.pop();
            const [ww, , pw, dw, w] = br;
            state.breaks.add(ww);
            state.w = state.potential.reduce((w, brk) => w + brk[4], dw + w);
            if (state.prevBreak && state.prevWidth + pw <= state.width) {
                state.breaks.delete(state.prevBreak[0]);
                state.prevWidth += pw;
            }
            else {
                state.prevWidth = pw + dw;
            }
            state.potential.forEach((data) => (data[2] -= pw));
            state.prevBreak = br;
            state.mathLeft -= pw;
        }
    }
    pushBreak(wrapper, penalty, w, ij) {
        var _a;
        const state = this.state;
        if (penalty >= NOBREAK || (state.w === 0 && state.prevWidth === 0))
            return;
        while (state.potential.length &&
            state.potential[0][1] > this.FACTORS.fuzz(penalty)) {
            const data = state.potential.shift();
            if (state.potential.length) {
                state.potential[0][4] += data[4];
            }
        }
        state.potential.unshift([
            [wrapper, ij],
            penalty,
            state.w - (((_a = state.prevBreak) === null || _a === void 0 ? void 0 : _a[3]) || 0),
            w,
            0,
        ]);
    }
    getBorderLR(wrapper) {
        var _a;
        const data = wrapper.styleData;
        if (!data)
            return [0, 0];
        const border = ((_a = data === null || data === void 0 ? void 0 : data.border) === null || _a === void 0 ? void 0 : _a.width) || [0, 0, 0, 0];
        const padding = (data === null || data === void 0 ? void 0 : data.padding) || [0, 0, 0, 0];
        return [border[3] + padding[3], border[1] + padding[1]];
    }
    getFirstToken(node) {
        return node.isToken ? node : this.getFirstToken(node.childNodes[0]);
    }
    getLastToken(node) {
        return node.isToken
            ? node
            : this.getLastToken(node.childNodes[node.childNodes.length - 1]);
    }
    visitNode(wrapper, i) {
        if (!wrapper)
            return;
        this.state.depth++;
        if (wrapper.node.isEmbellished && !wrapper.node.isKind('mo')) {
            this.visitEmbellishedOperator(wrapper, i);
        }
        else {
            super.visitNode(wrapper, i);
        }
        this.state.depth--;
    }
    visitDefault(wrapper, i) {
        var _a;
        const bbox = wrapper.getLineBBox(i);
        if (wrapper.node.isToken ||
            wrapper.node.linebreakContainer ||
            !((_a = wrapper.childNodes) === null || _a === void 0 ? void 0 : _a[0])) {
            this.addWidth(bbox);
        }
        else {
            const [L, R] = this.getBorderLR(wrapper);
            if (i === 0) {
                this.addWidth(bbox, bbox.L + L);
            }
            this.visitNode(wrapper.childNodes[0], i);
            if (i === wrapper.breakCount) {
                this.addWidth(bbox, bbox.R + R);
            }
        }
    }
    visitEmbellishedOperator(wrapper, _i) {
        const mo = wrapper.coreMO();
        const bbox = LineBBox.from(wrapper.getOuterBBox(), wrapper.linebreakOptions.lineleading);
        bbox.getIndentData(mo.node);
        const style = mo.getBreakStyle(mo.node.attributes.get('linebreakstyle'));
        const dw = mo.processIndent('', bbox.indentData[1][1], '', bbox.indentData[0][1], this.state.width)[1];
        const penalty = this.moPenalty(mo);
        if (style === 'before') {
            this.pushBreak(wrapper, penalty, dw - bbox.L, null);
            this.addWidth(bbox);
        }
        else {
            this.addWidth(bbox);
            const w = (style === 'after'
                ? 0
                : mo.multChar
                    ? mo.multChar.getBBox().w
                    : bbox.w) + dw;
            this.pushBreak(wrapper, penalty, w, null);
        }
    }
    visitMoNode(wrapper, _i) {
        const mo = wrapper;
        const bbox = LineBBox.from(mo.getOuterBBox(), mo.linebreakOptions.lineleading);
        bbox.getIndentData(mo.node);
        const style = mo.getBreakStyle(mo.node.attributes.get('linebreakstyle'));
        const dw = mo.processIndent('', bbox.indentData[1][1], '', bbox.indentData[0][1], this.state.width)[1];
        const penalty = this.moPenalty(mo);
        if (style === 'before') {
            this.pushBreak(wrapper, penalty, dw - bbox.L, null);
            this.addWidth(bbox);
        }
        else {
            this.addWidth(bbox);
            const w = (style === 'after'
                ? 0
                : mo.multChar
                    ? mo.multChar.getBBox().w
                    : bbox.w) + dw;
            this.pushBreak(wrapper, penalty, w, null);
        }
    }
    moPenalty(mo) {
        const { linebreak, fence, form } = mo.node.attributes.getList('linebreak', 'fence', 'form');
        const FACTORS = this.FACTORS;
        let penalty = FACTORS.tail(FACTORS.width(0));
        const isOpen = (fence && form === 'prefix') || mo.node.texClass === TEXCLASS.OPEN;
        const isClose = (fence && form === 'postfix') || mo.node.texClass === TEXCLASS.CLOSE;
        if (isOpen) {
            penalty = FACTORS.open(penalty, mo);
            this.state.depth++;
        }
        if (isClose) {
            penalty = FACTORS.close(penalty, mo);
            this.state.depth--;
        }
        penalty = (this.TEXCLASS[mo.node.texClass] || ((p) => p))(penalty);
        return (this.PENALTY[linebreak] || ((p) => p))(FACTORS.depth(penalty));
    }
    getPrevious(mo) {
        let child = mo.node;
        let parent = child.parent;
        let i = parent.childIndex(child);
        while (parent && (parent.notParent || parent.isKind('mrow')) && i === 0) {
            child = parent;
            parent = child.parent;
            i = parent.childIndex(child);
        }
        if (!parent || !i)
            return null;
        const prev = parent.childNodes[i - 1];
        return prev.isEmbellished ? prev.coreMO() : null;
    }
    visitMspaceNode(wrapper, i) {
        const bbox = wrapper.getLineBBox(i);
        const mspace = wrapper;
        if (mspace.canBreak) {
            const penalty = this.mspacePenalty(mspace);
            bbox.getIndentData(wrapper.node);
            const dw = wrapper.processIndent('', bbox.indentData[1][1], '', bbox.indentData[0][1], this.state.width)[1];
            this.pushBreak(wrapper, penalty, dw - bbox.w, null);
        }
        this.addWidth(bbox);
    }
    mspacePenalty(mspace) {
        const linebreak = mspace.node.attributes.get('linebreak');
        const FACTORS = this.FACTORS;
        const penalty = FACTORS.space(FACTORS.tail(FACTORS.width(0)), mspace);
        return (this.PENALTY[linebreak] || ((p) => p))(FACTORS.depth(penalty));
    }
    visitMtextNode(wrapper, i) {
        if (!wrapper.getText().match(/ /)) {
            this.visitDefault(wrapper, i);
            return;
        }
        const mtext = wrapper;
        mtext.clearBreakPoints();
        const space = mtext.textWidth(' ');
        const bbox = wrapper.getBBox();
        const [L, R] = this.getBorderLR(wrapper);
        this.addWidth(bbox, bbox.L + L);
        const children = mtext.childNodes;
        for (const j of children.keys()) {
            const child = children[j];
            if (child.node.isKind('text')) {
                const words = child.node.getText().split(/ /);
                const last = words.pop();
                for (const k of words.keys()) {
                    this.addWidth(bbox, mtext.textWidth(words[k]));
                    this.pushBreak(wrapper, this.mtextPenalty(), -space, [j, k + 1]);
                    this.addWidth(bbox, space);
                }
                this.addWidth(bbox, mtext.textWidth(last));
            }
            else {
                this.addWidth(child.getBBox());
            }
        }
        this.addWidth(bbox, bbox.R + R);
    }
    mtextPenalty() {
        const FACTORS = this.FACTORS;
        return FACTORS.depth(FACTORS.tail(FACTORS.width(0)));
    }
    visitMrowNode(wrapper, i) {
        const line = wrapper.lineBBox[i] || wrapper.getLineBBox(i);
        const [start, startL] = line.start || [0, 0];
        const [end, endL] = line.end || [wrapper.childNodes.length - 1, 0];
        const [L, R] = this.getBorderLR(wrapper);
        this.addWidth(line, line.L + L);
        for (let i = start; i <= end; i++) {
            this.visitNode(wrapper.childNodes[i], i === start ? startL : i === end ? endL : 0);
        }
        this.addWidth(line, line.R + R);
    }
    visitInferredMrowNode(wrapper, i) {
        this.state.depth--;
        this.visitMrowNode(wrapper, i);
        this.state.depth++;
    }
    visitMfracNode(wrapper, i) {
        const mfrac = wrapper;
        if (!mfrac.node.attributes.get('bevelled') &&
            mfrac.getOuterBBox().w > this.state.width) {
            this.breakToWidth(mfrac.childNodes[0], this.state.width);
            this.breakToWidth(mfrac.childNodes[1], this.state.width);
        }
        this.visitDefault(wrapper, i);
    }
    visitMsqrtNode(wrapper, i) {
        if (wrapper.getOuterBBox().w > this.state.width) {
            const msqrt = wrapper;
            const base = msqrt.childNodes[msqrt.base];
            this.breakToWidth(base, this.state.width - msqrt.rootWidth());
            msqrt.getStretchedSurd();
        }
        this.visitDefault(wrapper, i);
    }
    visitMrootNode(wrapper, i) {
        this.visitMsqrtNode(wrapper, i);
    }
    visitMsubNode(wrapper, i) {
        this.visitDefault(wrapper, i);
        const msub = wrapper;
        const x = msub.getOffset()[0];
        const sbox = msub.scriptChild.getOuterBBox();
        const [L, R] = this.getBorderLR(wrapper);
        this.addWidth(msub.getLineBBox(i), x + L + sbox.rscale * sbox.w + msub.font.params.scriptspace + R);
    }
    visitMsupNode(wrapper, i) {
        this.visitDefault(wrapper, i);
        const msup = wrapper;
        const x = msup.getOffset()[0];
        const sbox = msup.scriptChild.getOuterBBox();
        const [L, R] = this.getBorderLR(wrapper);
        this.addWidth(msup.getLineBBox(i), x + L + sbox.rscale * sbox.w + msup.font.params.scriptspace + R);
    }
    visitMsubsupNode(wrapper, i) {
        this.visitDefault(wrapper, i);
        const msubsup = wrapper;
        const subbox = msubsup.subChild.getOuterBBox();
        const supbox = msubsup.supChild.getOuterBBox();
        const x = msubsup.getAdjustedIc();
        const w = Math.max(subbox.rscale * subbox.w, x + supbox.rscale * supbox.w) +
            msubsup.font.params.scriptspace;
        const [L, R] = this.getBorderLR(wrapper);
        this.addWidth(wrapper.getLineBBox(i), L + w + R);
    }
    visitMmultiscriptsNode(wrapper, i) {
        const mmultiscripts = wrapper;
        const data = mmultiscripts.scriptData;
        if (data.numPrescripts) {
            const w = Math.max(data.psup.rscale * data.psup.w, data.psub.rscale * data.psub.w);
            this.addWidth(wrapper.getLineBBox(i), w + mmultiscripts.font.params.scriptspace);
        }
        this.visitDefault(wrapper, i);
        if (data.numScripts) {
            const w = Math.max(data.sup.rscale * data.sup.w, data.sub.rscale * data.sub.w);
            this.addWidth(wrapper.getLineBBox(i), w + mmultiscripts.font.params.scriptspace);
        }
    }
    visitMfencedNode(wrapper, i) {
        const mfenced = wrapper;
        const bbox = wrapper.getLineBBox(i);
        const [L, R] = this.getBorderLR(wrapper);
        if (i === 0) {
            this.addWidth(bbox, bbox.L + L);
        }
        this.visitNode(mfenced.mrow, i);
        if (i === wrapper.breakCount) {
            this.addWidth(bbox, bbox.R + R);
        }
    }
    visitMactionNode(wrapper, i) {
        const maction = wrapper;
        const bbox = wrapper.getLineBBox(i);
        const [L, R] = this.getBorderLR(wrapper);
        if (i === 0) {
            this.addWidth(bbox, bbox.L + L);
        }
        this.visitNode(maction.selected, i);
        if (i === wrapper.breakCount) {
            this.addWidth(bbox, bbox.R + R);
        }
    }
}
(function () {
    for (const op of Object.keys(OPTABLE.postfix)) {
        const data = OPTABLE.postfix[op][3];
        if (data && data.fence) {
            data.linebreakstyle = 'after';
        }
    }
    OPTABLE.infix['\u2061'] = [...OPTABLE.infix['\u2061']];
    OPTABLE.infix['\u2061'][3] = { linebreak: 'nobreak' };
})();
//# sourceMappingURL=LinebreakVisitor.js.map