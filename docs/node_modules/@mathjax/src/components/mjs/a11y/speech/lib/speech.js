import {combineWithMathJax} from '../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../mjs/components/version.js';

import * as module1 from '../../../../../mjs/a11y/speech.js';
import * as module2 from '../../../../../mjs/a11y/speech/GeneratorPool.js';
import * as module3 from '../../../../../mjs/a11y/speech/SpeechUtil.js';
import * as module4 from '../../../../../mjs/a11y/speech/WebWorker.js';

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
