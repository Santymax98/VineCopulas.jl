import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { TexConstant } from '../TexConstants.js';
import { CommandMap } from '../TokenMap.js';
import TexError from '../TexError.js';
const VerbMethods = {
    Verb(parser, name) {
        const c = parser.GetNext();
        const start = ++parser.i;
        if (c === '') {
            throw new TexError('MissingArgFor', 'Missing argument for %1', name);
        }
        while (parser.i < parser.string.length &&
            parser.string.charAt(parser.i) !== c) {
            parser.i++;
        }
        if (parser.i === parser.string.length) {
            throw new TexError('NoClosingDelim', "Can't find closing delimiter for %1", parser.currentCS);
        }
        const text = parser.string.slice(start, parser.i).replace(/ /g, '\u00A0');
        parser.i++;
        parser.Push(parser.create('token', 'mtext', { mathvariant: TexConstant.Variant.MONOSPACE }, text));
    },
};
new CommandMap('verb', { verb: VerbMethods.Verb });
export const VerbConfiguration = Configuration.create('verb', {
    [ConfigurationType.HANDLER]: { [HandlerType.MACRO]: ['verb'] },
});
//# sourceMappingURL=VerbConfiguration.js.map