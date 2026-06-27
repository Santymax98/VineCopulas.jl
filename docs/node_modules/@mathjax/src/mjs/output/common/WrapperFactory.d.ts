import { CommonOutputJax } from '../common.js';
import { AbstractWrapperFactory } from '../../core/Tree/WrapperFactory.js';
import { CommonWrapper, CommonWrapperClass } from './Wrapper.js';
import { CharOptions, VariantData, DelimiterData, FontData, FontDataClass } from './FontData.js';
import { MmlNode, MmlNodeClass } from '../../core/MmlTree/MmlNode.js';
export declare class CommonWrapperFactory<N, T, D, JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, CC extends CharOptions, VV extends VariantData<CC>, DD extends DelimiterData, FD extends FontData<CC, any, DD>, FC extends FontDataClass<CC, VV, DD>> extends AbstractWrapperFactory<MmlNode, MmlNodeClass, WW, WC> {
    static defaultNodes: {
        [kind: string]: CommonWrapperClass<any, any, any, any, any, any, any, any, any, any, any, any>;
    };
    jax: JX;
    get Wrappers(): object;
}
