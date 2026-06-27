import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { CommandMap } from '../TokenMap.js';
import { BegingroupStack, begingroupStack } from './BegingroupStack.js';
import { BegingroupMethods } from './BegingroupMethods.js';
new CommandMap('begingroup', {
    begingroup: BegingroupMethods.begingroup,
    endgroup: BegingroupMethods.endgroup,
    global: BegingroupMethods.global,
    gdef: [BegingroupMethods.macro, '\\global\\def'],
    begingroupReset: BegingroupMethods.reset,
    begingroupSandbox: BegingroupMethods.sandbox,
});
export const BegingroupConfiguration = Configuration.create('begingroup', {
    [ConfigurationType.HANDLER]: {
        [HandlerType.MACRO]: ['begingroup'],
    },
    [ConfigurationType.CONFIG]: (_config, jax) => {
        jax.parseOptions.packageData.set('begingroup', {
            stack: new BegingroupStack(jax.parseOptions),
        });
    },
    [ConfigurationType.OPTIONS]: {
        begingroup: {
            allowGlobal: [
                'let',
                'def',
                'newcommand',
                'DeclareMathOperator',
                'Newextarrow',
            ],
        },
    },
    [ConfigurationType.PREPROCESSORS]: [
        ({ data: parser }) => begingroupStack(parser).remove(),
    ],
    [ConfigurationType.POSTPROCESSORS]: [
        ({ data: parser }) => begingroupStack(parser).finish(),
    ],
});
//# sourceMappingURL=BegingroupConfiguration.js.map