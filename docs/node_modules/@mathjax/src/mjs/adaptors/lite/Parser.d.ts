import { AttributeData } from '../../core/DOMAdaptor.js';
import { MinDOMParser } from '../HTMLAdaptor.js';
import { LiteDocument } from './Document.js';
import { LiteElement } from './Element.js';
import { LiteText, LiteComment } from './Text.js';
import { LiteAdaptor } from '../liteAdaptor.js';
export declare const PATTERNS: {
    tag: RegExp;
    attr: RegExp;
    attrsplit: RegExp;
};
export declare class LiteParser implements MinDOMParser<LiteDocument> {
    static SELF_CLOSING: {
        [name: string]: boolean;
    };
    static PCDATA: {
        [name: string]: boolean;
    };
    static XMLNS: {
        [name: string]: string;
    };
    parseFromString(text: string, _format?: string, adaptor?: LiteAdaptor): LiteDocument;
    protected addText(adaptor: LiteAdaptor, node: LiteElement, text: string): LiteText;
    protected addComment(adaptor: LiteAdaptor, node: LiteElement, comment: string): LiteComment;
    protected closeTag(adaptor: LiteAdaptor, node: LiteElement, tag: string): LiteElement;
    protected openTag(adaptor: LiteAdaptor, node: LiteElement, tag: string, parts: string[]): LiteElement;
    protected addAttributes(adaptor: LiteAdaptor, node: LiteElement, attributes: string[]): void;
    protected handlePCDATA(adaptor: LiteAdaptor, node: LiteElement, kind: string, parts: string[]): void;
    protected checkDocument(adaptor: LiteAdaptor, root: LiteDocument): void;
    protected getOnlyChild(adaptor: LiteAdaptor, body: LiteElement): LiteElement;
    serialize(adaptor: LiteAdaptor, node: LiteElement, xml?: boolean): string;
    serializeInner(adaptor: LiteAdaptor, node: LiteElement, xml?: boolean): string;
    protected allAttributes(adaptor: LiteAdaptor, node: LiteElement, xml: boolean): AttributeData[];
    protectAttribute(text: string, xml: boolean): string;
    protectHTML(text: string): string;
}
