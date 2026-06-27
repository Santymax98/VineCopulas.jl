import { CommonWrapper, CommonWrapperClass, CommonWrapperConstructor } from '../Wrapper.js';
import { CommonWrapperFactory } from '../WrapperFactory.js';
import { CharOptions, VariantData, DelimiterData, FontData, FontDataClass } from '../FontData.js';
import { CommonOutputJax } from '../../common.js';
import { CommonMsqrt } from './msqrt.js';
import * as Notation from '../Notation.js';
export interface CommonMenclose<N, T, D, JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, CC extends CharOptions, VV extends VariantData<CC>, DD extends DelimiterData, FD extends FontData<CC, VV, DD>, FC extends FontDataClass<CC, VV, DD>, S extends CommonMsqrt<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>> extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC> {
    notations: Notation.List<WW, N>;
    renderChild: Notation.Renderer<WW, N>;
    msqrt: S;
    padding: number;
    thickness: number;
    arrowhead: {
        x: number;
        y: number;
        dx: number;
    };
    TRBL: Notation.PaddingData;
    getParameters(): void;
    getNotations(): void;
    removeRedundantNotations(): void;
    initializeNotations(): void;
    getBBoxExtenders(): Notation.PaddingData;
    getPadding(): Notation.PaddingData;
    maximizeEntries(X: Notation.PaddingData, Y: Notation.PaddingData): void;
    getOffset(direction: string): number;
    getArgMod(w: number, h: number): [number, number];
    arrow(w: number, a: number, double: boolean, offset?: string, trans?: number): N;
    arrowData(): {
        a: number;
        W: number;
        x: number;
        y: number;
    };
    arrowAW(): [number, number];
    createMsqrt(child: WW): S;
    sqrtTRBL(): number[];
}
export interface CommonMencloseClass<N, T, D, JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, CC extends CharOptions, VV extends VariantData<CC>, DD extends DelimiterData, FD extends FontData<CC, VV, DD>, FC extends FontDataClass<CC, VV, DD>> extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC> {
    notations: Notation.DefList<WW, N>;
}
export declare function CommonMencloseMixin<N, T, D, JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, CC extends CharOptions, VV extends VariantData<CC>, DD extends DelimiterData, FD extends FontData<CC, VV, DD>, FC extends FontDataClass<CC, VV, DD>, S extends CommonMsqrt<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, B extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>>(Base: CommonWrapperConstructor<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>): B;
