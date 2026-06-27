const g = (typeof window !== 'undefined' ? window : global);
const def = g.MathJax._.components.global;
export const GLOBAL = def.GLOBAL;
export const isObject = def.isObject;
export const combineConfig = def.combineConfig;
export const combineDefaults = def.combineDefaults;
export const combineWithMathJax = def.combineWithMathJax;
export const MathJax = def.MathJax;
