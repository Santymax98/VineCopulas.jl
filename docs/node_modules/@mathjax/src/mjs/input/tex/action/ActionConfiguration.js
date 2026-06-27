import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import TexParser from '../TexParser.js';
import { CommandMap } from '../TokenMap.js';
import BaseMethods from '../base/BaseMethods.js';
export const ActionMethods = {
    Toggle(parser, name) {
        const children = [];
        let arg;
        while ((arg = parser.GetArgument(name)) !== '\\endtoggle') {
            children.push(new TexParser(arg, parser.stack.env, parser.configuration).mml());
        }
        parser.Push(parser.create('node', 'maction', children, { actiontype: 'toggle' }));
    },
    Mathtip(parser, name) {
        const arg = parser.ParseArg(name);
        const tip = parser.ParseArg(name);
        parser.Push(parser.create('node', 'maction', [arg, tip], { actiontype: 'tooltip' }));
    },
    Macro: BaseMethods.Macro,
};
new CommandMap('action-macros', {
    toggle: ActionMethods.Toggle,
    mathtip: ActionMethods.Mathtip,
    texttip: [ActionMethods.Macro, '\\mathtip{#1}{\\text{#2}}', 2],
});
export const ActionConfiguration = Configuration.create('action', {
    [ConfigurationType.HANDLER]: { [HandlerType.MACRO]: ['action-macros'] },
});
//# sourceMappingURL=ActionConfiguration.js.map