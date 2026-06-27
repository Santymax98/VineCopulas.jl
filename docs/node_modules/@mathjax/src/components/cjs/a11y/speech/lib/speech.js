const {combineWithMathJax} = require('../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../cjs/components/version.js');

const module1 = require('../../../../../cjs/a11y/speech.js');
const module2 = require('../../../../../cjs/a11y/speech/GeneratorPool.js');
const module3 = require('../../../../../cjs/a11y/speech/SpeechUtil.js');
const module4 = require('../../../../../cjs/a11y/speech/WebWorker.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('a11y/speech', VERSION, 'a11y');
}

combineWithMathJax({_: {
  a11y: {
    speech_ts: module1,
    speech: {
      GeneratorPool: module2,
      SpeechUtil: module3,
      WebWorker: module4
    }
  }
}});
