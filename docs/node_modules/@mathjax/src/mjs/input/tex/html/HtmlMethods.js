import NodeUtil from '../NodeUtil.js';
import { ParseUtil } from '../ParseUtil.js';
import TexError from '../TexError.js';
const nonCharacterRegexp = /[\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
function isLegalAttributeName(name) {
    return !(name.match(/[\x00-\x1f\x7f-\x9f "'>/=]/) ||
        name.match(nonCharacterRegexp));
}
const HtmlMethods = {
    Data(parser, name) {
        const dataset = parser.GetArgument(name);
        const arg = GetArgumentMML(parser, name);
        const data = ParseUtil.keyvalOptions(dataset);
        for (const key in data) {
            if (!isLegalAttributeName(key)) {
                throw new TexError('InvalidHTMLAttr', 'Invalid HTML attribute: %1', `data-${key}`);
            }
            NodeUtil.setAttribute(arg, `data-${key}`, data[key]);
        }
        parser.Push(arg);
    },
    Href(parser, name) {
        const url = parser.GetArgument(name);
        const arg = GetArgumentMML(parser, name);
        NodeUtil.setAttribute(arg, 'href', url);
        parser.Push(arg);
    },
    Class(parser, name) {
        let CLASS = parser.GetArgument(name);
        const arg = GetArgumentMML(parser, name);
        const oldClass = NodeUtil.getAttribute(arg, 'class');
        if (oldClass) {
            CLASS = oldClass + ' ' + CLASS;
        }
        NodeUtil.setAttribute(arg, 'class', CLASS);
        parser.Push(arg);
    },
    Style(parser, name) {
        let style = parser.GetArgument(name);
        const arg = GetArgumentMML(parser, name);
        let oldStyle = NodeUtil.getAttribute(arg, 'style');
        if (oldStyle) {
            if (oldStyle.charAt(style.length - 1) !== ';') {
                oldStyle += ';';
            }
            style = oldStyle + ' ' + style;
        }
        NodeUtil.setAttribute(arg, 'style', style);
        parser.Push(arg);
    },
    Id(parser, name) {
        const ID = parser.GetArgument(name);
        const arg = GetArgumentMML(parser, name);
        NodeUtil.setAttribute(arg, 'id', ID);
        parser.Push(arg);
    },
};
const GetArgumentMML = function (parser, name) {
    const arg = parser.ParseArg(name);
    if (!NodeUtil.isInferred(arg)) {
        return arg;
    }
    const mrow = parser.create('node', 'mrow');
    NodeUtil.copyChildren(arg, mrow);
    NodeUtil.copyAttributes(arg, mrow);
    return mrow;
};
export default HtmlMethods;
//# sourceMappingURL=HtmlMethods.js.map