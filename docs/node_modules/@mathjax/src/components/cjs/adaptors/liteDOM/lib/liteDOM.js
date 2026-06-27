const {combineWithMathJax} = require('../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../cjs/components/version.js');

const module1 = require('../../../../../cjs/adaptors/liteAdaptor.js');
const module2 = require('../../../../../cjs/adaptors/lite/Document.js');
const module3 = require('../../../../../cjs/adaptors/lite/Element.js');
const module4 = require('../../../../../cjs/adaptors/lite/List.js');
const module5 = require('../../../../../cjs/adaptors/lite/Parser.js');
const module6 = require('../../../../../cjs/adaptors/lite/Text.js');
const module7 = require('../../../../../cjs/adaptors/lite/Window.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('adaptors/liteDOM', VERSION, 'adaptors');
}

combineWithMathJax({_: {
  adaptors: {
    liteAdaptor: module1,
    lite: {
      Document: module2,
      Element: module3,
      List: module4,
      Parser: module5,
      Text: module6,
      Window: module7
    }
  }
}});
