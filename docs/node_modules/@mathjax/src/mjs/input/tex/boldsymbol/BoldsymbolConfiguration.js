import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import NodeUtil from '../NodeUtil.js';
import { TexConstant } from '../TexConstants.js';
import { CommandMap } from '../TokenMap.js';
import { NodeFactory } from '../NodeFactory.js';
const BOLDVARIANT = {};
BOLDVARIANT[TexConstant.Variant.NORMAL] = TexConstant.Variant.BOLD;
BOLDVARIANT[TexConstant.Variant.ITALIC] = TexConstant.Variant.BOLDITALIC;
BOLDVARIANT[TexConstant.Variant.FRAKTUR] = TexConstant.Variant.BOLDFRAKTUR;
BOLDVARIANT[TexConstant.Variant.SCRIPT] = TexConstant.Variant.BOLDSCRIPT;
BOLDVARIANT[TexConstant.Variant.SANSSERIF] = TexConstant.Variant.BOLDSANSSERIF;
BOLDVARIANT['-tex-calligraphic'] = '-tex-bold-calligraphic';
BOLDVARIANT['-tex-oldstyle'] = '-tex-bold-oldstyle';
BOLDVARIANT['-tex-mathit'] = TexConstant.Variant.BOLDITALIC;
export const BoldsymbolMethods = {
    Boldsymbol(parser, name) {
        const boldsymbol = parser.stack.env['boldsymbol'];
        parser.stack.env['boldsymbol'] = true;
        const mml = parser.ParseArg(name);
        parser.stack.env['boldsymbol'] = boldsymbol;
        parser.Push(mml);
    },
};
new CommandMap('boldsymbol', { boldsymbol: BoldsymbolMethods.Boldsymbol });
export function createBoldToken(factory, kind, def, text) {
    const token = NodeFactory.createToken(factory, kind, def, text);
    if (kind !== 'mtext' &&
        factory.configuration.parser.stack.env['boldsymbol']) {
        NodeUtil.setProperty(token, 'fixBold', true);
        factory.configuration.addNode('fixBold', token);
    }
    return token;
}
export function rewriteBoldTokens(arg) {
    for (const node of arg.data.getList('fixBold')) {
        if (NodeUtil.getProperty(node, 'fixBold')) {
            const variant = NodeUtil.getAttribute(node, 'mathvariant');
            NodeUtil.setAttribute(node, 'mathvariant', BOLDVARIANT[variant] || variant);
            NodeUtil.removeProperties(node, 'fixBold');
        }
    }
}
export const BoldsymbolConfiguration = Configuration.create('boldsymbol', {
    [ConfigurationType.HANDLER]: { [HandlerType.MACRO]: ['boldsymbol'] },
    [ConfigurationType.NODES]: { token: createBoldToken },
    [ConfigurationType.POSTPROCESSORS]: [rewriteBoldTokens],
});
//# sourceMappingURL=BoldsymbolConfiguration.js.map