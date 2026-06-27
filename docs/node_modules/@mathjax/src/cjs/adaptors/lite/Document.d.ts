import { LiteElement } from './Element.js';
import { LiteWindow } from './Window.js';
export declare class LiteDocument {
    defaultView: LiteWindow;
    root: LiteElement;
    head: LiteElement;
    body: LiteElement;
    type: string;
    get kind(): string;
    constructor(window?: LiteWindow);
}
