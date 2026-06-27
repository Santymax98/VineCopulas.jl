import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { ProofTreeItem } from './BussproofsItems.js';
import { saveDocument, clearDocument, balanceRules, makeBsprAttributes, } from './BussproofsUtil.js';
import './BussproofsMappings.js';
export const BussproofsConfiguration = Configuration.create('bussproofs', {
    [ConfigurationType.HANDLER]: {
        [HandlerType.MACRO]: ['Bussproofs-macros'],
        [HandlerType.ENVIRONMENT]: ['Bussproofs-environments'],
    },
    [ConfigurationType.ITEMS]: {
        [ProofTreeItem.prototype.kind]: ProofTreeItem,
    },
    [ConfigurationType.PREPROCESSORS]: [[saveDocument, 1]],
    [ConfigurationType.POSTPROCESSORS]: [
        [clearDocument, 3],
        [makeBsprAttributes, 2],
        [balanceRules, 1],
    ],
});
//# sourceMappingURL=BussproofsConfiguration.js.map