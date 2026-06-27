import { CommonWrapper, CommonWrapperClass, Constructor } from '../Wrapper.js';
import { CommonWrapperFactory } from '../WrapperFactory.js';
import { CharOptions, VariantData, DelimiterData, FontData, FontDataClass } from '../FontData.js';
import { CommonOutputJax } from '../../common.js';
import { CommonMsubsup, CommonMsubsupClass } from './msubsup.js';
import { BBox } from '../../../util/BBox.js';
export type ScriptData = {
    base: BBox;
    sub: BBox;
    sup: BBox;
    psub: BBox;
    psup: BBox;
    numPrescripts: number;
    numScripts: number;
};
export type ScriptDataName = keyof ScriptData;
export type ScriptLists = {
    base: BBox[];
    subList: BBox[];
    supList: BBox[];
    psubList: BBox[];
    psupList: BBox[];
};
export type ScriptListName = keyof ScriptLists;
export declare const NextScript: {
    [key: string]: ScriptListName;
};
export declare const ScriptNames: ScriptDataName[];
export interface CommonMmultiscripts<N, T, D, JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, CC extends CharOptions, VV extends VariantData<CC>, DD extends DelimiterData, FD extends FontData<CC, VV, DD>, FC extends FontDataClass<CC, VV, DD>> extends CommonMsubsup<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC> {
    scriptData: ScriptData;
    firstPrescript: number;
    combinePrePost(pre: BBox, post: BBox): BBox;
    getScriptData(): void;
    getScriptBBoxLists(): ScriptLists;
    padLists(list1: BBox[], list2: BBox[]): void;
    combineBBoxLists(bbox1: BBox, bbox2: BBox, list1: BBox[], list2: BBox[]): void;
    getScaledWHD(bbox: BBox): void;
    getCombinedUV(): number[];
    addPrescripts(bbox: BBox, u: number, v: number): BBox;
}
export interface CommonMmultiscriptsClass<N, T, D, JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, CC extends CharOptions, VV extends VariantData<CC>, DD extends DelimiterData, FD extends FontData<CC, VV, DD>, FC extends FontDataClass<CC, VV, DD>> extends CommonMsubsupClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC> {
}
export declare function CommonMmultiscriptsMixin<N, T, D, JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, CC extends CharOptions, VV extends VariantData<CC>, DD extends DelimiterData, FD extends FontData<CC, VV, DD>, FC extends FontDataClass<CC, VV, DD>, B extends CommonMsubsupClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>>(Base: Constructor<CommonMsubsup<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>>): B;
