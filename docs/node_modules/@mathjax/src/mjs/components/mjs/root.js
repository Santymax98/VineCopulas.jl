import { context } from '../../util/context.js';
export function mjxRoot() {
    return context
        .path(new URL(import.meta.url).pathname)
        .replace(/[cm]js\/components\/[cm]js\/root.js$/, 'bundle');
}
//# sourceMappingURL=root.js.map