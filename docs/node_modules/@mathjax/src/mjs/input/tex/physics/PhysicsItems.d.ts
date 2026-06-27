import { CheckType, BaseItem, StackItem } from '../StackItem.js';
export declare class AutoOpen extends BaseItem {
    protected static errors: any;
    openCount: number;
    get kind(): string;
    get isOpen(): boolean;
    toMml(inferred?: boolean, forceRow?: boolean): import("../../../core/MmlTree/MmlNode.js").MmlNode;
    closing(fence: string): boolean;
    checkItem(item: StackItem): CheckType;
}
