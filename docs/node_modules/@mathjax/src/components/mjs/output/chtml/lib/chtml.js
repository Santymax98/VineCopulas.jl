import {combineWithMathJax} from '../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../mjs/components/version.js';

import * as module1 from '../../../../../mjs/output/chtml.js';
import * as module2 from '../../../../../mjs/output/chtml/DefaultFont.js';
import * as module3 from '../../../../../mjs/output/chtml/DynamicFonts.js';
import * as module4 from '../../../../../mjs/output/chtml/FontData.js';
import * as module5 from '../../../../../mjs/output/chtml/Notation.js';
import * as module6 from '../../../../../mjs/output/chtml/Usage.js';
import * as module7 from '../../../../../mjs/output/chtml/Wrapper.js';
import * as module8 from '../../../../../mjs/output/chtml/WrapperFactory.js';
import * as module9 from '../../../../../mjs/output/chtml/Wrappers.js';
import * as module10 from '../../../../../mjs/output/chtml/Wrappers/HtmlNode.js';
import * as module11 from '../../../../../mjs/output/chtml/Wrappers/TeXAtom.js';
import * as module12 from '../../../../../mjs/output/chtml/Wrappers/TextNode.js';
import * as module13 from '../../../../../mjs/output/chtml/Wrappers/maction.js';
import * as module14 from '../../../../../mjs/output/chtml/Wrappers/math.js';
import * as module15 from '../../../../../mjs/output/chtml/Wrappers/menclose.js';
import * as module16 from '../../../../../mjs/output/chtml/Wrappers/mfenced.js';
import * as module17 from '../../../../../mjs/output/chtml/Wrappers/mfrac.js';
import * as module18 from '../../../../../mjs/output/chtml/Wrappers/mglyph.js';
import * as module19 from '../../../../../mjs/output/chtml/Wrappers/mi.js';
import * as module20 from '../../../../../mjs/output/chtml/Wrappers/mmultiscripts.js';
import * as module21 from '../../../../../mjs/output/chtml/Wrappers/mn.js';
import * as module22 from '../../../../../mjs/output/chtml/Wrappers/mo.js';
import * as module23 from '../../../../../mjs/output/chtml/Wrappers/mpadded.js';
import * as module24 from '../../../../../mjs/output/chtml/Wrappers/mroot.js';
import * as module25 from '../../../../../mjs/output/chtml/Wrappers/mrow.js';
import * as module26 from '../../../../../mjs/output/chtml/Wrappers/ms.js';
import * as module27 from '../../../../../mjs/output/chtml/Wrappers/mspace.js';
import * as module28 from '../../../../../mjs/output/chtml/Wrappers/msqrt.js';
import * as module29 from '../../../../../mjs/output/chtml/Wrappers/msubsup.js';
import * as module30 from '../../../../../mjs/output/chtml/Wrappers/mtable.js';
import * as module31 from '../../../../../mjs/output/chtml/Wrappers/mtd.js';
import * as module32 from '../../../../../mjs/output/chtml/Wrappers/mtext.js';
import * as module33 from '../../../../../mjs/output/chtml/Wrappers/mtr.js';
import * as module34 from '../../../../../mjs/output/chtml/Wrappers/munderover.js';
import * as module35 from '../../../../../mjs/output/chtml/Wrappers/scriptbase.js';
import * as module36 from '../../../../../mjs/output/chtml/Wrappers/semantics.js';
import * as module37 from '../../../../../mjs/output/common.js';
import * as module38 from '../../../../../mjs/output/common/Direction.js';
import * as module39 from '../../../../../mjs/output/common/FontData.js';
import * as module40 from '../../../../../mjs/output/common/LineBBox.js';
import * as module41 from '../../../../../mjs/output/common/LinebreakVisitor.js';
import * as module42 from '../../../../../mjs/output/common/Notation.js';
import * as module43 from '../../../../../mjs/output/common/Wrapper.js';
import * as module44 from '../../../../../mjs/output/common/WrapperFactory.js';
import * as module45 from '../../../../../mjs/output/common/Wrappers/TeXAtom.js';
import * as module46 from '../../../../../mjs/output/common/Wrappers/TextNode.js';
import * as module47 from '../../../../../mjs/output/common/Wrappers/XmlNode.js';
import * as module48 from '../../../../../mjs/output/common/Wrappers/maction.js';
import * as module49 from '../../../../../mjs/output/common/Wrappers/math.js';
import * as module50 from '../../../../../mjs/output/common/Wrappers/menclose.js';
import * as module51 from '../../../../../mjs/output/common/Wrappers/mfenced.js';
import * as module52 from '../../../../../mjs/output/common/Wrappers/mfrac.js';
import * as module53 from '../../../../../mjs/output/common/Wrappers/mglyph.js';
import * as module54 from '../../../../../mjs/output/common/Wrappers/mi.js';
import * as module55 from '../../../../../mjs/output/common/Wrappers/mmultiscripts.js';
import * as module56 from '../../../../../mjs/output/common/Wrappers/mn.js';
import * as module57 from '../../../../../mjs/output/common/Wrappers/mo.js';
import * as module58 from '../../../../../mjs/output/common/Wrappers/mpadded.js';
import * as module59 from '../../../../../mjs/output/common/Wrappers/mroot.js';
import * as module60 from '../../../../../mjs/output/common/Wrappers/mrow.js';
import * as module61 from '../../../../../mjs/output/common/Wrappers/ms.js';
import * as module62 from '../../../../../mjs/output/common/Wrappers/mspace.js';
import * as module63 from '../../../../../mjs/output/common/Wrappers/msqrt.js';
import * as module64 from '../../../../../mjs/output/common/Wrappers/msubsup.js';
import * as module65 from '../../../../../mjs/output/common/Wrappers/mtable.js';
import * as module66 from '../../../../../mjs/output/common/Wrappers/mtd.js';
import * as module67 from '../../../../../mjs/output/common/Wrappers/mtext.js';
import * as module68 from '../../../../../mjs/output/common/Wrappers/mtr.js';
import * as module69 from '../../../../../mjs/output/common/Wrappers/munderover.js';
import * as module70 from '../../../../../mjs/output/common/Wrappers/scriptbase.js';
import * as module71 from '../../../../../mjs/output/common/Wrappers/semantics.js';

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
