import { VERSION } from './components/version.js';
import { HandlerList } from './core/HandlerList.js';
import { handleRetriesFor, retryAfter } from './util/Retries.js';
import { context } from './util/context.js';
export const mathjax = {
    version: VERSION,
    context: context,
    handlers: new HandlerList(),
    document: function (document, options) {
        return mathjax.handlers.document(document, options);
    },
    handleRetriesFor: handleRetriesFor,
    retryAfter: retryAfter,
    asyncLoad: null,
    asyncIsSynchronous: false,
};
//# sourceMappingURL=mathjax.js.map