import { CharacterMap } from './TokenMap.js';
import { PrioritizedList } from '../../util/PrioritizedList.js';
import { FunctionList } from '../../util/FunctionList.js';
const maps = new Map();
export const MapHandler = {
    register(map) {
        maps.set(map.name, map);
    },
    getMap(name) {
        return maps.get(name);
    },
};
export class SubHandler {
    constructor() {
        this._configuration = new PrioritizedList();
        this._fallback = new FunctionList();
    }
    add(maps, fallback, priority = PrioritizedList.DEFAULTPRIORITY) {
        for (const name of maps.slice().reverse()) {
            const map = MapHandler.getMap(name);
            if (!map) {
                this.warn(`Configuration '${name}' not found! Omitted.`);
                return;
            }
            this._configuration.add(map, priority);
        }
        if (fallback) {
            this._fallback.add(fallback, priority);
        }
    }
    remove(maps, fallback = null) {
        for (const name of maps) {
            const map = this.retrieve(name);
            if (map) {
                this._configuration.remove(map);
            }
        }
        if (fallback) {
            this._fallback.remove(fallback);
        }
    }
    parse(input) {
        for (const { item: map } of this._configuration) {
            const result = map.parse(input);
            if (result === SubHandler.FALLBACK) {
                break;
            }
            if (result) {
                return result;
            }
        }
        const [env, token] = input;
        Array.from(this._fallback)[0].item(env, token);
        return;
    }
    lookup(token) {
        const map = this.applicable(token);
        return map ? map.lookup(token) : null;
    }
    contains(token) {
        const map = this.applicable(token);
        return (!!map && !(map instanceof CharacterMap && map.lookup(token).char === null));
    }
    toString() {
        const names = [];
        for (const { item: map } of this._configuration) {
            names.push(map.name);
        }
        return names.join(', ');
    }
    applicable(token) {
        for (const { item: map } of this._configuration) {
            if (map.contains(token)) {
                return map;
            }
        }
        return null;
    }
    retrieve(name) {
        for (const { item: map } of this._configuration) {
            if (map.name === name) {
                return map;
            }
        }
        return null;
    }
    warn(message) {
        console.log('TexParser Warning: ' + message);
    }
}
SubHandler.FALLBACK = Symbol('fallback');
export class SubHandlers {
    constructor() {
        this.map = new Map();
    }
    add(handlers, fallbacks, priority = PrioritizedList.DEFAULTPRIORITY) {
        for (const key of Object.keys(handlers)) {
            const name = key;
            let subHandler = this.get(name);
            if (!subHandler) {
                subHandler = new SubHandler();
                this.set(name, subHandler);
            }
            subHandler.add(handlers[name], fallbacks[name], priority);
        }
    }
    remove(handlers, fallbacks) {
        for (const name of Object.keys(handlers)) {
            const subHandler = this.get(name);
            if (subHandler) {
                subHandler.remove(handlers[name], fallbacks[name]);
            }
        }
    }
    set(name, subHandler) {
        this.map.set(name, subHandler);
    }
    get(name) {
        return this.map.get(name);
    }
    retrieve(name) {
        for (const handler of this.map.values()) {
            const map = handler.retrieve(name);
            if (map) {
                return map;
            }
        }
        return null;
    }
    keys() {
        return this.map.keys();
    }
}
//# sourceMappingURL=MapHandler.js.map