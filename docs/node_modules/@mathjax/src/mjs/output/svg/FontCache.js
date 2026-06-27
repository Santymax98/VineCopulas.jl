export class FontCache {
    constructor(jax) {
        this.cache = new Map();
        this.defs = null;
        this.localID = '';
        this.nextID = 0;
        this.jax = jax;
    }
    cachePath(variant, C, path) {
        const id = 'MJX-' +
            this.localID +
            (this.jax.font.getVariant(variant).cacheID || '') +
            '-' +
            C;
        if (!this.cache.has(id)) {
            this.cache.set(id, path);
            this.jax.adaptor.append(this.defs, this.jax.svg('path', { id: id, d: path }));
        }
        return id;
    }
    clearLocalID() {
        this.localID = '';
    }
    useLocalID(id = null) {
        this.localID = (id == null ? ++this.nextID : id) + (id === '' ? '' : '-');
    }
    clearCache() {
        this.cache = new Map();
        this.defs = this.jax.svg('defs');
    }
    getCache() {
        return this.defs;
    }
}
//# sourceMappingURL=FontCache.js.map