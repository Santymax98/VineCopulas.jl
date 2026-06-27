import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { MacroMap } from '../TokenMap.js';
import TexError from '../TexError.js';
import { HTMLDomStrings } from '../../../handlers/html/HTMLDomStrings.js';
export const HtmlNodeMethods = {
    TexHTML(parser, _name) {
        if (!parser.options.allowTexHTML)
            return false;
        const match = parser.string
            .slice(parser.i)
            .match(/^tex-html(?: n="(\d+)")?>/);
        if (!match)
            return false;
        parser.i += match[0].length;
        const end = (match[1] ? `<!${match[1]}>` : '') + '</tex-html>';
        const i = parser.string.slice(parser.i).indexOf(end);
        if (i < 0) {
            throw new TexError('TokenNotFoundForCommand', 'Could not find %1 for %2', end, '<' + match[0]);
        }
        const html = parser.string.substring(parser.i, parser.i + i).trim();
        parser.i += i + 11 + (match[1] ? 3 + match[1].length : 0);
        const adaptor = parser.configuration.packageData.get('texhtml').adaptor;
        const nodes = adaptor.childNodes(adaptor.body(adaptor.parse(html)));
        if (nodes.length === 0)
            return true;
        const DOM = nodes.length === 1 ? nodes[0] : adaptor.node('div', {}, nodes);
        const node = parser.create('node', 'html').setHTML(DOM, adaptor);
        parser.Push(parser.create('node', 'mtext', [node]));
        return true;
    },
};
new MacroMap('tex-html', { '<': HtmlNodeMethods.TexHTML });
export const TexHtmlConfiguration = Configuration.create('texhtml', {
    [ConfigurationType.HANDLER]: {
        [HandlerType.CHARACTER]: ['tex-html'],
    },
    [ConfigurationType.OPTIONS]: {
        allowTexHTML: false,
    },
    [ConfigurationType.CONFIG]: () => {
        if (HTMLDomStrings) {
            const include = HTMLDomStrings.OPTIONS.includeHtmlTags;
            if (!include['tex-html']) {
                include['tex-html'] = (node, adaptor) => {
                    const html = adaptor.innerHTML(node);
                    const n = html.split(/<\/tex-html>/).length;
                    const N = n > 1 ? ` n="${n}"` : '';
                    return (`<tex-html${N}>` + html + (n > 1 ? `<!${n}>` : '') + `</tex-html>`);
                };
            }
        }
    },
    [ConfigurationType.PREPROCESSORS]: [
        (data) => {
            data.data.packageData.set('texhtml', { adaptor: data.document.adaptor });
        },
    ],
    [ConfigurationType.POSTPROCESSORS]: [
        (data) => {
            data.data.packageData.set('texhtml', { adaptor: null });
        },
    ],
});
//# sourceMappingURL=TexHtmlConfiguration.js.map