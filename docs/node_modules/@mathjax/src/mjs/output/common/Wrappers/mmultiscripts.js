import { BBox } from '../../../util/BBox.js';
import { LineBBox } from '../LineBBox.js';
export const NextScript = {
    base: 'subList',
    subList: 'supList',
    supList: 'subList',
    psubList: 'psupList',
    psupList: 'psubList',
};
export const ScriptNames = ['sup', 'sup', 'psup', 'psub'];
export function CommonMmultiscriptsMixin(Base) {
    return class CommonMmultiscriptsMixin extends Base {
        combinePrePost(pre, post) {
            const bbox = new BBox(pre);
            bbox.combine(post, 0, 0);
            return bbox;
        }
        getScriptData() {
            const data = (this.scriptData = {
                base: null,
                sub: BBox.empty(),
                sup: BBox.empty(),
                psub: BBox.empty(),
                psup: BBox.empty(),
                numPrescripts: 0,
                numScripts: 0,
            });
            const lists = this.getScriptBBoxLists();
            this.combineBBoxLists(data.sub, data.sup, lists.subList, lists.supList);
            this.combineBBoxLists(data.psub, data.psup, lists.psubList, lists.psupList);
            data.base = lists.base[0];
            data.numPrescripts = lists.psubList.length;
            data.numScripts = lists.subList.length;
        }
        getScriptBBoxLists() {
            const lists = {
                base: [],
                subList: [],
                supList: [],
                psubList: [],
                psupList: [],
            };
            let script = 'base';
            for (const child of this.childNodes) {
                if (child.node.isKind('mprescripts')) {
                    script = 'psubList';
                }
                else {
                    lists[script].push(child.getOuterBBox());
                    script = NextScript[script];
                }
            }
            this.firstPrescript = lists.subList.length + lists.supList.length + 2;
            this.padLists(lists.subList, lists.supList);
            this.padLists(lists.psubList, lists.psupList);
            return lists;
        }
        padLists(list1, list2) {
            if (list1.length > list2.length) {
                list2.push(BBox.empty());
            }
        }
        combineBBoxLists(bbox1, bbox2, list1, list2) {
            for (let i = 0; i < list1.length; i++) {
                const [w1, h1, d1] = this.getScaledWHD(list1[i]);
                const [w2, h2, d2] = this.getScaledWHD(list2[i]);
                const w = Math.max(w1, w2);
                bbox1.w += w;
                bbox2.w += w;
                if (h1 > bbox1.h)
                    bbox1.h = h1;
                if (d1 > bbox1.d)
                    bbox1.d = d1;
                if (h2 > bbox2.h)
                    bbox2.h = h2;
                if (d2 > bbox2.d)
                    bbox2.d = d2;
            }
        }
        getScaledWHD(bbox) {
            const { w, h, d, rscale } = bbox;
            return [w * rscale, h * rscale, d * rscale];
        }
        getCombinedUV() {
            const data = this.scriptData;
            const sub = this.combinePrePost(data.sub, data.psub);
            const sup = this.combinePrePost(data.sup, data.psup);
            return this.getUVQ(sub, sup);
        }
        addPrescripts(bbox, u, v) {
            const data = this.scriptData;
            if (data.numPrescripts) {
                const scriptspace = this.font.params.scriptspace;
                bbox.combine(data.psup, scriptspace, u);
                bbox.combine(data.psub, scriptspace, v);
            }
            return bbox;
        }
        addPostscripts(bbox, u, v) {
            const data = this.scriptData;
            if (data.numScripts) {
                const x = bbox.w;
                bbox.combine(data.sup, x, u);
                bbox.combine(data.sub, x, v);
                bbox.w += this.font.params.scriptspace;
            }
            return bbox;
        }
        constructor(...args) {
            super(...args);
            this.scriptData = null;
            this.firstPrescript = 0;
            this.getScriptData();
        }
        appendScripts(bbox) {
            bbox.empty();
            const [u, v] = this.getCombinedUV();
            this.addPrescripts(bbox, u, v);
            bbox.append(this.scriptData.base);
            this.addPostscripts(bbox, u, v);
            bbox.clean();
            return bbox;
        }
        computeLineBBox(i) {
            const n = this.baseChild.breakCount;
            const cbox = this.baseChild.getLineBBox(i).copy();
            let bbox = cbox;
            const [u, v] = this.getCombinedUV();
            if (i === 0) {
                bbox = LineBBox.from(this.addPrescripts(BBox.zero(), u, v), this.linebreakOptions.lineleading);
                bbox.append(cbox);
                this.addLeftBorders(bbox);
                bbox.L = this.bbox.L;
            }
            else if (i === n) {
                bbox = this.addPostscripts(bbox, u, v);
                this.addRightBorders(bbox);
                bbox.R = this.bbox.R;
            }
            this.addMiddleBorders(bbox);
            return bbox;
        }
        getUVQ(subbox, supbox) {
            if (!this.UVQ) {
                let [u, v, q] = [0, 0, 0];
                if (subbox.w === 0) {
                    u = this.getU();
                }
                else if (supbox.w === 0) {
                    u = -this.getV();
                }
                else {
                    [u, v, q] = super.getUVQ(subbox, supbox);
                }
                this.UVQ = [u, v, q];
            }
            return this.UVQ;
        }
    };
}
//# sourceMappingURL=mmultiscripts.js.map