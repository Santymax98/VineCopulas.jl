import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { MultlineItem, FlalignItem } from './AmsItems.js';
import { AbstractTags } from '../Tags.js';
import './AmsMappings.js';
import { NewcommandConfig } from '../newcommand/NewcommandConfiguration.js';
export class AmsTags extends AbstractTags {
}
export const AmsConfiguration = Configuration.create('ams', {
    [ConfigurationType.HANDLER]: {
        [HandlerType.CHARACTER]: ['AMSmath-operatorLetter'],
        [HandlerType.DELIMITER]: ['AMSsymbols-delimiter', 'AMSmath-delimiter'],
        [HandlerType.MACRO]: [
            'AMSsymbols-mathchar0mi',
            'AMSsymbols-mathchar0mo',
            'AMSsymbols-delimiter',
            'AMSsymbols-macros',
            'AMSmath-mathchar0mo',
            'AMSmath-macros',
            'AMSmath-delimiter',
        ],
        [HandlerType.ENVIRONMENT]: ['AMSmath-environment'],
    },
    [ConfigurationType.ITEMS]: {
        [MultlineItem.prototype.kind]: MultlineItem,
        [FlalignItem.prototype.kind]: FlalignItem,
    },
    [ConfigurationType.TAGS]: { ams: AmsTags },
    [ConfigurationType.OPTIONS]: {
        multlineWidth: '',
        ams: {
            operatornamePattern: /^[-*a-zA-Z0-9]+/,
            multlineWidth: '100%',
            multlineIndent: '1em',
        },
    },
    [ConfigurationType.CONFIG]: NewcommandConfig,
});
//# sourceMappingURL=AmsConfiguration.js.map