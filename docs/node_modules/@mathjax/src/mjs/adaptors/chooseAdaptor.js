import { liteAdaptor } from './liteAdaptor.js';
import { browserAdaptor } from './browserAdaptor.js';
import { context } from '../util/context.js';
export const chooseAdaptor = context.document ? browserAdaptor : liteAdaptor;
//# sourceMappingURL=chooseAdaptor.js.map