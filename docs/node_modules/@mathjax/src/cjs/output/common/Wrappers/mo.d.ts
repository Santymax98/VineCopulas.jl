import { CommonWrapper, CommonWrapperClass, CommonWrapperConstructor } from '../Wrapper.js';
import { CommonWrapperFactory } from '../WrapperFactory.js';
import { CharOptions, VariantData, DelimiterData, FontData, FontDataClass } from '../FontData.js';
import { CommonOutputJax } from '../../common.js';
import { BBox } from '../../../util/BBox.js';
import { LineBBox } from '../LineBBox.js';
export interface CommonMo<N, T, D, JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, CC extends CharOptions, VV extends VariantData<CC>, DD extends DelimiterData, FD extends FontData<CC, VV, DD>, FC extends FontDataClass<CC, VV, DD>> extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC> {
    size: number;
    isAccent: boolean;
    breakStyle: string;
    multChar: CommonMo<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>;
    embellishedBreakCount: number;
    embellishedBreakStyle: string;
    protoBBox(bbox: BBox): void;
    moLineBBox(i: number, style: string, obox?: BBox): LineBBox;
    getAccentOffset(): number;
    getCenterOffset(bbox?: BBox): number;
    getStretchedVariant(WH: number[], exact?: boolean): void;
    getSize(name: string, value: number): number;
    getWH(WH: number[]): number;
    getStretchBBox(WHD: number[], D: number, C: DelimiterData): void;
    getBaseline(WHD: number[], HD: number, C: DelimiterData): number[];
    checkExtendedHeight(D: number, C: DelimiterData): number;
    setBreakStyle(linebreak?: string): void;
    getBreakStyle(linebreak?: string): string;
    getMultChar(): void;
}
export interface CommonMoClass<N, T, D, JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, CC extends CharOptions, VV extends VariantData<CC>, DD extends DelimiterData, FD extends FontData<CC, VV, DD>, FC extends FontDataClass<CC, VV, DD>> extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC> {
}
export declare function CommonMoMixin<N, T, D, JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, CC extends CharOptions, VV extends VariantData<CC>, DD extends DelimiterData, FD extends FontData<CC, VV, DD>, FC extends FontDataClass<CC, VV, DD>, B extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>>(Base: CommonWrapperConstructor<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>): B;
