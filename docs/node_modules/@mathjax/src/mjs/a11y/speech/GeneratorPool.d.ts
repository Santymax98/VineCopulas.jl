import { OptionList } from '../../util/Options.js';
import { LiveRegion } from '../explorer/Region.js';
import { DOMAdaptor } from '../../core/DOMAdaptor.js';
import { SpeechMathItem } from '../speech.js';
import { WorkerHandler } from './WebWorker.js';
export declare class GeneratorPool<N, T, D> {
    private webworker;
    private _element;
    set element(element: Element);
    get element(): Element;
    promise: Promise<void>;
    adaptor: DOMAdaptor<N, T, D>;
    private _options;
    set options(options: OptionList);
    get options(): OptionList;
    private _init;
    init(options: OptionList, adaptor: DOMAdaptor<N, T, D>, webworker: WorkerHandler<N, T, D>): void;
    update(options: OptionList): void;
    Speech(item: SpeechMathItem<N, T, D>): Promise<void>;
    SpeechFor(item: SpeechMathItem<N, T, D>, mml: string): Promise<any>;
    cancel(item: SpeechMathItem<N, T, D>): void;
    updateRegions(node: N, speechRegion: LiveRegion, brailleRegion: LiveRegion): void;
    private getOptions;
    nextRules(item: SpeechMathItem<N, T, D>): Promise<void>;
    nextStyle(node: N, item: SpeechMathItem<N, T, D>): Promise<void>;
    getLabel(node: N, _center?: string, sep?: string): string;
    getBraille(node: N): string;
    getLocalePreferences(prefs: Map<string, {
        [prop: string]: string[];
    }>): Promise<void>;
    getRelevantPreferences(item: SpeechMathItem<N, T, D>, semantic: string, prefs: Map<number, string>, counter: number): Promise<void>;
}
