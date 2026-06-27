declare class UnitMap {
    num: string;
    unit: string;
    dimenEnd: RegExp;
    dimenRest: RegExp;
    private map;
    constructor(map: [string, number][]);
    private updateDimen;
    set(name: string, ems: number): this;
    get(name: string): number;
    delete(name: string): boolean;
}
export declare const UnitUtil: {
    UNIT_CASES: UnitMap;
    matchDimen(dim: string, rest?: boolean): [string, string, number];
    dimen2em(dim: string): number;
    em(m: number): string;
    trimSpaces(text: string): string;
};
export {};
