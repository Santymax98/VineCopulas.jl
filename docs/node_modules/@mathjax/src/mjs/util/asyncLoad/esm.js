var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { mathjax } from '../../mathjax.js';
import { context } from '../context.js';
let root = context
    .path(new URL(import.meta.url, 'file://').href)
    .replace(/\/util\/asyncLoad\/esm.js$/, '/');
if (!mathjax.asyncLoad) {
    mathjax.asyncLoad = (name) => __awaiter(void 0, void 0, void 0, function* () {
        const file = name.charAt(0) === '.' ? new URL(name, root).href : name;
        return import(file).then((result) => { var _a; return (_a = result.default) !== null && _a !== void 0 ? _a : result; });
    });
}
export function setBaseURL(url) {
    root = new URL(context.path(url), 'file://').href;
    if (!root.match(/\/$/)) {
        root += '/';
    }
}
//# sourceMappingURL=esm.js.map