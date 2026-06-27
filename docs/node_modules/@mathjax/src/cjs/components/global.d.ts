export interface MathJaxConfig {
    [name: string]: any;
}
export interface MathJaxLibrary {
    [name: string]: any;
}
export interface MathJaxObject {
    version: string;
    _: MathJaxLibrary;
    config: MathJaxConfig;
}
export declare const GLOBAL: Window & {
    MathJax: MathJaxObject | MathJaxConfig;
};
export declare function isObject(x: any): boolean;
export declare function combineConfig(dst: any, src: any, check?: boolean): any;
export declare function combineDefaults(dst: any, name: string, src: any): any;
export declare function combineWithMathJax(config: any): MathJaxObject;
export declare const MathJax: MathJaxObject;
