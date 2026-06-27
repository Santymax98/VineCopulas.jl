export const INHERIT = '_inherit_';
export class Attributes {
    constructor(defaults, global) {
        this.global = global;
        this.defaults = Object.create(global);
        this.inherited = Object.create(this.defaults);
        this.attributes = Object.create(this.inherited);
        Object.assign(this.defaults, defaults);
    }
    set(name, value) {
        this.attributes[name] = value;
    }
    setList(list) {
        Object.assign(this.attributes, list);
    }
    unset(name) {
        delete this.attributes[name];
    }
    get(name) {
        let value = this.attributes[name];
        if (value === INHERIT) {
            value = this.global[name];
        }
        return value;
    }
    getExplicit(name) {
        return this.hasExplicit(name) ? this.attributes[name] : undefined;
    }
    hasExplicit(name) {
        return Object.hasOwn(this.attributes, name);
    }
    hasOneOf(names) {
        for (const name of names) {
            if (this.hasExplicit(name)) {
                return true;
            }
        }
        return false;
    }
    getList(...names) {
        const values = {};
        for (const name of names) {
            values[name] = this.get(name);
        }
        return values;
    }
    setInherited(name, value) {
        this.inherited[name] = value;
    }
    getInherited(name) {
        return this.inherited[name];
    }
    getDefault(name) {
        return this.defaults[name];
    }
    isSet(name) {
        return (Object.hasOwn(this.attributes, name) ||
            Object.hasOwn(this.inherited, name));
    }
    hasDefault(name) {
        return name in this.defaults;
    }
    getExplicitNames() {
        return Object.keys(this.attributes);
    }
    getInheritedNames() {
        return Object.keys(this.inherited);
    }
    getDefaultNames() {
        return Object.keys(this.defaults);
    }
    getGlobalNames() {
        return Object.keys(this.global);
    }
    getAllAttributes() {
        return this.attributes;
    }
    getAllInherited() {
        return this.inherited;
    }
    getAllDefaults() {
        return this.defaults;
    }
    getAllGlobals() {
        return this.global;
    }
}
//# sourceMappingURL=Attributes.js.map