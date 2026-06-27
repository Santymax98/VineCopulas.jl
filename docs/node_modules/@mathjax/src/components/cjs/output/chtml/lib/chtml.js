const {combineWithMathJax} = require('../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../cjs/components/version.js');

const module1 = require('../../../../../cjs/output/chtml.js');
const module2 = require('../../../../../cjs/output/chtml/DefaultFont.js');
const module3 = require('../../../../../cjs/output/chtml/DynamicFonts.js');
const module4 = require('../../../../../cjs/output/chtml/FontData.js');
const module5 = require('../../../../../cjs/output/chtml/Notation.js');
const module6 = require('../../../../../cjs/output/chtml/Usage.js');
const module7 = require('../../../../../cjs/output/chtml/Wrapper.js');
const module8 = require('../../../../../cjs/output/chtml/WrapperFactory.js');
const module9 = require('../../../../../cjs/output/chtml/Wrappers.js');
const module10 = require('../../../../../cjs/output/chtml/Wrappers/HtmlNode.js');
const module11 = require('../../../../../cjs/output/chtml/Wrappers/TeXAtom.js');
const module12 = require('../../../../../cjs/output/chtml/Wrappers/TextNode.js');
const module13 = require('../../../../../cjs/output/chtml/Wrappers/maction.js');
const module14 = require('../../../../../cjs/output/chtml/Wrappers/math.js');
const module15 = require('../../../../../cjs/output/chtml/Wrappers/menclose.js');
const module16 = require('../../../../../cjs/output/chtml/Wrappers/mfenced.js');
const module17 = require('../../../../../cjs/output/chtml/Wrappers/mfrac.js');
const module18 = require('../../../../../cjs/output/chtml/Wrappers/mglyph.js');
const module19 = require('../../../../../cjs/output/chtml/Wrappers/mi.js');
const module20 = require('../../../../../cjs/output/chtml/Wrappers/mmultiscripts.js');
const module21 = require('../../../../../cjs/output/chtml/Wrappers/mn.js');
const module22 = require('../../../../../cjs/output/chtml/Wrappers/mo.js');
const module23 = require('../../../../../cjs/output/chtml/Wrappers/mpadded.js');
const module24 = require('../../../../../cjs/output/chtml/Wrappers/mroot.js');
const module25 = require('../../../../../cjs/output/chtml/Wrappers/mrow.js');
const module26 = require('../../../../../cjs/output/chtml/Wrappers/ms.js');
const module27 = require('../../../../../cjs/output/chtml/Wrappers/mspace.js');
const module28 = require('../../../../../cjs/output/chtml/Wrappers/msqrt.js');
const module29 = require('../../../../../cjs/output/chtml/Wrappers/msubsup.js');
const module30 = require('../../../../../cjs/output/chtml/Wrappers/mtable.js');
const module31 = require('../../../../../cjs/output/chtml/Wrappers/mtd.js');
const module32 = require('../../../../../cjs/output/chtml/Wrappers/mtext.js');
const module33 = require('../../../../../cjs/output/chtml/Wrappers/mtr.js');
const module34 = require('../../../../../cjs/output/chtml/Wrappers/munderover.js');
const module35 = require('../../../../../cjs/output/chtml/Wrappers/scriptbase.js');
const module36 = require('../../../../../cjs/output/chtml/Wrappers/semantics.js');
const module37 = require('../../../../../cjs/output/common.js');
const module38 = require('../../../../../cjs/output/common/Direction.js');
const module39 = require('../../../../../cjs/output/common/FontData.js');
const module40 = require('../../../../../cjs/output/common/LineBBox.js');
const module41 = require('../../../../../cjs/output/common/LinebreakVisitor.js');
const module42 = require('../../../../../cjs/output/common/Notation.js');
const module43 = require('../../../../../cjs/output/common/Wrapper.js');
const module44 = require('../../../../../cjs/output/common/WrapperFactory.js');
const module45 = require('../../../../../cjs/output/common/Wrappers/TeXAtom.js');
const module46 = require('../../../../../cjs/output/common/Wrappers/TextNode.js');
const module47 = require('../../../../../cjs/output/common/Wrappers/XmlNode.js');
const module48 = require('../../../../../cjs/output/common/Wrappers/maction.js');
const module49 = require('../../../../../cjs/output/common/Wrappers/math.js');
const module50 = require('../../../../../cjs/output/common/Wrappers/menclose.js');
const module51 = require('../../../../../cjs/output/common/Wrappers/mfenced.js');
const module52 = require('../../../../../cjs/output/common/Wrappers/mfrac.js');
const module53 = require('../../../../../cjs/output/common/Wrappers/mglyph.js');
const module54 = require('../../../../../cjs/output/common/Wrappers/mi.js');
const module55 = require('../../../../../cjs/output/common/Wrappers/mmultiscripts.js');
const module56 = require('../../../../../cjs/output/common/Wrappers/mn.js');
const module57 = require('../../../../../cjs/output/common/Wrappers/mo.js');
const module58 = require('../../../../../cjs/output/common/Wrappers/mpadded.js');
const module59 = require('../../../../../cjs/output/common/Wrappers/mroot.js');
const module60 = require('../../../../../cjs/output/common/Wrappers/mrow.js');
const module61 = require('../../../../../cjs/output/common/Wrappers/ms.js');
const module62 = require('../../../../../cjs/output/common/Wrappers/mspace.js');
const module63 = require('../../../../../cjs/output/common/Wrappers/msqrt.js');
const module64 = require('../../../../../cjs/output/common/Wrappers/msubsup.js');
const module65 = require('../../../../../cjs/output/common/Wrappers/mtable.js');
const module66 = require('../../../../../cjs/output/common/Wrappers/mtd.js');
const module67 = require('../../../../../cjs/output/common/Wrappers/mtext.js');
const module68 = require('../../../../../cjs/output/common/Wrappers/mtr.js');
const module69 = require('../../../../../cjs/output/common/Wrappers/munderover.js');
const module70 = require('../../../../../cjs/output/common/Wrappers/scriptbase.js');
const module71 = require('../../../../../cjs/output/common/Wrappers/semantics.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('output/chtml', VERSION, 'output');
}

