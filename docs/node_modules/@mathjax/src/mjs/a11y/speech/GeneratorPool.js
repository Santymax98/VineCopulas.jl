import { buildLabel, SemAttr } from '../speech/SpeechUtil.js';
export class GeneratorPool {
    constructor() {
        this.promise = Promise.resolve();
        this.adaptor = null;
        this._options = {};
        this._init = false;
    }
    set element(element) {
        this._element = element;
    }
    get element() {
        return this._element;
    }
    set options(options) {
        this._options = Object.assign({}, (options === null || options === void 0 ? void 0 : options.sre) || {}, {
            enableSpeech: options.enableSpeech,
            enableBraille: options.enableBraille,
        });
        delete this._options.custom;
    }
    get options() {
        return this._options;
    }
    init(options, adaptor, webworker) {
        this.options = options;
        if (this._init)
            return;
        this.adaptor = adaptor;
        this.webworker = webworker;
        this._init = true;
    }
    update(options) {
        Object.assign(this.options, options);
    }
    Speech(item) {
        const mml = item.outputData.mml;
        const options = Object.assign({}, this.options, { modality: 'speech' });
        return (this.promise = this.webworker.Speech(mml, options, item));
    }
    SpeechFor(item, mml) {
        const options = Object.assign({}, this.options, { modality: 'speech' });
        return this.webworker.speechFor(mml, options, item);
    }
    cancel(item) {
        var _a;
        (_a = this.webworker) === null || _a === void 0 ? void 0 : _a.Cancel(item);
    }
    updateRegions(node, speechRegion, brailleRegion) {
        speechRegion.Update(this.getLabel(node));
        brailleRegion.Update(this.getBraille(node));
    }
    getOptions(node) {
        var _a, _b, _c, _d;
        return {
            locale: (_a = this.adaptor.getAttribute(node, 'data-semantic-locale')) !== null && _a !== void 0 ? _a : '',
            domain: (_b = this.adaptor.getAttribute(node, 'data-semantic-domain')) !== null && _b !== void 0 ? _b : '',
            style: (_c = this.adaptor.getAttribute(node, 'data-semantic-style')) !== null && _c !== void 0 ? _c : '',
            domain2style: (_d = this.adaptor.getAttribute(node, 'data-semantic-domain2style')) !== null && _d !== void 0 ? _d : '',
        };
    }
    nextRules(item) {
        const options = this.getOptions(item.typesetRoot);
        this.update(options);
        return (this.promise = this.webworker.nextRules(item.outputData.mml, Object.assign({}, this.options, { modality: 'speech' }), item));
    }
    nextStyle(node, item) {
        const options = this.getOptions(item.typesetRoot);
        this.update(options);
        return (this.promise = this.webworker.nextStyle(item.outputData.mml, Object.assign({}, this.options, { modality: 'speech' }), this.adaptor.getAttribute(node, 'data-semantic-id'), item));
    }
    getLabel(node, _center = '', sep = ' ') {
        const adaptor = this.adaptor;
        return (buildLabel(adaptor.getAttribute(node, SemAttr.SPEECH_SSML), adaptor.getAttribute(node, SemAttr.PREFIX_SSML), adaptor.getAttribute(node, SemAttr.POSTFIX_SSML), sep) || adaptor.getAttribute(node, 'aria-label'));
    }
    getBraille(node) {
        const adaptor = this.adaptor;
        return (adaptor.getAttribute(node, 'aria-braillelabel') ||
            adaptor.getAttribute(node, SemAttr.BRAILLE));
    }
    getLocalePreferences(prefs) {
        return (this.promise = this.webworker.clearspeakLocalePreferences(this.options, prefs));
    }
    getRelevantPreferences(item, semantic, prefs, counter) {
        const mml = item.outputData.mml;
        return (this.promise = this.webworker.clearspeakRelevantPreferences(mml, semantic, prefs, counter));
    }
}
//# sourceMappingURL=GeneratorPool.js.map