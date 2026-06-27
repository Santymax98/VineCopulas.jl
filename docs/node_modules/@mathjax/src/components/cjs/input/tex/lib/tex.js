const {combineWithMathJax} = require('../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../cjs/components/version.js');

const module1 = require('../../../../../cjs/input/tex.js');
const module2 = require('../../../../../cjs/input/tex/ColumnParser.js');
const module3 = require('../../../../../cjs/input/tex/Configuration.js');
const module4 = require('../../../../../cjs/input/tex/FilterUtil.js');
const module5 = require('../../../../../cjs/input/tex/FindTeX.js');
const module6 = require('../../../../../cjs/input/tex/HandlerTypes.js');
const module7 = require('../../../../../cjs/input/tex/MapHandler.js');
const module8 = require('../../../../../cjs/input/tex/NodeFactory.js');
const module9 = require('../../../../../cjs/input/tex/NodeUtil.js');
const module10 = require('../../../../../cjs/input/tex/ParseMethods.js');
const module11 = require('../../../../../cjs/input/tex/ParseOptions.js');
const module12 = require('../../../../../cjs/input/tex/ParseUtil.js');
const module13 = require('../../../../../cjs/input/tex/Stack.js');
const module14 = require('../../../../../cjs/input/tex/StackItem.js');
const module15 = require('../../../../../cjs/input/tex/StackItemFactory.js');
const module16 = require('../../../../../cjs/input/tex/Tags.js');
const module17 = require('../../../../../cjs/input/tex/TexConstants.js');
const module18 = require('../../../../../cjs/input/tex/TexError.js');
const module19 = require('../../../../../cjs/input/tex/TexParser.js');
const module20 = require('../../../../../cjs/input/tex/Token.js');
const module21 = require('../../../../../cjs/input/tex/TokenMap.js');
const module22 = require('../../../../../cjs/input/tex/UnitUtil.js');
const module23 = require('../../../../../cjs/input/tex/ams/AmsConfiguration.js');
const module24 = require('../../../../../cjs/input/tex/ams/AmsItems.js');
const module25 = require('../../../../../cjs/input/tex/ams/AmsMethods.js');
const module26 = require('../../../../../cjs/input/tex/autoload/AutoloadConfiguration.js');
const module27 = require('../../../../../cjs/input/tex/base/BaseConfiguration.js');
const module28 = require('../../../../../cjs/input/tex/base/BaseItems.js');
const module29 = require('../../../../../cjs/input/tex/base/BaseMethods.js');
const module30 = require('../../../../../cjs/input/tex/configmacros/ConfigMacrosConfiguration.js');
const module31 = require('../../../../../cjs/input/tex/newcommand/NewcommandConfiguration.js');
const module32 = require('../../../../../cjs/input/tex/newcommand/NewcommandItems.js');
const module33 = require('../../../../../cjs/input/tex/newcommand/NewcommandMethods.js');
const module34 = require('../../../../../cjs/input/tex/newcommand/NewcommandUtil.js');
const module35 = require('../../../../../cjs/input/tex/noundefined/NoUndefinedConfiguration.js');
const module36 = require('../../../../../cjs/input/tex/require/RequireConfiguration.js');
const module37 = require('../../../../../cjs/input/tex/textmacros/TextMacrosConfiguration.js');
const module38 = require('../../../../../cjs/input/tex/textmacros/TextMacrosMethods.js');
const module39 = require('../../../../../cjs/input/tex/textmacros/TextParser.js');

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
