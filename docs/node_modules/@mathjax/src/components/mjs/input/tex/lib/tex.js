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
import * as module23 from '../../../../../mjs/input/tex/ams/AmsConfiguration.js';
import * as module24 from '../../../../../mjs/input/tex/ams/AmsItems.js';
import * as module25 from '../../../../../mjs/input/tex/ams/AmsMethods.js';
import * as module26 from '../../../../../mjs/input/tex/autoload/AutoloadConfiguration.js';
import * as module27 from '../../../../../mjs/input/tex/base/BaseConfiguration.js';
import * as module28 from '../../../../../mjs/input/tex/base/BaseItems.js';
import * as module29 from '../../../../../mjs/input/tex/base/BaseMethods.js';
import * as module30 from '../../../../../mjs/input/tex/configmacros/ConfigMacrosConfiguration.js';
import * as module31 from '../../../../../mjs/input/tex/newcommand/NewcommandConfiguration.js';
import * as module32 from '../../../../../mjs/input/tex/newcommand/NewcommandItems.js';
import * as module33 from '../../../../../mjs/input/tex/newcommand/NewcommandMethods.js';
import * as module34 from '../../../../../mjs/input/tex/newcommand/NewcommandUtil.js';
import * as module35 from '../../../../../mjs/input/tex/noundefined/NoUndefinedConfiguration.js';
import * as module36 from '../../../../../mjs/input/tex/require/RequireConfiguration.js';
import * as module37 from '../../../../../mjs/input/tex/textmacros/TextMacrosConfiguration.js';
import * as module38 from '../../../../../mjs/input/tex/textmacros/TextMacrosMethods.js';
import * as module39 from '../../../../../mjs/input/tex/textmacros/TextParser.js';

if (MathJax.loader) {
  MathJax.loader.checkVersion('input/tex', VERSION, 'input');
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
      ams: {
        AmsConfiguration: module23,
        AmsItems: module24,
        AmsMethods: module25
      },
      autoload: {
        AutoloadConfiguration: module26
      },
      base: {
        BaseConfiguration: module27,
        BaseItems: module28,
        BaseMethods: module29
      },
      configmacros: {
        ConfigMacrosConfiguration: module30
      },
      newcommand: {
        NewcommandConfiguration: module31,
        NewcommandItems: module32,
        NewcommandMethods: module33,
        NewcommandUtil: module34
      },
      noundefined: {
        NoUndefinedConfiguration: module35
      },
      require: {
        RequireConfiguration: module36
      },
      textmacros: {
        TextMacrosConfiguration: module37,
        TextMacrosMethods: module38,
        TextParser: module39
      }
    }
  }
}});
