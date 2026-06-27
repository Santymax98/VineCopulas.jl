import { DOMAdaptor, minWorker } from '../../core/DOMAdaptor.js';
import { OptionList } from '../../util/Options.js';
import { Message, ClientCommand, Structure } from './MessageTypes.js';
import { SpeechMathItem } from '../speech.js';
export declare class WorkerHandler<N, T, D> {
    adaptor: DOMAdaptor<N, T, D>;
    private options;
    ready: boolean;
    private tasks;
    protected worker: minWorker;
    constructor(adaptor: DOMAdaptor<N, T, D>, options: OptionList);
    Start(): Promise<void>;
    private debug;
    Listener(event: MessageEvent): void;
    Post(msg: ClientCommand, item?: SpeechMathItem<N, T, D>): Promise<any>;
    private postNext;
    Cancel(item: SpeechMathItem<N, T, D>): void;
    Setup(options: OptionList): Promise<void>;
    Speech(math: string, options: OptionList, item: SpeechMathItem<N, T, D>): Promise<void>;
    nextRules(math: string, options: OptionList, item: SpeechMathItem<N, T, D>): Promise<void>;
    nextStyle(math: string, options: OptionList, nodeId: string, item: SpeechMathItem<N, T, D>): Promise<void>;
    speechFor(math: string, options: OptionList, item: SpeechMathItem<N, T, D>): Promise<Structure>;
    Attach(item: SpeechMathItem<N, T, D>, speech: boolean, braille: boolean, structure: string): void;
    protected setSpeechAttribute(node: N, data: Structure, speech: boolean, braille: boolean): void;
    protected setSpeechAttributes(root: N | T, rootId: string, data: Structure, speech: boolean, braille: boolean): string;
    protected setSpecialAttributes(node: N, map: OptionList, prefix: string, keys?: string[]): void;
    Detach(item: SpeechMathItem<N, T, D>): void;
    detachSpeech(node: N): void;
    Terminate(): Promise<any> | void;
    Stop(): Promise<void>;
    clearspeakLocalePreferences(options: OptionList, prefs: Map<string, {
        [prop: string]: string[];
    }>): Promise<void>;
    clearspeakRelevantPreferences(math: string, nodeId: string, prefs: Map<number, string>, counter: number): Promise<void>;
    Commands: {
        [id: string]: (handler: WorkerHandler<N, T, D>, data: Message) => void;
    };
}
