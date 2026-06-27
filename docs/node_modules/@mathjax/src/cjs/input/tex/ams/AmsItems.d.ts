import { ArrayItem, EqnArrayItem } from '../base/BaseItems.js';
import StackItemFactory from '../StackItemFactory.js';
export declare class MultlineItem extends ArrayItem {
    constructor(factory: StackItemFactory, ...args: any[]);
    get kind(): string;
    EndEntry(): void;
    EndRow(): void;
    EndTable(): void;
}
export declare class FlalignItem extends EqnArrayItem {
    name: string;
    numbered: boolean;
    padded: boolean;
    center: boolean;
    get kind(): string;
    constructor(factory: StackItemFactory, name: string, numbered: boolean, padded: boolean, center: boolean);
    EndEntry(): void;
    EndRow(): void;
    EndTable(): void;
}
