import { ArrayItem } from '../base/BaseItems.js';
import { Configuration } from '../Configuration.js';
export interface ColorData {
    cell: string;
    row: string;
    col: string[];
}
export declare class ColorArrayItem extends ArrayItem {
    color: ColorData;
    hasColor: boolean;
    EndEntry(): void;
    EndRow(): void;
    createMml(): import("../../../core/MmlTree/MmlNode.js").MmlNode;
}
export declare const ColortblConfiguration: Configuration;
