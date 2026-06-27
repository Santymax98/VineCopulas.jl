import { AbstractMmlNode, TEXCLASS } from '../MmlNode.js';
export class MmlMrow extends AbstractMmlNode {
    constructor() {
        super(...arguments);
        this._core = null;
    }
    get kind() {
        return 'mrow';
    }
    get isSpacelike() {
        for (const child of this.childNodes) {
            if (!child.isSpacelike) {
                return false;
            }
        }
        return true;
    }
    get isEmbellished() {
        let embellished = false;
        let i = 0;
        for (const child of this.childNodes) {
            if (child) {
                if (child.isEmbellished) {
                    if (embellished) {
                        return false;
                    }
                    embellished = true;
                    this._core = i;
                }
                else if (!child.isSpacelike) {
                    return false;
                }
            }
            i++;
        }
        return embellished;
    }
    core() {
        if (!this.isEmbellished || this._core == null) {
            return this;
        }
        return this.childNodes[this._core];
    }
    coreMO() {
        if (!this.isEmbellished || this._core == null) {
            return this;
        }
        return this.childNodes[this._core].coreMO();
    }
    nonSpaceLength() {
        let n = 0;
        for (const child of this.childNodes) {
            if (child && !child.isSpacelike) {
                n++;
            }
        }
        return n;
    }
    firstNonSpace() {
        for (const child of this.childNodes) {
            if (child && !child.isSpacelike) {
                return child;
            }
        }
        return null;
    }
    lastNonSpace() {
        let i = this.childNodes.length;
        while (--i >= 0) {
            const child = this.childNodes[i];
            if (child && !child.isSpacelike) {
                return child;
            }
        }
        return null;
    }
    setTeXclass(prev) {
        if (this.getProperty('open') != null || this.getProperty('close') != null) {
            this.getPrevClass(prev);
            prev = null;
            for (const child of this.childNodes) {
                prev = child.setTeXclass(prev);
            }
            if (this.texClass == null) {
                this.texClass = TEXCLASS.INNER;
            }
            return this;
        }
        for (const child of this.childNodes) {
            prev = child.setTeXclass(prev);
        }
        if (this.childNodes[0]) {
            this.updateTeXclass(this.childNodes[0]);
        }
        return prev;
    }
}
MmlMrow.defaults = Object.assign({}, AbstractMmlNode.defaults);
export class MmlInferredMrow extends MmlMrow {
    get kind() {
        return 'inferredMrow';
    }
    get isInferred() {
        return true;
    }
    get notParent() {
        return true;
    }
    toString() {
        return '[' + this.childNodes.join(',') + ']';
    }
}
MmlInferredMrow.defaults = MmlMrow.defaults;
//# sourceMappingURL=mrow.js.map