import { CommandMap, MacroMap } from '../TokenMap.js';
import BraketMethods from './BraketMethods.js';
new CommandMap('Braket-macros', {
    bra: [BraketMethods.Macro, '{\\langle {#1} \\vert}', 1],
    ket: [BraketMethods.Macro, '{\\vert {#1} \\rangle}', 1],
    braket: [BraketMethods.Braket, '\u27E8', '\u27E9', false, Infinity],
    set: [BraketMethods.Braket, '{', '}', false, 1],
    Bra: [BraketMethods.Macro, '{\\left\\langle {#1} \\right\\vert}', 1],
    Ket: [BraketMethods.Macro, '{\\left\\vert {#1} \\right\\rangle}', 1],
    Braket: [BraketMethods.Braket, '\u27E8', '\u27E9', true, Infinity],
    Set: [BraketMethods.Braket, '{', '}', true, 1, true],
    ketbra: [
        BraketMethods.Macro,
        '{\\vert {#1} \\rangle\\langle {#2} \\vert}',
        2,
    ],
    Ketbra: [
        BraketMethods.Macro,
        '{\\left\\vert {#1} \\right\\rangle\\left\\langle {#2} \\right\\vert}',
        2,
    ],
    '|': BraketMethods.Bar,
});
new MacroMap('Braket-characters', {
    '|': BraketMethods.Bar,
});
//# sourceMappingURL=BraketMappings.js.map