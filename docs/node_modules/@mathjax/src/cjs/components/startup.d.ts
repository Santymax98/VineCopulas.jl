import { MathJaxObject as MJObject, MathJaxConfig as MJConfig } from './global.js';
import { MathDocument } from '../core/MathDocument.js';
import { MmlNode } from '../core/MmlTree/MmlNode.js';
import { Handler } from '../core/Handler.js';
import { InputJax } from '../core/InputJax.js';
import { OutputJax } from '../core/OutputJax.js';
import { CommonOutputJax } from '../output/common.js';
import { DOMAdaptor } from '../core/DOMAdaptor.js';
import { PrioritizedList } from '../util/PrioritizedList.js';
import { TeX } from '../input/tex.js';
export interface MathJaxConfig extends MJConfig {
    startup?: {
        input?: string[];
        output?: string;
        handler?: string;
        adaptor?: string;
        document?: any;
        elements?: any[];
        typeset?: boolean;
        ready?: () => void;
        pageReady?: () => void;
        invalidOption?: 'fatal' | 'warn';
        optionError?: (message: string, key: string) => void;
        loadAllFontFiles: false;
        [name: string]: any;
    };
}
export type MATHDOCUMENT = MathDocument<any, any, any> & {
    menu?: {
        loadingPromise: Promise<void>;
    };
};
export type HANDLER = Handler<any, any, any>;
export type DOMADAPTOR = DOMAdaptor<any, any, any>;
export type INPUTJAX = InputJax<any, any, any>;
export type OUTPUTJAX = OutputJax<any, any, any>;
export type COMMONJAX = CommonOutputJax<any, any, any, any, any, any, any, any, any, any, any>;
export type TEX = TeX<any, any, any>;
export type JAXARRAY = INPUTJAX[] & {
    [name: string]: INPUTJAX;
};
export type HandlerExtension = (handler: HANDLER) => HANDLER;
export interface MathJaxObject extends MJObject {
    config: MathJaxConfig;
    startup: {
        constructors: {
            [name: string]: any;
        };
        input: JAXARRAY;
        output: OUTPUTJAX;
        handler: HANDLER;
        adaptor: DOMADAPTOR;
        elements: any[];
        document: MATHDOCUMENT;
        promise: Promise<any>;
        registerConstructor(name: string, constructor: any): void;
        useHandler(name: string, force?: boolean): void;
        useAdaptor(name: string, force?: boolean): void;
        useOutput(name: string, force?: boolean): void;
        useInput(name: string, force?: boolean): void;
        extendHandler(extend: HandlerExtension): void;
        toMML(node: MmlNode): string;
        defaultReady(): void;
        defaultPageReady(): Promise<void>;
        defaultOptionError(message: string, key: string): void;
        getComponents(): void;
        makeMethods(): void;
        makeTypesetMethods(): void;
        makeOutputMethods(iname: string, oname: string, input: INPUTJAX): void;
        makeMmlMethods(name: string, input: INPUTJAX): void;
        makeResetMethod(name: string, input: INPUTJAX): void;
        getInputJax(): JAXARRAY;
        getOutputJax(): OUTPUTJAX;
        getAdaptor(): DOMADAPTOR;
        getHandler(): HANDLER;
    };
    [name: string]: any;
}
export declare abstract class Startup {
    static extensions: PrioritizedList<HandlerExtension>;
    static visitor: any;
    static mathjax: any;
    static constructors: {
        [name: string]: any;
    };
    static input: JAXARRAY;
    static output: OUTPUTJAX;
    static handler: HANDLER;
    static adaptor: DOMADAPTOR;
    static elements: any[];
    static document: MATHDOCUMENT;
    static promiseResolve: (value?: any) => any;
    static promiseReject: (reason: any) => void;
    static promise: Promise<any>;
    static pagePromise: Promise<void>;
    static hasTypeset: boolean;
    static toMML(node: MmlNode): string;
    static registerConstructor(name: string, constructor: any): void;
    static useHandler(name: string, force?: boolean): void;
    static useAdaptor(name: string, force?: boolean): void;
    static useInput(name: string, force?: boolean): void;
    static useOutput(name: string, force?: boolean): void;
    static extendHandler(extend: HandlerExtension, priority?: number): void;
    static defaultReady(): void;
    static defaultPageReady(): Promise<void>;
    static defaultOptionError: (message: string, _key: string) => void;
    static typesetPromise(elements: any[]): Promise<any>;
    static getComponents(): void;
    static makeMethods(): void;
    static makeTypesetMethods(): void;
    static makeOutputMethods(iname: string, oname: string, input: INPUTJAX): void;
    static makeMmlMethods(name: string, input: INPUTJAX): void;
    static makeResetMethod(name: string, input: INPUTJAX): void;
    static getInputJax(): JAXARRAY;
    static getOutputJax(): OUTPUTJAX;
    static getAdaptor(): DOMADAPTOR;
    static getHandler(): HANDLER;
    static getDocument(root?: any): MathDocument<any, any, any>;
}
export declare const MathJax: MathJaxObject;
export declare const CONFIG: {
    [name: string]: any;
    input?: string[];
    output?: string;
    handler?: string;
    adaptor?: string;
    document?: any;
    elements?: any[];
    typeset?: boolean;
    ready?: () => void;
    pageReady?: () => void;
    invalidOption?: "fatal" | "warn";
    optionError?: (message: string, key: string) => void;
    loadAllFontFiles: false;
};
