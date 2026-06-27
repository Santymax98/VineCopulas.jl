import { CommonWrapper, CommonWrapperClass, CommonWrapperConstructor } from '../Wrapper.js';
import { CommonWrapperFactory } from '../WrapperFactory.js';
import { CharOptions, VariantData, DelimiterData, FontData, FontDataClass } from '../FontData.js';
import { CommonOutputJax } from '../../common.js';
import { CommonTextNode } from './TextNode.js';
export interface CommonMglyph<N, T, D, JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, CC extends CharOptions, VV extends VariantData<CC>, DD extends DelimiterData, FD extends FontData<CC, VV, DD>, FC extends FontDataClass<CC, VV, DD>> extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC> {
    width: number;
    height: number;
    valign: number;
    charWrapper: CommonTextNode<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>;
    getParameters(): void;
}
export interface CommonMglyphClass<N, T, D, JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, CC extends CharOptions, VV extends VariantData<CC>, DD extends DelimiterData, FD extends FontData<CC, VV, DD>, FC extends FontDataClass<CC, VV, DD>> extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC> {
}
export declare function CommonMglyphMixin<N, T, D, JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, CC extends CharOptions, VV extends VariantData<CC>, DD extends DelimiterData, FD extends FontData<CC, VV, DD>, FC extends FontDataClass<CC, VV, DD>, B extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>>(Base: CommonWrapperConstructor<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>): B;
