import {combineWithMathJax} from '../../../../../mjs/components/global.js';
import {VERSION} from '../../../../../mjs/components/version.js';

import * as module1 from '../../../../../mjs/output/common.js';
import * as module2 from '../../../../../mjs/output/common/Direction.js';
import * as module3 from '../../../../../mjs/output/common/FontData.js';
import * as module4 from '../../../../../mjs/output/common/LineBBox.js';
import * as module5 from '../../../../../mjs/output/common/LinebreakVisitor.js';
import * as module6 from '../../../../../mjs/output/common/Notation.js';
import * as module7 from '../../../../../mjs/output/common/Wrapper.js';
import * as module8 from '../../../../../mjs/output/common/WrapperFactory.js';
import * as module9 from '../../../../../mjs/output/common/Wrappers/TeXAtom.js';
import * as module10 from '../../../../../mjs/output/common/Wrappers/TextNode.js';
import * as module11 from '../../../../../mjs/output/common/Wrappers/XmlNode.js';
import * as module12 from '../../../../../mjs/output/common/Wrappers/maction.js';
import * as module13 from '../../../../../mjs/output/common/Wrappers/math.js';
import * as module14 from '../../../../../mjs/output/common/Wrappers/menclose.js';
import * as module15 from '../../../../../mjs/output/common/Wrappers/mfenced.js';
import * as module16 from '../../../../../mjs/output/common/Wrappers/mfrac.js';
import * as module17 from '../../../../../mjs/output/common/Wrappers/mglyph.js';
import * as module18 from '../../../../../mjs/output/common/Wrappers/mi.js';
import * as module19 from '../../../../../mjs/output/common/Wrappers/mmultiscripts.js';
import * as module20 from '../../../../../mjs/output/common/Wrappers/mn.js';
import * as module21 from '../../../../../mjs/output/common/Wrappers/mo.js';
import * as module22 from '../../../../../mjs/output/common/Wrappers/mpadded.js';
import * as module23 from '../../../../../mjs/output/common/Wrappers/mroot.js';
import * as module24 from '../../../../../mjs/output/common/Wrappers/mrow.js';
import * as module25 from '../../../../../mjs/output/common/Wrappers/ms.js';
import * as module26 from '../../../../../mjs/output/common/Wrappers/mspace.js';
import * as module27 from '../../../../../mjs/output/common/Wrappers/msqrt.js';
import * as module28 from '../../../../../mjs/output/common/Wrappers/msubsup.js';
import * as module29 from '../../../../../mjs/output/common/Wrappers/mtable.js';
import * as module30 from '../../../../../mjs/output/common/Wrappers/mtd.js';
import * as module31 from '../../../../../mjs/output/common/Wrappers/mtext.js';
import * as module32 from '../../../../../mjs/output/common/Wrappers/mtr.js';
import * as module33 from '../../../../../mjs/output/common/Wrappers/munderover.js';
import * as module34 from '../../../../../mjs/output/common/Wrappers/scriptbase.js';
import * as module35 from '../../../../../mjs/output/common/Wrappers/semantics.js';
import * as module36 from '../../../../../mjs/output/svg.js';
import * as module37 from '../../../../../mjs/output/svg/DefaultFont.js';
import * as module38 from '../../../../../mjs/output/svg/FontCache.js';
import * as module39 from '../../../../../mjs/output/svg/FontData.js';
import * as module40 from '../../../../../mjs/output/svg/Notation.js';
import * as module41 from '../../../../../mjs/output/svg/Wrapper.js';
import * as module42 from '../../../../../mjs/output/svg/WrapperFactory.js';
import * as module43 from '../../../../../mjs/output/svg/Wrappers.js';
import * as module44 from '../../../../../mjs/output/svg/Wrappers/HtmlNode.js';
import * as module45 from '../../../../../mjs/output/svg/Wrappers/TeXAtom.js';
import * as module46 from '../../../../../mjs/output/svg/Wrappers/TextNode.js';
import * as module47 from '../../../../../mjs/output/svg/Wrappers/maction.js';
import * as module48 from '../../../../../mjs/output/svg/Wrappers/math.js';
import * as module49 from '../../../../../mjs/output/svg/Wrappers/menclose.js';
import * as module50 from '../../../../../mjs/output/svg/Wrappers/merror.js';
import * as module51 from '../../../../../mjs/output/svg/Wrappers/mfenced.js';
import * as module52 from '../../../../../mjs/output/svg/Wrappers/mfrac.js';
import * as module53 from '../../../../../mjs/output/svg/Wrappers/mglyph.js';
import * as module54 from '../../../../../mjs/output/svg/Wrappers/mi.js';
import * as module55 from '../../../../../mjs/output/svg/Wrappers/mmultiscripts.js';
import * as module56 from '../../../../../mjs/output/svg/Wrappers/mn.js';
import * as module57 from '../../../../../mjs/output/svg/Wrappers/mo.js';
import * as module58 from '../../../../../mjs/output/svg/Wrappers/mpadded.js';
import * as module59 from '../../../../../mjs/output/svg/Wrappers/mphantom.js';
import * as module60 from '../../../../../mjs/output/svg/Wrappers/mroot.js';
import * as module61 from '../../../../../mjs/output/svg/Wrappers/mrow.js';
import * as module62 from '../../../../../mjs/output/svg/Wrappers/ms.js';
import * as module63 from '../../../../../mjs/output/svg/Wrappers/mspace.js';
import * as module64 from '../../../../../mjs/output/svg/Wrappers/msqrt.js';
import * as module65 from '../../../../../mjs/output/svg/Wrappers/msubsup.js';
import * as module66 from '../../../../../mjs/output/svg/Wrappers/mtable.js';
import * as module67 from '../../../../../mjs/output/svg/Wrappers/mtd.js';
import * as module68 from '../../../../../mjs/output/svg/Wrappers/mtext.js';
import * as module69 from '../../../../../mjs/output/svg/Wrappers/mtr.js';
import * as module70 from '../../../../../mjs/output/svg/Wrappers/munderover.js';
import * as module71 from '../../../../../mjs/output/svg/Wrappers/scriptbase.js';
import * as module72 from '../../../../../mjs/output/svg/Wrappers/semantics.js';
import * as module73 from '../../../../../mjs/output/svg/Wrappers/zero.js';

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
