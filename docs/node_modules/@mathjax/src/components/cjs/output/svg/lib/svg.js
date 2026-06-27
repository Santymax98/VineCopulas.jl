const {combineWithMathJax} = require('../../../../../cjs/components/global.js')
const {VERSION} = require('../../../../../cjs/components/version.js');

const module1 = require('../../../../../cjs/output/common.js');
const module2 = require('../../../../../cjs/output/common/Direction.js');
const module3 = require('../../../../../cjs/output/common/FontData.js');
const module4 = require('../../../../../cjs/output/common/LineBBox.js');
const module5 = require('../../../../../cjs/output/common/LinebreakVisitor.js');
const module6 = require('../../../../../cjs/output/common/Notation.js');
const module7 = require('../../../../../cjs/output/common/Wrapper.js');
const module8 = require('../../../../../cjs/output/common/WrapperFactory.js');
const module9 = require('../../../../../cjs/output/common/Wrappers/TeXAtom.js');
const module10 = require('../../../../../cjs/output/common/Wrappers/TextNode.js');
const module11 = require('../../../../../cjs/output/common/Wrappers/XmlNode.js');
const module12 = require('../../../../../cjs/output/common/Wrappers/maction.js');
const module13 = require('../../../../../cjs/output/common/Wrappers/math.js');
const module14 = require('../../../../../cjs/output/common/Wrappers/menclose.js');
const module15 = require('../../../../../cjs/output/common/Wrappers/mfenced.js');
const module16 = require('../../../../../cjs/output/common/Wrappers/mfrac.js');
const module17 = require('../../../../../cjs/output/common/Wrappers/mglyph.js');
const module18 = require('../../../../../cjs/output/common/Wrappers/mi.js');
const module19 = require('../../../../../cjs/output/common/Wrappers/mmultiscripts.js');
const module20 = require('../../../../../cjs/output/common/Wrappers/mn.js');
const module21 = require('../../../../../cjs/output/common/Wrappers/mo.js');
const module22 = require('../../../../../cjs/output/common/Wrappers/mpadded.js');
const module23 = require('../../../../../cjs/output/common/Wrappers/mroot.js');
const module24 = require('../../../../../cjs/output/common/Wrappers/mrow.js');
const module25 = require('../../../../../cjs/output/common/Wrappers/ms.js');
const module26 = require('../../../../../cjs/output/common/Wrappers/mspace.js');
const module27 = require('../../../../../cjs/output/common/Wrappers/msqrt.js');
const module28 = require('../../../../../cjs/output/common/Wrappers/msubsup.js');
const module29 = require('../../../../../cjs/output/common/Wrappers/mtable.js');
const module30 = require('../../../../../cjs/output/common/Wrappers/mtd.js');
const module31 = require('../../../../../cjs/output/common/Wrappers/mtext.js');
const module32 = require('../../../../../cjs/output/common/Wrappers/mtr.js');
const module33 = require('../../../../../cjs/output/common/Wrappers/munderover.js');
const module34 = require('../../../../../cjs/output/common/Wrappers/scriptbase.js');
const module35 = require('../../../../../cjs/output/common/Wrappers/semantics.js');
const module36 = require('../../../../../cjs/output/svg.js');
const module37 = require('../../../../../cjs/output/svg/DefaultFont.js');
const module38 = require('../../../../../cjs/output/svg/FontCache.js');
const module39 = require('../../../../../cjs/output/svg/FontData.js');
const module40 = require('../../../../../cjs/output/svg/Notation.js');
const module41 = require('../../../../../cjs/output/svg/Wrapper.js');
const module42 = require('../../../../../cjs/output/svg/WrapperFactory.js');
const module43 = require('../../../../../cjs/output/svg/Wrappers.js');
const module44 = require('../../../../../cjs/output/svg/Wrappers/HtmlNode.js');
const module45 = require('../../../../../cjs/output/svg/Wrappers/TeXAtom.js');
const module46 = require('../../../../../cjs/output/svg/Wrappers/TextNode.js');
const module47 = require('../../../../../cjs/output/svg/Wrappers/maction.js');
const module48 = require('../../../../../cjs/output/svg/Wrappers/math.js');
const module49 = require('../../../../../cjs/output/svg/Wrappers/menclose.js');
const module50 = require('../../../../../cjs/output/svg/Wrappers/merror.js');
const module51 = require('../../../../../cjs/output/svg/Wrappers/mfenced.js');
const module52 = require('../../../../../cjs/output/svg/Wrappers/mfrac.js');
const module53 = require('../../../../../cjs/output/svg/Wrappers/mglyph.js');
const module54 = require('../../../../../cjs/output/svg/Wrappers/mi.js');
const module55 = require('../../../../../cjs/output/svg/Wrappers/mmultiscripts.js');
const module56 = require('../../../../../cjs/output/svg/Wrappers/mn.js');
const module57 = require('../../../../../cjs/output/svg/Wrappers/mo.js');
const module58 = require('../../../../../cjs/output/svg/Wrappers/mpadded.js');
const module59 = require('../../../../../cjs/output/svg/Wrappers/mphantom.js');
const module60 = require('../../../../../cjs/output/svg/Wrappers/mroot.js');
const module61 = require('../../../../../cjs/output/svg/Wrappers/mrow.js');
const module62 = require('../../../../../cjs/output/svg/Wrappers/ms.js');
const module63 = require('../../../../../cjs/output/svg/Wrappers/mspace.js');
const module64 = require('../../../../../cjs/output/svg/Wrappers/msqrt.js');
const module65 = require('../../../../../cjs/output/svg/Wrappers/msubsup.js');
const module66 = require('../../../../../cjs/output/svg/Wrappers/mtable.js');
const module67 = require('../../../../../cjs/output/svg/Wrappers/mtd.js');
const module68 = require('../../../../../cjs/output/svg/Wrappers/mtext.js');
const module69 = require('../../../../../cjs/output/svg/Wrappers/mtr.js');
const module70 = require('../../../../../cjs/output/svg/Wrappers/munderover.js');
const module71 = require('../../../../../cjs/output/svg/Wrappers/scriptbase.js');
const module72 = require('../../../../../cjs/output/svg/Wrappers/semantics.js');
const module73 = require('../../../../../cjs/output/svg/Wrappers/zero.js');

