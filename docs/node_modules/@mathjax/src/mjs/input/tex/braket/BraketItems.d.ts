import { CheckType, BaseItem, StackItem } from '../StackItem.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export declare class BraketItem extends BaseItem {
    get kind(): string;
    get isOpen(): boolean;
    barNodes: MmlNode[];
    checkItem(item: StackItem): CheckType;
    toMml(inferred?: boolean, forceRow?: boolean): MmlNode;
}
