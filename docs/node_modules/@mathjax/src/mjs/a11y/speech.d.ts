import { Handler } from '../core/Handler.js';
import { MathDocument, MathDocumentConstructor } from '../core/MathDocument.js';
import { EnrichedMathItem, EnrichedMathDocument } from './semantic-enrich.js';
import { MathML } from '../input/mathml.js';
import { GeneratorPool } from './speech/GeneratorPool.js';
import { WorkerHandler } from './speech/WebWorker.js';
export type Constructor<T> = new (...args: any[]) => T;
export interface SpeechMathItem<N, T, D> extends EnrichedMathItem<N, T, D> {
    generatorPool: GeneratorPool<N, T, D>;
    attachSpeech(document: MathDocument<N, T, D>): void;
    detachSpeech(document: MathDocument<N, T, D>): void;
    speechFor(mml: string): Promise<[string, string]>;
}
export declare function SpeechMathItemMixin<N, T, D, B extends Constructor<EnrichedMathItem<N, T, D>>>(EnrichedMathItem: B): Constructor<SpeechMathItem<N, T, D>> & B;
export interface SpeechMathDocument<N, T, D> extends EnrichedMathDocument<N, T, D> {
    webworker: WorkerHandler<N, T, D>;
    attachSpeech(): SpeechMathDocument<N, T, D>;
    speechError(doc: SpeechMathDocument<N, T, D>, math: SpeechMathItem<N, T, D>, err: Error): void;
    getWebworker(): void;
}
export declare function SpeechMathDocumentMixin<N, T, D, B extends MathDocumentConstructor<EnrichedMathDocument<N, T, D>>>(EnrichedMathDocument: B): MathDocumentConstructor<SpeechMathDocument<N, T, D>> & B;
export declare function SpeechHandler<N, T, D>(handler: Handler<N, T, D>, MmlJax: MathML<N, T, D>): Handler<N, T, D>;