if (MathJax.loader) {
  MathJax.loader.checkVersion('output/svg', VERSION, 'output');
}

combineWithMathJax({_: {
  output: {
    common_ts: module1,
    common: {
      Direction: module2,
      FontData: module3,
      LineBBox: module4,
      LinebreakVisitor: module5,
      Notation: module6,
      Wrapper: module7,
      WrapperFactory: module8,
      Wrappers: {
        TeXAtom: module9,
        TextNode: module10,
        XmlNode: module11,
        maction: module12,
        math: module13,
        menclose: module14,
        mfenced: module15,
        mfrac: module16,
        mglyph: module17,
        mi: module18,
        mmultiscripts: module19,
        mn: module20,
        mo: module21,
        mpadded: module22,
        mroot: module23,
        mrow: module24,
        ms: module25,
        mspace: module26,
        msqrt: module27,
        msubsup: module28,
        mtable: module29,
        mtd: module30,
        mtext: module31,
        mtr: module32,
        munderover: module33,
        scriptbase: module34,
        semantics: module35
      }
    },
    svg_ts: module36,
    svg: {
      DefaultFont: module37,
      FontCache: module38,
      FontData: module39,
      Notation: module40,
      Wrapper: module41,
      WrapperFactory: module42,
      Wrappers_ts: module43,
      Wrappers: {
        HtmlNode: module44,
        TeXAtom: module45,
        TextNode: module46,
        maction: module47,
        math: module48,
        menclose: module49,
        merror: module50,
        mfenced: module51,
        mfrac: module52,
        mglyph: module53,
        mi: module54,
        mmultiscripts: module55,
        mn: module56,
        mo: module57,
        mpadded: module58,
        mphantom: module59,
        mroot: module60,
        mrow: module61,
        ms: module62,
        mspace: module63,
        msqrt: module64,
        msubsup: module65,
        mtable: module66,
        mtd: module67,
        mtext: module68,
        mtr: module69,
        munderover: module70,
        scriptbase: module71,
        semantics: module72,
        zero: module73
      }
    }
  }
}});
