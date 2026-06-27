import { AbstractVisitor } from '../../core/Tree/Visitor.js';
import { CommonOutputJax } from '../common.js';
import { CommonWrapperFactory } from './WrapperFactory.js';
import { FontData, FontDataClass, DelimiterData, VariantData, CharOptions } from './FontData.js';
import { CommonWrapper, CommonWrapperClass } from './Wrapper.js';
import { CommonMo } from './Wrappers/mo.js';
import { CommonMspace } from './Wrappers/mspace.js';
import { BBox } from '../../util/BBox.js';
import { MmlNode } from '../../core/MmlTree/MmlNode.js';
export declare const NOBREAK = 1000000;
export type IndexData = [number, number] | null;
export type BreakData<WW> = [[WW, IndexData], number, number, number, number];
export interface StateData<WW> {
    breaks: Set<[WW, IndexData]>;
    potential: BreakData<WW>[];
    width: number;
    w: number;
    prevWidth: number;
    prevBreak: BreakData<WW>;
    depth: number;
    mathWidth: number;
    mathLeft: number;
}
export declare class Linebreaks<N, T, D, JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, CC extends CharOptions, VV extends VariantData<CC>, DD extends DelimiterData, FD extends FontData<CC, VV, DD>, FC extends FontDataClass<CC, VV, DD>> extends AbstractVisitor<WW> {
    breakToWidth(_wrapper: WW, _W: number): void;
}
export declare class LinebreakVisitor<N, T, D, JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, CC extends CharOptions, VV extends VariantData<CC>, DD extends DelimiterData, FD extends FontData<CC, VV, DD>, FC extends FontDataClass<CC, VV, DD>> extends Linebreaks<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC> {
    protected PENALTY: {
        [key: string]: (p: number) => number;
    };
    protected FACTORS: {
        [key: string]: (p: number, mo?: CommonMo<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>) => number;
    };
    protected TEXCLASS: {
        [key: string]: (p: number) => number;
    };
    protected state: StateData<WW>;
    breakToWidth(wrapper: WW, W: number): void;
    protected createState(wrapper: WW): StateData<WW>;
    protected breakLineToWidth(wrapper: WW, i: number): void;
    protected addWidth(bbox: BBox, w?: number): void;
    protected processBreak(): void;
    protected pushBreak(wrapper: WW, penalty: number, w: number, ij: IndexData): void;
    protected getBorderLR(wrapper: WW): [number, number];
    protected getFirstToken(node: MmlNode): MmlNode;
    protected getLastToken(node: MmlNode): MmlNode;
    visitNode(wrapper: WW, i: number): void;
    visitDefault(wrapper: WW, i: number): void;
    visitEmbellishedOperator(wrapper: WW, _i: number): void;
    visitMoNode(wrapper: WW, _i: number): void;
    protected moPenalty(mo: CommonMo<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>): number;
    protected getPrevious(mo: CommonMo<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>): MmlNode | null;
    visitMspaceNode(wrapper: WW, i: number): void;
    protected mspacePenalty(mspace: CommonMspace<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>): number;
    visitMtextNode(wrapper: WW, i: number): void;
    protected mtextPenalty(): number;
    visitMrowNode(wrapper: WW, i: number): void;
    visitInferredMrowNode(wrapper: WW, i: number): void;
    visitMfracNode(wrapper: WW, i: number): void;
    visitMsqrtNode(wrapper: WW, i: number): void;
    visitMrootNode(wrapper: WW, i: number): void;
    visitMsubNode(wrapper: WW, i: number): void;
    visitMsupNode(wrapper: WW, i: number): void;
    visitMsubsupNode(wrapper: WW, i: number): void;
    visitMmultiscriptsNode(wrapper: WW, i: number): void;
    visitMfencedNode(wrapper: WW, i: number): void;
    visitMactionNode(wrapper: WW, i: number): void;
}
