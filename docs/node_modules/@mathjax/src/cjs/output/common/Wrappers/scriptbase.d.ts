import { CommonWrapper, CommonWrapperClass, CommonWrapperConstructor, Constructor } from '../Wrapper.js';
import { CommonWrapperFactory } from '../WrapperFactory.js';
import { CharOptions, VariantData, DelimiterData, FontData, FontDataClass } from '../FontData.js';
import { CommonOutputJax } from '../../common.js';
import { BBox } from '../../../util/BBox.js';
export interface CommonScriptbase<N, T, D, JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, CC extends CharOptions, VV extends VariantData<CC>, DD extends DelimiterData, FD extends FontData<CC, VV, DD>, FC extends FontDataClass<CC, VV, DD>> extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC> {
    readonly baseCore: WW;
    readonly baseChild: WW;
    readonly baseScale: number;
    readonly baseIc: number;
    readonly baseRemoveIc: boolean;
    readonly baseIsChar: boolean;
    readonly baseHasAccentOver: boolean;
    readonly baseHasAccentUnder: boolean;
    readonly isLineAbove: boolean;
    readonly isLineBelow: boolean;
    readonly isMathAccent: boolean;
    readonly scriptChild: WW;
    getBaseCore(): WW;
    setBaseAccentsFor(core: WW): void;
    getSemanticBase(): WW;
    getBaseFence(fence: WW, id: string): WW;
    getBaseScale(): number;
    getBaseIc(): number;
    getAdjustedIc(): number;
    isCharBase(): boolean;
    checkLineAccents(): void;
    isLineAccent(script: WW): boolean;
    getBaseWidth(): number;
    getOffset(): number[];
    baseCharZero(n: number): number;
    getV(): number;
    getU(): number;
    hasMovableLimits(): boolean;
    getOverKU(basebox: BBox, overbox: BBox): number[];
    getUnderKV(basebox: BBox, underbox: BBox): number[];
    getDeltaW(boxes: BBox[], delta?: number[]): number[];
    getDelta(script: WW, noskew?: boolean): number;
    stretchChildren(): void;
    appendScripts(bbox: BBox): BBox;
}
export interface CommonScriptbaseClass<N, T, D, JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, CC extends CharOptions, VV extends VariantData<CC>, DD extends DelimiterData, FD extends FontData<CC, VV, DD>, FC extends FontDataClass<CC, VV, DD>> extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC> {
    useIC: boolean;
}
export type CommonScriptbaseConstructor<N, T, D, JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, CC extends CharOptions, VV extends VariantData<CC>, DD extends DelimiterData, FD extends FontData<CC, VV, DD>, FC extends FontDataClass<CC, VV, DD>> = Constructor<CommonScriptbase<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>>;
export declare function CommonScriptbaseMixin<N, T, D, JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, CC extends CharOptions, VV extends VariantData<CC>, DD extends DelimiterData, FD extends FontData<CC, VV, DD>, FC extends FontDataClass<CC, VV, DD>, B extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>>(Base: CommonWrapperConstructor<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>): B;
