import { mathjax } from '../../mathjax.js';
import { STATE, newState } from '../../core/MathItem.js';
import { expandable } from '../../util/Options.js';
import { Menu } from './Menu.js';
import '../../a11y/speech/SpeechMenu.js';
newState('CONTEXT_MENU', 170);
export function MenuMathItemMixin(BaseMathItem) {
    return class extends BaseMathItem {
        addMenu(document, force = false) {
            if (this.state() >= STATE.CONTEXT_MENU)
                return;
            if (!this.isEscaped && (document.options.enableMenu || force)) {
                document.menu.addMenu(this);
            }
            this.state(STATE.CONTEXT_MENU);
        }
        getMenus(document) {
            document.menu.menu.store.sort();
        }
        checkLoading(document) {
            document.checkLoading();
        }
    };
}
export function MenuMathDocumentMixin(BaseDocument) {
    var _a;
    return _a = class extends BaseDocument {
            constructor(...args) {
                super(...args);
                this.menu = new this.options.MenuClass(this, this.options.menuOptions);
                const ProcessBits = this.constructor.ProcessBits;
                if (!ProcessBits.has('context-menu')) {
                    ProcessBits.allocate('context-menu');
                }
                this.options.MathItem = MenuMathItemMixin(this.options.MathItem);
                const settings = this.menu.settings;
                const options = this.options;
                const enrich = (options.enableEnrichment = settings.enrich);
                options.enableSpeech = settings.speech && enrich;
                options.enableBraille = settings.braille && enrich;
                options.enableComplexity = settings.collapsible && enrich;
                options.enableExplorer = enrich;
            }
            addMenu() {
                if (!this.processed.isSet('context-menu')) {
                    for (const math of this.math) {
                        math.addMenu(this);
                    }
                    this.processed.set('context-menu');
                }
                return this;
            }
            getMenus() {
                this.menu.menu.store.sort();
            }
            checkLoading() {
                let result = true;
                try {
                    this._checkLoading();
                    result = false;
                }
                catch (err) {
                    if (!err.retry) {
                        throw err;
                    }
                }
                return result;
            }
            _checkLoading() {
                if (this.menu.isLoading) {
                    mathjax.retryAfter(this.menu.loadingPromise.catch((err) => console.log(err)));
                }
                if (this.options.enableComplexity) {
                    this.menu.checkComponent('a11y/complexity');
                }
                if (this.options.enableExplorer) {
                    this.menu.checkComponent('a11y/explorer');
                }
                return this;
            }
            state(state, restore = false) {
                super.state(state, restore);
                if (state < STATE.CONTEXT_MENU) {
                    this.processed.clear('context-menu');
                }
                return this;
            }
        },
        _a.OPTIONS = Object.assign(Object.assign({ enableEnrichment: true, enableComplexity: true, enableSpeech: true, enableBraille: true, enableExplorer: true, enableExplorerHelp: true, enrichSpeech: 'none', enrichError: (_doc, _math, err) => console.warn('Enrichment Error:', err) }, BaseDocument.OPTIONS), { MenuClass: Menu, menuOptions: Menu.OPTIONS, enableMenu: true, sre: BaseDocument.OPTIONS.sre || expandable({}), a11y: BaseDocument.OPTIONS.a11y || expandable({}), renderActions: expandable(Object.assign(Object.assign({}, BaseDocument.OPTIONS.renderActions), { addMenu: [STATE.CONTEXT_MENU], getMenus: [STATE.INSERTED + 5, false], checkLoading: [
                    STATE.UNPROCESSED + 1,
                    (doc) => doc.checkLoading(),
                    '',
                    false,
                ] })) }),
        _a;
}
export function MenuHandler(handler) {
    handler.documentClass = MenuMathDocumentMixin(handler.documentClass);
    return handler;
}
//# sourceMappingURL=MenuHandler.js.map