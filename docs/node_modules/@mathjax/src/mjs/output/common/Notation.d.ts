import { CommonWrapper } from './Wrapper.js';
import { CommonMenclose } from './Wrappers/menclose.js';
export declare const ARROWX = 4;
export declare const ARROWDX = 1;
export declare const ARROWY = 2;
export declare const THICKNESS = 0.067;
export declare const PADDING = 0.2;
export declare const SOLID: string;
export type Menclose = CommonMenclose<any, any, any, any, any, any, any, any, any, any, any, any, any>;
export type AnyWrapper = CommonWrapper<any, any, any, any, any, any, any, any, any, any, any, any>;
export type PaddingData = [number, number, number, number];
export type Renderer<W extends AnyWrapper, N> = (node: W, child: N) => void;
export type BBoxExtender<W extends AnyWrapper> = (node: W) => PaddingData;
export type BBoxBorder<W extends AnyWrapper> = (node: W) => PaddingData;
export type Initializer<W extends AnyWrapper> = (node: W) => void;
export type NotationDef<W extends AnyWrapper, N> = {
    renderer: Renderer<W, N>;
    bbox: BBoxExtender<W>;
    border?: BBoxBorder<W>;
    renderChild?: boolean;
    init?: Initializer<W>;
    remove?: string;
};
export type DefPair<W extends AnyWrapper, N> = [string, NotationDef<W, N>];
export type DefList<W extends AnyWrapper, N> = Map<string, NotationDef<W, N>>;
export type DefPairF<T, W extends AnyWrapper, N> = (name: T) => DefPair<W, N>;
export type List<W extends AnyWrapper, N> = {
    [notation: string]: NotationDef<W, N>;
};
export declare const sideIndex: {
    top: number;
    right: number;
    bottom: number;
    left: number;
};
export type Side = keyof typeof sideIndex;
export declare const sideNames: Side[];
export declare const fullBBox: BBoxExtender<Menclose>;
export declare const fullPadding: BBoxExtender<Menclose>;
export declare const fullBorder: BBoxBorder<Menclose>;
export declare const arrowHead: (node: Menclose) => number;
export declare const arrowBBoxHD: (node: Menclose, TRBL: PaddingData) => PaddingData;
export declare const arrowBBoxW: (node: Menclose, TRBL: PaddingData) => PaddingData;
export declare const arrowDef: {
    [name: string]: [number, boolean, boolean, string];
};
export declare const diagonalArrowDef: {
    [name: string]: [number, number, boolean, string];
};
export declare const arrowBBox: {
    [name: string]: BBoxExtender<Menclose>;
};
export declare const CommonBorder: <W extends Menclose, N>(render: Renderer<W, N>) => DefPairF<Side, W, N>;
export declare const CommonBorder2: <W extends Menclose, N>(render: Renderer<W, N>) => (name: string, side1: Side, side2: Side) => DefPair<W, N>;
export declare const CommonDiagonalStrike: <W extends Menclose, N>(render: (sname: string) => Renderer<W, N>) => DefPairF<string, W, N>;
export declare const CommonDiagonalArrow: <W extends Menclose, N>(render: Renderer<W, N>) => DefPairF<string, W, N>;
export declare const CommonArrow: <W extends Menclose, N>(render: Renderer<W, N>) => DefPairF<string, W, N>;
