import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import './AmsCdMappings.js';
export const AmsCdConfiguration = Configuration.create('amscd', {
    [ConfigurationType.HANDLER]: {
        [HandlerType.CHARACTER]: ['amscd_special'],
        [HandlerType.MACRO]: ['amscd_macros'],
        [HandlerType.ENVIRONMENT]: ['amscd_environment'],
    },
    [ConfigurationType.OPTIONS]: {
        amscd: {
            colspace: '5pt',
            rowspace: '5pt',
            harrowsize: '2.75em',
            varrowsize: '1.75em',
            hideHorizontalLabels: false,
        },
    },
});
//# sourceMappingURL=AmsCdConfiguration.js.map