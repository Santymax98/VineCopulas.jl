import StackItemFactory from './StackItemFactory.js';
import { Tags } from './Tags.js';
import { SubHandlers } from './MapHandler.js';
import { NodeFactory } from './NodeFactory.js';
import { MmlNode } from '../../core/MmlTree/MmlNode.js';
import { MathItem } from '../../core/MathItem.js';
import TexParser from './TexParser.js';
import { OptionList } from '../../util/Options.js';
import { ParserConfiguration } from './Configuration.js';
import { ColumnParser } from './ColumnParser.js';
export default class ParseOptions {
    static getVariant: Map<string, (c: string, b?: boolean) => string>;
    handlers: SubHandlers;
    options: OptionList;
    itemFactory: StackItemFactory;
    nodeFactory: NodeFactory;
    tags: Tags;
    mathStyle: (c: string, b?: boolean) => string;
    columnParser: ColumnParser;
    packageData: Map<string, any>;
    parsers: TexParser[];
    mathItem: MathItem<any, any, any>;
    root: MmlNode;
    nodeLists: {
        [key: string]: MmlNode[];
    };
    error: boolean;
    constructor(configuration: ParserConfiguration, options?: OptionList[]);
    pushParser(parser: TexParser): void;
    popParser(): void;
    get parser(): TexParser;
    clear(): void;
    addNode(property: string, node: MmlNode): void;
    getList(property: string): MmlNode[];
    removeFromList(property: string, nodes: MmlNode[]): void;
    private inTree;
}
