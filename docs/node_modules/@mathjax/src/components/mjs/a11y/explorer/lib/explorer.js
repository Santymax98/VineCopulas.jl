import {combineWithMathJax} from '../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../mjs/components/version.js';

import * as module1 from '../../../../../mjs/a11y/explorer.js';
import * as module2 from '../../../../../mjs/a11y/explorer/Explorer.js';
import * as module3 from '../../../../../mjs/a11y/explorer/ExplorerPool.js';
import * as module4 from '../../../../../mjs/a11y/explorer/Highlighter.js';
import * as module5 from '../../../../../mjs/a11y/explorer/KeyExplorer.js';
import * as module6 from '../../../../../mjs/a11y/explorer/MouseExplorer.js';
import * as module7 from '../../../../../mjs/a11y/explorer/Region.js';
import * as module8 from '../../../../../mjs/a11y/explorer/TreeExplorer.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('a11y/explorer', VERSION, 'a11y');
}

combineWithMathJax({_: {
  a11y: {
    explorer_ts: module1,
    explorer: {
      Explorer: module2,
      ExplorerPool: module3,
      Highlighter: module4,
      KeyExplorer: module5,
      MouseExplorer: module6,
      Region: module7,
      TreeExplorer: module8
    }
  }
}});
