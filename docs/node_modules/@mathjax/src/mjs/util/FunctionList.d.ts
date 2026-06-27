import { PrioritizedList, PrioritizedListItem } from './PrioritizedList.js';
export type AnyFunction = (...args: unknown[]) => unknown;
export type AnyFunctionDef = AnyFunction | [AnyFunction, number];
export type AnyFunctionList = AnyFunctionDef[];
export interface FunctionListItem extends PrioritizedListItem<AnyFunction> {
}
export declare class FunctionList extends PrioritizedList<AnyFunction> {
    constructor(list?: AnyFunctionList);
    addList(list: AnyFunctionList): void;
    execute(...data: any[]): boolean;
    asyncExecute(...data: any[]): Promise<boolean>;
}
