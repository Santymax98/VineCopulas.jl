import { HTMLAdaptor } from './HTMLAdaptor.js';
import { NodeMixin } from './NodeMixin.js';
export class JsdomAdaptor extends NodeMixin(HTMLAdaptor) {
}
export function jsdomAdaptor(JSDOM, options = null) {
    return new JsdomAdaptor(new JSDOM().window, options);
}
//# sourceMappingURL=jsdomAdaptor.js.map