import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { Macro } from '../Token.js';
import NodeUtil from '../NodeUtil.js';
import { expandable } from '../../../util/Options.js';
import { NewcommandConfig } from '../newcommand/NewcommandConfiguration.js';
import { NewcommandTables } from '../newcommand/NewcommandUtil.js';
import './MathtoolsMappings.js';
import { MathtoolsMethods, LEGACYCONFIG, LEGACYPRIORITY, } from './MathtoolsMethods.js';
import { MathtoolsTagFormat } from './MathtoolsTags.js';
import { MultlinedItem } from './MathtoolsItems.js';
function configMathtools(config, jax) {
    NewcommandConfig(config, jax);
    const parser = jax.parseOptions;
    const pairedDelims = parser.options.mathtools.pairedDelimiters;
    const handler = config.handlers.retrieve(NewcommandTables.NEW_COMMAND);
    for (const [cs, args] of Object.entries(pairedDelims)) {
        handler.add(cs, new Macro(cs, MathtoolsMethods.PairedDelimiters, args));
    }
    if (parser.options.mathtools.legacycolonsymbols) {
        config.handlers.add(LEGACYCONFIG, {}, LEGACYPRIORITY);
    }
    MathtoolsTagFormat(config, jax);
}
export function fixPrescripts({ data }) {
    for (const node of data.getList('mmultiscripts')) {
        if (!node.getProperty('fixPrescript'))
            continue;
        const childNodes = NodeUtil.getChildren(node);
        let n = 0;
        for (const i of [1, 2]) {
            if (!childNodes[i]) {
                NodeUtil.setChild(node, i, data.nodeFactory.create('node', 'none'));
                n++;
            }
        }
        if (n === 2) {
            childNodes.splice(1, 2);
        }
    }
}
export const MathtoolsConfiguration = Configuration.create('mathtools', {
    [ConfigurationType.HANDLER]: {
        macro: ['mathtools-macros', 'mathtools-delimiters'],
        [HandlerType.ENVIRONMENT]: ['mathtools-environments'],
        [HandlerType.DELIMITER]: ['mathtools-delimiters'],
        [HandlerType.CHARACTER]: ['mathtools-characters'],
    },
    [ConfigurationType.ITEMS]: {
        [MultlinedItem.prototype.kind]: MultlinedItem,
    },
    [ConfigurationType.CONFIG]: configMathtools,
    [ConfigurationType.POSTPROCESSORS]: [[fixPrescripts, -6]],
    [ConfigurationType.OPTIONS]: {
        mathtools: {
            'multlined-gap': '1em',
            'multlined-pos': 'c',
            'multlined-width': '',
            'firstline-afterskip': '',
            'lastline-preskip': '',
            'smallmatrix-align': 'c',
            'shortvdotsadjustabove': '.2em',
            'shortvdotsadjustbelow': '.2em',
            'centercolon': false,
            'centercolon-offset': '.04em',
            'thincolon-dx': '-.04em',
            'thincolon-dw': '-.08em',
            'use-unicode': false,
            'legacycolonsymbols': false,
            'prescript-sub-format': '',
            'prescript-sup-format': '',
            'prescript-arg-format': '',
            'allow-mathtoolsset': true,
            pairedDelimiters: expandable({}),
            tagforms: expandable({}),
        }
    },
});
//# sourceMappingURL=MathtoolsConfiguration.js.map