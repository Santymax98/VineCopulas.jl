import ParseOptions from './ParseOptions.js';
declare const FilterUtil: {
    cleanStretchy(arg: {
        math: any;
        data: ParseOptions;
    }): void;
    cleanAttributes(arg: {
        data: ParseOptions;
    }): void;
    combineRelations(arg: {
        data: ParseOptions;
    }): void;
    cleanSubSup(arg: {
        math: any;
        data: ParseOptions;
    }): void;
    moveLimits(arg: {
        data: ParseOptions;
    }): void;
    setInherited(arg: {
        math: any;
        data: ParseOptions;
    }): void;
    checkScriptlevel(arg: {
        data: ParseOptions;
    }): void;
};
export default FilterUtil;
