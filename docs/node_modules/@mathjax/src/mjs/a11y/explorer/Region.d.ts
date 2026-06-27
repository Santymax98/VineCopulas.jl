import { MathDocument } from '../../core/MathDocument.js';
import { StyleJsonSheet } from '../../util/StyleJson.js';
import { Highlighter } from './Highlighter.js';
import { SsmlElement } from '../speech/SpeechUtil.js';
export type A11yDocument = MathDocument<HTMLElement, Text, Document>;
export interface Region<T> {
    AddStyles(): void;
    AddElement(): void;
    Show(node: HTMLElement): void;
    Hide(): void;
    Clear(): void;
    Update(content: T): void;
}
export declare abstract class AbstractRegion<T> implements Region<T> {
    document: A11yDocument;
    protected static className: string;
    protected static style: StyleJsonSheet;
    div: HTMLElement;
    protected inner: HTMLElement;
    protected CLASS: typeof AbstractRegion;
    constructor(document: A11yDocument);
    static get sheetId(): string;
    static get styleSheet(): HTMLStyleElement;
    AddStyles(): void;
    AddElement(): void;
    Show(node: HTMLElement): void;
    protected abstract position(node: HTMLElement): void;
    Hide(): void;
    abstract Clear(): void;
    abstract Update(content: T): void;
    protected stackRegions(node: HTMLElement): void;
}
export declare class DummyRegion extends AbstractRegion<void> {
    Clear(): void;
    Update(): void;
    Hide(): void;
    Show(): void;
    AddElement(): void;
    AddStyles(): void;
    position(): void;
}
export declare class StringRegion extends AbstractRegion<string> {
    Clear(): void;
    Update(speech: string): void;
    protected position(node: HTMLElement): void;
}
export declare class ToolTip extends StringRegion {
    protected static className: string;
    protected static style: StyleJsonSheet;
}
export declare class LiveRegion extends StringRegion {
    protected static className: string;
    static priority: {
        primary: number;
        secondary: number;
    };
    protected static style: StyleJsonSheet;
    static setColor(type: string, priority: number, color: string, opacity: number): void;
}
export declare class SpeechRegion extends LiveRegion {
    protected static style: StyleJsonSheet;
    active: boolean;
    node: Element;
    private clear;
    highlighter: Highlighter;
    Show(node: HTMLElement): void;
    private voiceRequest;
    private voiceCancelled;
    Update(speech: string): void;
    private makeVoice;
    protected makeUtterances(ssml: SsmlElement[], locale: string): void;
    Hide(): void;
    cancelVoice(): void;
    private highlightNode;
}
export declare class HoverRegion extends AbstractRegion<HTMLElement> {
    protected static className: string;
    protected static style: StyleJsonSheet;
    protected position(node: HTMLElement): void;
    Show(node: HTMLElement): void;
    Clear(): void;
    Update(node: HTMLElement): void;
    protected cloneNode(node: HTMLElement): HTMLElement;
    protected chtmlClone(node: HTMLElement, enclosed: Element[], mjx: HTMLElement): void;
    protected svgClone(node: Element, enclosed: Element[], mjx: HTMLElement, container: Element): void;
    protected xy(node: Element): number[];
}