combineWithMathJax({_: {
  output: {
    chtml_ts: module1,
    chtml: {
      DefaultFont: module2,
      DynamicFonts: module3,
      FontData: module4,
      Notation: module5,
      Usage: module6,
      Wrapper: module7,
      WrapperFactory: module8,
      Wrappers_ts: module9,
      Wrappers: {
        HtmlNode: module10,
        TeXAtom: module11,
        TextNode: module12,
        maction: module13,
        math: module14,
        menclose: module15,
        mfenced: module16,
        mfrac: module17,
        mglyph: module18,
        mi: module19,
        mmultiscripts: module20,
        mn: module21,
        mo: module22,
        mpadded: module23,
        mroot: module24,
        mrow: module25,
        ms: module26,
        mspace: module27,
        msqrt: module28,
        msubsup: module29,
        mtable: module30,
        mtd: module31,
        mtext: module32,
        mtr: module33,
        munderover: module34,
        scriptbase: module35,
        semantics: module36
      }
    },
    common_ts: module37,
    common: {
      Direction: module38,
      FontData: module39,
      LineBBox: module40,
      LinebreakVisitor: module41,
      Notation: module42,
      Wrapper: module43,
      WrapperFactory: module44,
      Wrappers: {
        TeXAtom: module45,
        TextNode: module46,
        XmlNode: module47,
        maction: module48,
        math: module49,
        menclose: module50,
        mfenced: module51,
        mfrac: module52,
        mglyph: module53,
        mi: module54,
        mmultiscripts: module55,
        mn: module56,
        mo: module57,
        mpadded: module58,
        mroot: module59,
        mrow: module60,
        ms: module61,
        mspace: module62,
        msqrt: module63,
        msubsup: module64,
        mtable: module65,
        mtd: module66,
        mtext: module67,
        mtr: module68,
        munderover: module69,
        scriptbase: module70,
        semantics: module71
      }
    }
  }
}});
