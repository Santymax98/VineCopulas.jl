import { userOptions, defaultOptions } from '../util/Options.js';
export class AbstractFindMath {
    constructor(options) {
        const CLASS = this.constructor;
        this.options = userOptions(defaultOptions({}, CLASS.OPTIONS), options);
    }
}
AbstractFindMath.OPTIONS = {};
//# sourceMappingURL=FindMath.js.map