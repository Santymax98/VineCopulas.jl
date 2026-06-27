const OBJECT = {}.constructor;
export function isObject(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        (obj.constructor === OBJECT || obj.constructor === Expandable));
}
export const APPEND = '[+]';
export const REMOVE = '[-]';
export const OPTIONS = {
    invalidOption: 'warn',
    optionError: (message, _key) => {
        if (OPTIONS.invalidOption === 'fatal') {
            throw new Error(message);
        }
        console.warn('MathJax: ' + message);
    },
};
export class Expandable {
}
export function expandable(def) {
    return Object.assign(Object.create(Expandable.prototype), def);
}
export function makeArray(x) {
    return Array.isArray(x) ? x : [x];
}
export function keys(def) {
    if (!def) {
        return [];
    }
    return Object.keys(def).concat(Object.getOwnPropertySymbols(def));
}
export function copy(def) {
    const props = {};
    for (const key of keys(def)) {
        const prop = Object.getOwnPropertyDescriptor(def, key);
        const value = prop.value;
        if (Array.isArray(value)) {
            prop.value = insert([], value, false);
        }
        else if (isObject(value)) {
            prop.value = copy(value);
        }
        if (prop.enumerable) {
            props[key] = prop;
        }
    }
    return Object.defineProperties(def.constructor === Expandable ? expandable({}) : {}, props);
}
export function insert(dst, src, warn = true) {
    for (let key of keys(src)) {
        if (warn && dst[key] === undefined && dst.constructor !== Expandable) {
            if (typeof key === 'symbol') {
                key = key.toString();
            }
            OPTIONS.optionError(`Invalid option "${key}" (no default value).`, key);
            continue;
        }
        const sval = src[key];
        let dval = dst[key];
        if (isObject(sval) &&
            dval !== null &&
            (typeof dval === 'object' || typeof dval === 'function')) {
            const ids = keys(sval);
            if (Array.isArray(dval) &&
                ((ids.length === 1 &&
                    (ids[0] === APPEND || ids[0] === REMOVE) &&
                    Array.isArray(sval[ids[0]])) ||
                    (ids.length === 2 &&
                        ids.sort().join(',') === APPEND + ',' + REMOVE &&
                        Array.isArray(sval[APPEND]) &&
                        Array.isArray(sval[REMOVE])))) {
                if (sval[REMOVE]) {
                    dval = dst[key] = dval.filter((x) => sval[REMOVE].indexOf(x) < 0);
                }
                if (sval[APPEND]) {
                    dst[key] = [...dval, ...sval[APPEND]];
                }
            }
            else {
                insert(dval, sval, warn);
            }
        }
        else if (Array.isArray(sval)) {
            dst[key] = [];
            insert(dst[key], sval, false);
        }
        else if (isObject(sval)) {
            dst[key] = copy(sval);
        }
        else {
            dst[key] = sval;
        }
    }
    return dst;
}
export function defaultOptions(options, ...defs) {
    defs.forEach((def) => insert(options, def, false));
    return options;
}
export function userOptions(options, ...defs) {
    defs.forEach((def) => insert(options, def, true));
    return options;
}
export function selectOptions(options, ...keys) {
    const subset = {};
    for (const key of keys) {
        if (Object.hasOwn(options, key)) {
            subset[key] = options[key];
        }
    }
    return subset;
}
export function selectOptionsFromKeys(options, object) {
    return selectOptions(options, ...Object.keys(object));
}
export function separateOptions(options, ...objects) {
    const results = [];
    for (const object of objects) {
        const exists = {}, missing = {};
        for (const key of Object.keys(options || {})) {
            (object[key] === undefined ? missing : exists)[key] = options[key];
        }
        results.push(exists);
        options = missing;
    }
    results.unshift(options);
    return results;
}
export function lookup(name, lookup, def = null) {
    return Object.hasOwn(lookup, name) ? lookup[name] : def;
}
//# sourceMappingURL=Options.js.map