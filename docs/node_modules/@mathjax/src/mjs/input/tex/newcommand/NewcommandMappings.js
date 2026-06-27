import NewcommandMethods from './NewcommandMethods.js';
import { CommandMap } from '../TokenMap.js';
new CommandMap('Newcommand-macros', {
    newcommand: NewcommandMethods.NewCommand,
    renewcommand: NewcommandMethods.NewCommand,
    newenvironment: NewcommandMethods.NewEnvironment,
    renewenvironment: NewcommandMethods.NewEnvironment,
    def: NewcommandMethods.MacroDef,
    let: NewcommandMethods.Let,
});
//# sourceMappingURL=NewcommandMappings.js.map