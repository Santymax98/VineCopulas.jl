import { XMLNode } from '../MmlNode.js';
import { DOMAdaptor } from '../../DOMAdaptor.js';
import { PropertyList } from '../../Tree/Node.js';
export declare class HtmlNode<N> extends XMLNode {
    get kind(): string;
    getHTML(): N;
    setHTML(html: N, adaptor?: DOMAdaptor<any, any, any>): HtmlNode<N>;
    getSerializedHTML(): string;
    textContent(): string;
    toString(): string;
    verifyTree(options: PropertyList): void;
}
