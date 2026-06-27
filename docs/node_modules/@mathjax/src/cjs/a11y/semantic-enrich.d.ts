import { Handler } from '../core/Handler.js';
import { MathDocument, AbstractMathDocument, MathDocumentConstructor } from '../core/MathDocument.js';
import { MathItem, AbstractMathItem } from '../core/MathItem.js';
import { MmlNode } from '../core/MmlTree/MmlNode.js';
import { HtmlNode } from '../core/MmlTree/MmlNodes/HtmlNode.js';
import { MathML } from '../input/mathml.js';
import { SerializedMmlVisitor } from '../core/MmlTree/SerializedMmlVisitor.js';
export type Constructor<T> = new (...args: any[]) => T;
export declare class enrichVisitor<N, T, D> extends SerializedMmlVisitor {
    protected mactionId: number;
    visitTree(node: MmlNode, math?: MathItem<N, T, D>): string;
    visitHtmlNode(node: HtmlNode<any>, _space: string): string;
    visitMactionNode(node: MmlNode, space: string): string;
}
export interface EnrichedMathItem<N, T, D> extends MathItem<N, T, D> {
    toMathML: (node: MmlNode, math: MathItem<N, T, D>) => string;
    enrich(document: MathDocument<N, T, D>, force?: boolean): void;
    unEnrich(document: MathDocument<N, T, D>): void;
    toEnriched(mml: string): string;
}
export declare function EnrichedMathItemMixin<N, T, D, B extends Constructor<AbstractMathItem<N, T, D>>>(BaseMathItem: B, MmlJax: MathML<N, T, D>, toMathML: (node: MmlNode, math: MathItem<N, T, D>) => string): Constructor<EnrichedMathItem<N, T, D>> & B;
export interface EnrichedMathDocument<N, T, D> extends AbstractMathDocument<N, T, D> {
    enrich(): EnrichedMathDocument<N, T, D>;
    enrichError(doc: EnrichedMathDocument<N, T, D>, math: EnrichedMathItem<N, T, D>, err: Error): void;
}
export declare function EnrichedMathDocumentMixin<N, T, D, B extends MathDocumentConstructor<AbstractMathDocument<N, T, D>>>(BaseDocument: B, MmlJax: MathML<N, T, D>): MathDocumentConstructor<EnrichedMathDocument<N, T, D>> & B;
export declare function EnrichHandler<N, T, D>(handler: Handler<N, T, D>, MmlJax: MathML<N, T, D>): Handler<N, T, D>;
