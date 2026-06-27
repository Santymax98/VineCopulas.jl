import { Menu, Radio, ParserFactory } from './mj-context-menu.js';
export declare class RadioCompare extends Radio {
    private comparator;
    protected role: string;
    static fromJson(_factory: ParserFactory, { content: content, variable: variable, id: id, comparator: comparator, }: {
        content: string;
        variable: string;
        id: string;
        comparator: (variable: string, id: string) => boolean;
    }, menu: Menu): Radio;
    constructor(menu: Menu, content: string, variable: string, id: string, comparator: (variable: string, id: string) => boolean);
    protected updateAria(): void;
    protected updateSpan(): void;
}
