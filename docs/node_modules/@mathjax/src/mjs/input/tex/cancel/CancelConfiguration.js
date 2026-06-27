import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { TexConstant } from '../TexConstants.js';
import { CommandMap } from '../TokenMap.js';
import { ParseUtil } from '../ParseUtil.js';
import { ENCLOSE_OPTIONS } from '../enclose/EncloseConfiguration.js';
export const CancelMethods = {
    Cancel(parser, name, notation) {
        const attr = parser.GetBrackets(name, '');
        const math = parser.ParseArg(name);
        const def = ParseUtil.keyvalOptions(attr, ENCLOSE_OPTIONS);
        def['notation'] = notation;
        parser.Push(parser.create('node', 'menclose', [math], def));
    },
    CancelTo(parser, name) {
        const attr = parser.GetBrackets(name, '');
        let value = parser.ParseArg(name);
        const math = parser.ParseArg(name);
        const def = ParseUtil.keyvalOptions(attr, ENCLOSE_OPTIONS);
        def['notation'] = [
            TexConstant.Notation.UPDIAGONALSTRIKE,
            TexConstant.Notation.UPDIAGONALARROW,
            TexConstant.Notation.NORTHEASTARROW,
        ].join(' ');
        value = parser.create('node', 'mpadded', [value], {
            depth: '-.1em',
            height: '+.1em',
            voffset: '.1em',
        });
        parser.Push(parser.create('node', 'msup', [
            parser.create('node', 'menclose', [math], def),
            value,
        ]));
    },
};
new CommandMap('cancel', {
    cancel: [CancelMethods.Cancel, TexConstant.Notation.UPDIAGONALSTRIKE],
    bcancel: [CancelMethods.Cancel, TexConstant.Notation.DOWNDIAGONALSTRIKE],
    xcancel: [
        CancelMethods.Cancel,
        TexConstant.Notation.UPDIAGONALSTRIKE +
            ' ' +
            TexConstant.Notation.DOWNDIAGONALSTRIKE,
    ],
    cancelto: CancelMethods.CancelTo,
});
export const CancelConfiguration = Configuration.create('cancel', {
    [ConfigurationType.HANDLER]: { [HandlerType.MACRO]: ['cancel'] },
});
//# sourceMappingURL=CancelConfiguration.js.map