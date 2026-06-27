import { context } from '../../util/context.js';
export function sreRoot() {
    return context
        .path(new URL(import.meta.url).pathname)
        .replace(/components\/[cm]js\/sre-root.js$/, 'a11y/sre');
}
//# sourceMappingURL=sre-root.js.map