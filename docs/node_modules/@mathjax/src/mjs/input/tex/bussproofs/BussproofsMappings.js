import BussproofsMethods from './BussproofsMethods.js';
import ParseMethods from '../ParseMethods.js';
import { CommandMap, EnvironmentMap } from '../TokenMap.js';
new CommandMap('Bussproofs-macros', {
    AxiomC: BussproofsMethods.Axiom,
    UnaryInfC: [BussproofsMethods.Inference, 1],
    BinaryInfC: [BussproofsMethods.Inference, 2],
    TrinaryInfC: [BussproofsMethods.Inference, 3],
    QuaternaryInfC: [BussproofsMethods.Inference, 4],
    QuinaryInfC: [BussproofsMethods.Inference, 5],
    RightLabel: [BussproofsMethods.Label, 'right'],
    LeftLabel: [BussproofsMethods.Label, 'left'],
    AXC: BussproofsMethods.Axiom,
    UIC: [BussproofsMethods.Inference, 1],
    BIC: [BussproofsMethods.Inference, 2],
    TIC: [BussproofsMethods.Inference, 3],
    RL: [BussproofsMethods.Label, 'right'],
    LL: [BussproofsMethods.Label, 'left'],
    noLine: [BussproofsMethods.SetLine, 'none', false],
    singleLine: [BussproofsMethods.SetLine, 'solid', false],
    solidLine: [BussproofsMethods.SetLine, 'solid', false],
    dashedLine: [BussproofsMethods.SetLine, 'dashed', false],
    alwaysNoLine: [BussproofsMethods.SetLine, 'none', true],
    alwaysSingleLine: [BussproofsMethods.SetLine, 'solid', true],
    alwaysSolidLine: [BussproofsMethods.SetLine, 'solid', true],
    alwaysDashedLine: [BussproofsMethods.SetLine, 'dashed', true],
    rootAtTop: [BussproofsMethods.RootAtTop, true],
    alwaysRootAtTop: [BussproofsMethods.RootAtTop, true],
    rootAtBottom: [BussproofsMethods.RootAtTop, false],
    alwaysRootAtBottom: [BussproofsMethods.RootAtTop, false],
    fCenter: BussproofsMethods.FCenter,
    Axiom: BussproofsMethods.AxiomF,
    UnaryInf: [BussproofsMethods.InferenceF, 1],
    BinaryInf: [BussproofsMethods.InferenceF, 2],
    TrinaryInf: [BussproofsMethods.InferenceF, 3],
    QuaternaryInf: [BussproofsMethods.InferenceF, 4],
    QuinaryInf: [BussproofsMethods.InferenceF, 5],
});
new EnvironmentMap('Bussproofs-environments', ParseMethods.environment, {
    prooftree: [BussproofsMethods.Prooftree, null, false],
});
//# sourceMappingURL=BussproofsMappings.js.map