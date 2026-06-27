import { MmlNode } from '../../core/MmlTree/MmlNode.js';
import { BBox, BBoxData } from '../../util/BBox.js';
export type IndentData = [string, string];
export declare class LineBBox extends BBox {
    indentData: IndentData[];
    lineLeading: number;
    originalL: number;
    isFirst: boolean;
    start: [number, number];
    end: [number, number];
    static from(bbox: BBox, leading: number, indent?: IndentData[]): LineBBox;
    constructor(def?: BBoxData, start?: [number, number]);
    append(cbox: LineBBox): void;
    copy(): LineBBox;
    getIndentData(node: MmlNode): void;
    protected copyIndentData(bbox: LineBBox): IndentData[];
}
