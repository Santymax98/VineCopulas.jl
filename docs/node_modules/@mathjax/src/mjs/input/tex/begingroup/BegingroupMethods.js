import { CommandMap } from '../TokenMap.js';
import TexError from '../TexError.js';
import BaseMethods from '../base/BaseMethods.js';
import { begingroupStack } from './BegingroupStack.js';
export const BegingroupMethods = {
    begingroup(parser, _name) {
        begingroupStack(parser.configuration).push();
    },
    endgroup(parser, _name) {
        begingroupStack(parser.configuration).pop();
    },
    reset(parser, _name) {
        begingroupStack(parser.configuration).reset();
    },
    sandbox(parser, _name) {
        begingroupStack(parser.configuration).sandbox();
        parser.stack.global.isSandbox = true;
    },
    global(parser, _name) {
        const i = parser.i;
        const cs = parser.GetNext() === '\\' ? (parser.i++, parser.GetCS()) : '';
        parser.i = i;
        if (!parser.options.begingroup.allowGlobal.includes(cs)) {
            throw new TexError('IllegalGlobal', 'Invalid use of %1', parser.currentCS);
        }
        parser.stack.env.isGlobal = true;
    },
    macro: BaseMethods.Macro,
};
new CommandMap('begingroup', {
    begingroup: BegingroupMethods.begingroup,
    endgroup: BegingroupMethods.endgroup,
    global: BegingroupMethods.global,
    gdef: [BegingroupMethods.macro, '\\global\\def'],
    begingroupReset: BegingroupMethods.reset,
    begingroupSandbox: BegingroupMethods.sandbox,
});
//# sourceMappingURL=BegingroupMethods.js.map