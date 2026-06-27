import BaseMethods from '../base/BaseMethods.js';
import { TEXCLASS } from '../../../core/MmlTree/MmlNode.js';
const BraketMethods = {
    Braket(parser, name, open, close, stretchy, barmax, space = false) {
        const i = parser.i;
        parser.GetArgument(name);
        parser.i = i;
        const next = parser.GetNext();
        let single = true;
        if (next === '{') {
            parser.i++;
            single = false;
        }
        const node = parser.itemFactory.create('braket');
        node.setProperties({
            barcount: 0,
            barmax,
            open,
            close,
            stretchy,
            single,
            space,
        });
        parser.Push(node);
        node.env.braketItem = parser.stack.height - 1;
    },
    Bar(parser, name) {
        let c = name === '|' ? '|' : '\u2016';
        const n = parser.stack.height - parser.stack.env.braketItem;
        const top = parser.stack.Top(n);
        if (!top ||
            !top.isKind('braket') ||
            top.getProperty('barcount') >= top.getProperty('barmax')) {
            return false;
        }
        if (c === '|' && parser.GetNext() === '|') {
            parser.i++;
            c = '\u2016';
        }
        if (!top.getProperty('stretchy')) {
            const node = parser.create('token', 'mo', { stretchy: false, 'data-braketbar': true, texClass: TEXCLASS.ORD }, c);
            parser.Push(node);
            return true;
        }
        const close = parser.itemFactory
            .create('close')
            .setProperty('braketbar', true);
        parser.Push(close);
        top.barNodes.push(parser.create('node', 'TeXAtom', [], { texClass: TEXCLASS.CLOSE }), parser.create('token', 'mo', { stretchy: true, 'data-braketbar': true, texClass: TEXCLASS.BIN }, c), parser.create('node', 'TeXAtom', [], { texClass: TEXCLASS.OPEN }));
        top.setProperty('barcount', top.getProperty('barcount') + 1);
        return true;
    },
    Macro: BaseMethods.Macro,
};
export default BraketMethods;
//# sourceMappingURL=BraketMethods.js.map