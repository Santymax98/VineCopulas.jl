import { mathjax } from '../mathjax.js';
export function asyncLoad(name) {
    if (!mathjax.asyncLoad) {
        return Promise.reject(`Can't load '${name}': No mathjax.asyncLoad method specified`);
    }
    return new Promise((ok, fail) => {
        const result = mathjax.asyncLoad(name);
        if (result instanceof Promise) {
            result.then((value) => ok(value)).catch((err) => fail(err));
        }
        else {
            ok(result);
        }
    });
}
//# sourceMappingURL=AsyncLoad.js.map