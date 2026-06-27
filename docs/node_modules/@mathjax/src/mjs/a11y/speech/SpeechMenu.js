var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MJContextMenu } from '../../ui/menu/MJContextMenu.js';
import { SelectionDialog, } from '../../ui/dialog/SelectionDialog.js';
import * as Sre from '../sre.js';
let csPrefsSetting = {};
let previousPrefs = null;
function currentPreference(settings) {
    var _a, _b;
    const matcher = settings === null || settings === void 0 ? void 0 : settings.match(/^clearspeak-(.*)/);
    previousPrefs = (_b = (_a = (matcher && matcher[1])) !== null && _a !== void 0 ? _a : previousPrefs) !== null && _b !== void 0 ? _b : 'default';
    return previousPrefs;
}
function csPrefsVariables(menu, prefs) {
    const srVariable = menu.pool.lookup('speechRules');
    const previous = currentPreference(menu.settings.speechRules);
    csPrefsSetting = Sre.fromPreference(previous);
    for (const pref of prefs) {
        menu.factory.get('variable')(menu.factory, {
            name: 'csprf_' + pref,
            setter: (value) => {
                csPrefsSetting[pref] = value;
                srVariable.setValue('clearspeak-' + Sre.toPreference(csPrefsSetting));
            },
            getter: () => {
                return csPrefsSetting[pref] || 'Auto';
            },
        }, menu.pool);
    }
}
const localePreferences = new Map();
function getLocalePreferences(menu, locale) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!localePreferences.has(locale)) {
            yield menu.mathItem.generatorPool.getLocalePreferences(localePreferences);
        }
    });
}
const relevantPreferences = new Map();
let counter = 0;
function csSelectionBox(menu, locale) {
    const props = localePreferences.get(locale);
    csPrefsVariables(menu, Object.keys(props));
    const items = [];
    for (const prop of Object.getOwnPropertyNames(props)) {
        items.push({
            title: prop,
            values: props[prop].map((x) => x.replace(RegExp('^' + prop + '_'), '')),
            variable: 'csprf_' + prop,
        });
    }
    const sb = new SelectionDialog('Clearspeak Preferences', '', items, "alphabetical", "square", menu);
    return {
        type: 'command',
        id: 'ClearspeakPreferences',
        content: 'Select Preferences',
        action: () => sb.post(),
    };
}
function basePreferences(previous) {
    const items = [
        {
            type: 'radio',
            content: 'No Preferences',
            id: 'clearspeak-default',
            variable: 'speechRules',
        },
        {
            type: 'radio',
            content: 'Current Preferences',
            id: 'clearspeak-' + previous,
            variable: 'speechRules',
        },
        {
            type: 'rule',
        },
    ];
    return items;
}
function smartPreferences(previous, smart, locale) {
    const loc = localePreferences.get(locale);
    const items = [
        { type: 'label', content: 'Preferences for ' + smart },
        { type: 'rule' },
    ];
    return items.concat(loc[smart].map(function (x) {
        const [key, value] = x.split('_');
        return {
            type: 'radioCompare',
            content: value,
            id: 'clearspeak-' + Sre.addPreference(previous, key, value),
            variable: 'speechRules',
            comparator: (x, y) => {
                if (x === y) {
                    return true;
                }
                if (value !== 'Auto') {
                    return false;
                }
                const [dom1, pref] = x.split('-');
                const [dom2] = y.split('-');
                return (dom1 === dom2 && !Sre.fromPreference(pref)[key]);
            },
        };
    }));
}
export function clearspeakMenu(menu, sub, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const exit = (items) => {
            callback(menu.factory.get('subMenu')(menu.factory, {
                items: items,
                id: 'Clearspeak',
            }, sub));
        };
        if (!menu.settings.speech || !menu.settings.enrich) {
            exit([]);
            return;
        }
        const locale = menu.pool.lookup('locale').getValue();
        yield getLocalePreferences(menu, locale);
        if (!localePreferences.get(locale)) {
            exit([]);
            return;
        }
        const box = csSelectionBox(menu, locale);
        let items = [];
        if (menu.settings.speech) {
            const item = menu.mathItem;
            const explorer = (_a = item === null || item === void 0 ? void 0 : item.explorers) === null || _a === void 0 ? void 0 : _a.speech;
            const previous = currentPreference(menu.settings.speechRules);
            items = items.concat(basePreferences(previous));
            const focus = explorer === null || explorer === void 0 ? void 0 : explorer.refocus;
            const semantic = (_b = focus === null || focus === void 0 ? void 0 : focus.getAttribute('data-semantic-id')) !== null && _b !== void 0 ? _b : null;
            const count = counter++;
            yield item.generatorPool.getRelevantPreferences(item, semantic, relevantPreferences, count);
            const smart = relevantPreferences.get(count);
            relevantPreferences.delete(count);
            if (smart) {
                const smartItems = smartPreferences(previous, smart, locale);
                items = items.concat(smartItems);
            }
        }
        items.splice(2, 0, box);
        exit(items);
    });
}
MJContextMenu.DynamicSubmenus.set('Clearspeak', [clearspeakMenu, 'speech']);
let LOCALE_MENU = null;
export function localeMenu(menu, sub, callback) {
    if (LOCALE_MENU) {
        callback(LOCALE_MENU);
        return;
    }
    const radios = [];
    for (const lang of Sre.locales.keys()) {
        if (lang === 'nemeth' || lang === 'euro')
            continue;
        radios.push({
            type: 'radio',
            id: lang,
            content: Sre.locales.get(lang) || lang,
            variable: 'locale',
        });
    }
    radios.sort((x, y) => x.content.localeCompare(y.content, 'en'));
    LOCALE_MENU = menu.factory.get('subMenu')(menu.factory, {
        items: radios,
        id: 'Language',
    }, sub);
    callback(LOCALE_MENU);
}
MJContextMenu.DynamicSubmenus.set('A11yLanguage', [localeMenu, 'speech']);
//# sourceMappingURL=SpeechMenu.js.map