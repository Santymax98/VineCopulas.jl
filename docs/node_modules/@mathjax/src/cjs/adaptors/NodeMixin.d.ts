import { DOMAdaptor } from '../core/DOMAdaptor.js';
import { OptionList } from '../util/Options.js';
export interface WebWorker {
    on(kind: string, listener: (event: Event) => void): void;
    postMessage(msg: any): void;
    terminate(): void;
}
export type Constructor<T> = new (...args: any[]) => T;
export type AdaptorConstructor<N, T, D> = Constructor<DOMAdaptor<N, T, D>>;
export declare const NodeMixinOptions: OptionList;
export declare function NodeMixin<N, T, D, A extends AdaptorConstructor<N, T, D>>(Base: A, options?: typeof NodeMixinOptions): A;
