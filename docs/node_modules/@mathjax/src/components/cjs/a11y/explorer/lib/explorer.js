const {combineWithMathJax} = require('../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../cjs/components/version.js');

const module1 = require('../../../../../cjs/a11y/explorer.js');
const module2 = require('../../../../../cjs/a11y/explorer/Explorer.js');
const module3 = require('../../../../../cjs/a11y/explorer/ExplorerPool.js');
const module4 = require('../../../../../cjs/a11y/explorer/Highlighter.js');
const module5 = require('../../../../../cjs/a11y/explorer/KeyExplorer.js');
const module6 = require('../../../../../cjs/a11y/explorer/MouseExplorer.js');
const module7 = require('../../../../../cjs/a11y/explorer/Region.js');
const module8 = require('../../../../../cjs/a11y/explorer/TreeExplorer.js');

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
