import { HandlerType, ConfigurationType } from '../HandlerTypes.js';
import { Configuration } from '../Configuration.js';
import { EnvironmentMap, MacroMap } from '../TokenMap.js';
import { ParseUtil } from '../ParseUtil.js';
import BaseMethods from '../base/BaseMethods.js';
import TexError from '../TexError.js';
import { BeginItem } from '../base/BaseItems.js';
import { AmsTags } from '../ams/AmsConfiguration.js';
import { EmpheqUtil } from '../empheq/EmpheqUtil.js';
export class CasesBeginItem extends BeginItem {
    get kind() {
        return 'cases-begin';
    }
    checkItem(item) {
        if (item.isKind('end') && item.getName() === this.getName()) {
            if (this.getProperty('end')) {
                this.setProperty('end', false);
                return [[], true];
            }
        }
        return super.checkItem(item);
    }
}
export class CasesTags extends AmsTags {
    constructor() {
        super(...arguments);
        this.subcounter = 0;
    }
    start(env, taggable, defaultTags) {
        this.subcounter = 0;
        super.start(env, taggable, defaultTags);
    }
    autoTag() {
        if (this.currentTag.tag != null)
            return;
        if (this.currentTag.env === 'subnumcases') {
            if (this.subcounter === 0) {
                this.counter++;
            }
            this.subcounter++;
            this.tag(this.formatNumber(this.counter, this.subcounter), false);
        }
        else {
            if (this.currentTag.env !== 'numcases-left') {
                this.counter++;
            }
            this.tag(this.formatNumber(this.counter), false);
        }
    }
    formatNumber(n, m = null) {
        return n.toString() + (m === null ? '' : String.fromCharCode(0x60 + m));
    }
}
export const CasesMethods = {
    NumCases(parser, begin) {
        if (parser.stack.env.closing === begin.getName()) {
            delete parser.stack.env.closing;
            parser.Push(parser.itemFactory.create('end').setProperty('name', begin.getName()));
            const cases = parser.stack.Top();
            const table = cases.Last;
            const original = ParseUtil.copyNode(table, parser);
            const left = cases.getProperty('left');
            EmpheqUtil.left(table, original, left + '\\mmlToken{mo}{\\U{7B}}\\,', parser, 'numcases-left');
            parser.Push(parser.itemFactory.create('end').setProperty('name', begin.getName()));
            return null;
        }
        else {
            const left = parser.GetArgument('\\begin{' + begin.getName() + '}');
            begin.setProperty('left', left);
            const array = BaseMethods.EqnArray(parser, begin, true, true, 'll', 'tt');
            array.arraydef.displaystyle = false;
            array.arraydef.rowspacing = '.2em';
            array.setProperty('numCases', true);
            parser.Push(begin);
            return array;
        }
    },
    Entry(parser, name) {
        if (!parser.stack.Top().getProperty('numCases')) {
            return BaseMethods.Entry(parser, name);
        }
        parser.Push(parser.itemFactory
            .create('cell')
            .setProperties({ isEntry: true, name: name }));
        const tex = parser.string;
        let braces = 0;
        let i = parser.i;
        const m = tex.length;
        while (i < m) {
            const c = tex.charAt(i);
            if (c === '{') {
                braces++;
                i++;
            }
            else if (c === '}') {
                if (braces === 0) {
                    break;
                }
                else {
                    braces--;
                    i++;
                }
            }
            else if (c === '&' && braces === 0) {
                throw new TexError('ExtraCasesAlignTab', 'Extra alignment tab in text for numcase environment');
            }
            else if (c === '\\' && braces === 0) {
                const cs = (tex.slice(i + 1).match(/^[a-z]+|./i) || [])[0];
                if (cs === '\\' ||
                    cs === 'cr' ||
                    cs === 'end' ||
                    cs === 'label' ||
                    cs === undefined) {
                    break;
                }
                else {
                    i += cs.length;
                }
            }
            else {
                i++;
            }
        }
        const text = tex.substring(parser.i, i).replace(/^\s*/, '');
        parser.PushAll(ParseUtil.internalMath(parser, text, 0));
        parser.i = i;
        return null;
    },
    environment(parser, env, func, args) {
        const item = parser.itemFactory
            .create('cases-begin')
            .setProperties({ name: env, end: true });
        parser.Push(func(parser, item, ...args));
    },
};
new EnvironmentMap('cases-env', CasesMethods.environment, {
    numcases: [CasesMethods.NumCases, 'cases'],
    subnumcases: [CasesMethods.NumCases, 'cases'],
});
new MacroMap('cases-macros', {
    '&': CasesMethods.Entry,
});
export const CasesConfiguration = Configuration.create('cases', {
    [ConfigurationType.HANDLER]: {
        [HandlerType.ENVIRONMENT]: ['cases-env'],
        [HandlerType.CHARACTER]: ['cases-macros'],
    },
    [ConfigurationType.ITEMS]: {
        [CasesBeginItem.prototype.kind]: CasesBeginItem,
    },
    [ConfigurationType.TAGS]: { cases: CasesTags },
});
//# sourceMappingURL=CasesConfiguration.js.map