import { MathDocumentConstructor } from '../../core/MathDocument.js';
import { Handler } from '../../core/Handler.js';
import { ComplexityMathDocument, ComplexityMathItem } from '../../a11y/complexity.js';
import { AssistiveMmlMathDocument, AssistiveMmlMathItem } from '../../a11y/assistive-mml.js';
import { SpeechMathDocument } from '../../a11y/speech.js';
import { Menu } from './Menu.js';
import '../../a11y/speech/SpeechMenu.js';
export type Constructor<T> = new (...args: any[]) => T;
export type A11yMathItem = ComplexityMathItem<HTMLElement, Text, Document> & AssistiveMmlMathItem<HTMLElement, Text, Document>;
export type A11yMathItemConstructor = {
    new (...args: any[]): A11yMathItem;
};
export type A11yMathDocument = ComplexityMathDocument<HTMLElement, Text, Document> & SpeechMathDocument<HTMLElement, Text, Document> & AssistiveMmlMathDocument<HTMLElement, Text, Document>;
export type A11yDocumentConstructor = MathDocumentConstructor<A11yMathDocument>;
export interface MenuMathItem extends ComplexityMathItem<HTMLElement, Text, Document> {
    addMenu(document: MenuMathDocument, force?: boolean): void;
    getMenus(document: MenuMathDocument): void;
    checkLoading(document: MenuMathDocument): void;
}
export declare function MenuMathItemMixin<B extends A11yMathItemConstructor>(BaseMathItem: B): Constructor<MenuMathItem> & B;
export interface MenuMathDocument extends ComplexityMathDocument<HTMLElement, Text, Document>, SpeechMathDocument<HTMLElement, Text, Document> {
    menu: Menu;
    addMenu(): MenuMathDocument;
    checkLoading(): boolean;
}
export declare function MenuMathDocumentMixin<B extends A11yDocumentConstructor>(BaseDocument: B): Constructor<MenuMathDocument> & B;
export declare function MenuHandler(handler: Handler<HTMLElement, Text, Document>): Handler<HTMLElement, Text, Document>;
