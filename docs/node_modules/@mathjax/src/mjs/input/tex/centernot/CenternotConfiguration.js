import { ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import TexParser from '../TexParser.js';
import NodeUtil from '../NodeUtil.js';
import { CommandMap } from '../TokenMap.js';
import BaseMethods from '../base/BaseMethods.js';
function CenterOver(parser, name) {
    const arg = '{' + parser.GetArgument(name) + '}';
    const over = parser.ParseArg(name);
    const base = new TexParser(arg, parser.stack.env, parser.configuration).mml();
    const mml = parser.create('node', 'TeXAtom', [
        new TexParser(arg, parser.stack.env, parser.configuration).mml(),
        parser.create('node', 'mpadded', [
            parser.create('node', 'mpadded', [over], {
                width: 0,
                lspace: '-.5width',
            }),
            parser.create('node', 'mphantom', [base]),
        ], { width: 0, lspace: '-.5width' }),
    ]);
    parser.configuration.addNode('centerOver', base);
    parser.Push(mml);
}
new CommandMap('centernot', {
    centerOver: CenterOver,
    centernot: [BaseMethods.Macro, '\\centerOver{#1}{{\u29F8}}', 1],
});
export function filterCenterOver({ data }) {
    for (const base of data.getList('centerOver')) {
        const texClass = NodeUtil.getTexClass(base.childNodes[0].childNodes[0]);
        if (texClass !== null) {
            NodeUtil.setProperties(base.parent.parent.parent.parent.parent.parent, {
                texClass,
            });
        }
    }
}
export const CenternotConfiguration = Configuration.create('centernot', {
    [ConfigurationType.HANDLER]: { macro: ['centernot'] },
    [ConfigurationType.POSTPROCESSORS]: [filterCenterOver],
});
//# sourceMappingURL=CenternotConfiguration.js.map