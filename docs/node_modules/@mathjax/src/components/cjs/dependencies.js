"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compatibility = exports.provides = exports.paths = exports.dependencies = void 0;
exports.dependencies = {
    'a11y/semantic-enrich': ['input/mml', 'a11y/sre'],
    'a11y/speech': ['a11y/semantic-enrich'],
    'a11y/complexity': ['a11y/semantic-enrich'],
    'a11y/explorer': ['a11y/speech'],
    '[mml]/mml3': ['input/mml'],
    '[tex]/action': ['input/tex-base'],
    '[tex]/ams': ['input/tex-base', '[tex]/newcommand'],
    '[tex]/amscd': ['input/tex-base'],
    '[tex]/autoload': ['input/tex-base', '[tex]/require'],
    '[tex]/bbm': ['input/tex-base'],
    '[tex]/bboldx': ['input/tex-base', '[tex]/textmacros'],
    '[tex]/bbox': ['input/tex-base'],
    '[tex]/begingroup': ['input/tex-base', '[tex]/newcommand'],
    '[tex]/boldsymbol': ['input/tex-base'],
    '[tex]/braket': ['input/tex-base'],
    '[tex]/bussproofs': ['input/tex-base'],
    '[tex]/cancel': ['input/tex-base', '[tex]/enclose'],
    '[tex]/cases': ['[tex]/empheq'],
    '[tex]/centernot': ['input/tex-base'],
    '[tex]/color': ['input/tex-base'],
    '[tex]/colortbl': ['input/tex-base', '[tex]/color'],
    '[tex]/colorv2': ['input/tex-base'],
    '[tex]/configmacros': ['input/tex-base', '[tex]/newcommand'],
    '[tex]/dsfont': ['input/tex-base'],
    '[tex]/empheq': ['input/tex-base', '[tex]/ams'],
    '[tex]/enclose': ['input/tex-base'],
    '[tex]/extpfeil': ['input/tex-base', '[tex]/newcommand', '[tex]/ams'],
    '[tex]/gensymb': ['input/tex-base'],
    '[tex]/html': ['input/tex-base'],
    '[tex]/mathtools': ['input/tex-base', '[tex]/newcommand', '[tex]/ams', '[tex]/boldsymbol'],
    '[tex]/mhchem': ['input/tex-base', '[tex]/ams'],
    '[tex]/newcommand': ['input/tex-base'],
    '[tex]/noerrors': ['input/tex-base'],
    '[tex]/noundefined': ['input/tex-base'],
    '[tex]/physics': ['input/tex-base'],
    '[tex]/require': ['input/tex-base'],
    '[tex]/setoptions': ['input/tex-base'],
    '[tex]/tagformat': ['input/tex-base'],
    '[tex]/texhtml': ['input/tex-base'],
    '[tex]/textcomp': ['input/tex-base', '[tex]/textmacros'],
    '[tex]/textmacros': ['input/tex-base'],
    '[tex]/unicode': ['input/tex-base'],
    '[tex]/units': ['input/tex-base'],
    '[tex]/upgreek': ['input/tex-base'],
    '[tex]/verb': ['input/tex-base'],
    'ui/menu': ['a11y/sre'],
};
exports.paths = {
    tex: '[mathjax]/input/tex/extensions',
    mml: '[mathjax]/input/mml/extensions',
    sre: '[mathjax]/sre',
    mathmaps: '[sre]/mathmaps',
};
exports.provides = {
    'startup': ['loader'],
    'input/tex': [
        'input/tex-base',
        '[tex]/ams',
        '[tex]/newcommand',
        '[tex]/textmacros',
        '[tex]/noundefined',
        '[tex]/require',
        '[tex]/autoload',
        '[tex]/configmacros'
    ]
};
exports.compatibility = {
    '[tex]/amsCd': '[tex]/amscd',
    '[tex]/colorV2': '[tex]/colorv2',
    '[tex]/configMacros': '[tex]/configmacros',
    '[tex]/tagFormat': '[tex]/tagformat'
};
