import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { BraketItem } from './BraketItems.js';
import './BraketMappings.js';
export const BraketConfiguration = Configuration.create('braket', {
    [ConfigurationType.HANDLER]: {
        [HandlerType.CHARACTER]: ['Braket-characters'],
        [HandlerType.MACRO]: ['Braket-macros'],
    },
    [ConfigurationType.ITEMS]: {
        [BraketItem.prototype.kind]: BraketItem,
    },
    [ConfigurationType.PRIORITY]: 3,
});
//# sourceMappingURL=BraketConfiguration.js.map