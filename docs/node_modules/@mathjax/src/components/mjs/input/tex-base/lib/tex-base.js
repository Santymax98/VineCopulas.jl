import {combineWithMathJax} from '../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../mjs/components/version.js';

import * as module1 from '../../../../../mjs/input/tex.js';
import * as module2 from '../../../../../mjs/input/tex/ColumnParser.js';
import * as module3 from '../../../../../mjs/input/tex/Configuration.js';
import * as module4 from '../../../../../mjs/input/tex/FilterUtil.js';
import * as module5 from '../../../../../mjs/input/tex/FindTeX.js';
import * as module6 from '../../../../../mjs/input/tex/HandlerTypes.js';
import * as module7 from '../../../../../mjs/input/tex/MapHandler.js';
import * as module8 from '../../../../../mjs/input/tex/NodeFactory.js';
import * as module9 from '../../../../../mjs/input/tex/NodeUtil.js';
import * as module10 from '../../../../../mjs/input/tex/ParseMethods.js';
import * as module11 from '../../../../../mjs/input/tex/ParseOptions.js';
import * as module12 from '../../../../../mjs/input/tex/ParseUtil.js';
import * as module13 from '../../../../../mjs/input/tex/Stack.js';
import * as module14 from '../../../../../mjs/input/tex/StackItem.js';
import * as module15 from '../../../../../mjs/input/tex/StackItemFactory.js';
import * as module16 from '../../../../../mjs/input/tex/Tags.js';
import * as module17 from '../../../../../mjs/input/tex/TexConstants.js';
import * as module18 from '../../../../../mjs/input/tex/TexError.js';
import * as module19 from '../../../../../mjs/input/tex/TexParser.js';
import * as module20 from '../../../../../mjs/input/tex/Token.js';
import * as module21 from '../../../../../mjs/input/tex/TokenMap.js';
import * as module22 from '../../../../../mjs/input/tex/UnitUtil.js';
import * as module23 from '../../../../../mjs/input/tex/base/BaseConfiguration.js';
import * as module24 from '../../../../../mjs/input/tex/base/BaseItems.js';
import * as module25 from '../../../../../mjs/input/tex/base/BaseMethods.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('input/tex-base', VERSION, 'input');
}

combineWithMathJax({_: {
  input: {
    tex_ts: module1,
    tex: {
      ColumnParser: module2,
      Configuration: module3,
      FilterUtil: module4,
      FindTeX: module5,
      HandlerTypes: module6,
      MapHandler: module7,
      NodeFactory: module8,
      NodeUtil: module9,
      ParseMethods: module10,
      ParseOptions: module11,
      ParseUtil: module12,
      Stack: module13,
      StackItem: module14,
      StackItemFactory: module15,
      Tags: module16,
      TexConstants: module17,
      TexError: module18,
      TexParser: module19,
      Token: module20,
      TokenMap: module21,
      UnitUtil: module22,
      base: {
        BaseConfiguration: module23,
        BaseItems: module24,
        BaseMethods: module25
      }
    }
  }
}});
