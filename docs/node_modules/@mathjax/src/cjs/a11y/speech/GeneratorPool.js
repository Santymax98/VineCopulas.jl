"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratorPool = void 0;
var SpeechUtil_js_1 = require("../speech/SpeechUtil.js");
var GeneratorPool = (function () {
    function GeneratorPool() {
        this.promise = Promise.resolve();
        this.adaptor = null;
        this._options = {};
        this._init = false;
    }
    Object.defineProperty(GeneratorPool.prototype, "element", {
        get: function () {
            return this._element;
        },
        set: function (element) {
            this._element = element;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeneratorPool.prototype, "options", {
        get: function () {
            return this._options;
        },
        set: function (options) {
            this._options = Object.assign({}, (options === null || options === void 0 ? void 0 : options.sre) || {}, {
                enableSpeech: options.enableSpeech,
                enableBraille: options.enableBraille,
            });
            delete this._options.custom;
        },
        enumerable: false,
        configurable: true
    });
    GeneratorPool.prototype.init = function (options, adaptor, webworker) {
        this.options = options;
        if (this._init)
            return;
        this.adaptor = adaptor;
        this.webworker = webworker;
        this._init = true;
    };
    GeneratorPool.prototype.update = function (options) {
        Object.assign(this.options, options);
    };
    GeneratorPool.prototype.Speech = function (item) {
        var mml = item.outputData.mml;
        var options = Object.assign({}, this.options, { modality: 'speech' });
        return (this.promise = this.webworker.Speech(mml, options, item));
    };
    GeneratorPool.prototype.SpeechFor = function (item, mml) {
        var options = Object.assign({}, this.options, { modality: 'speech' });
        return this.webworker.speechFor(mml, options, item);
    };
    GeneratorPool.prototype.cancel = function (item) {
        var _a;
        (_a = this.webworker) === null || _a === void 0 ? void 0 : _a.Cancel(item);
    };
    GeneratorPool.prototype.updateRegions = function (node, speechRegion, brailleRegion) {
        speechRegion.Update(this.getLabel(node));
        brailleRegion.Update(this.getBraille(node));
    };
    GeneratorPool.prototype.getOptions = function (node) {
        var _a, _b, _c, _d;
        return {
            locale: (_a = this.adaptor.getAttribute(node, 'data-semantic-locale')) !== null && _a !== void 0 ? _a : '',
            domain: (_b = this.adaptor.getAttribute(node, 'data-semantic-domain')) !== null && _b !== void 0 ? _b : '',
            style: (_c = this.adaptor.getAttribute(node, 'data-semantic-style')) !== null && _c !== void 0 ? _c : '',
            domain2style: (_d = this.adaptor.getAttribute(node, 'data-semantic-domain2style')) !== null && _d !== void 0 ? _d : '',
        };
    };
    GeneratorPool.prototype.nextRules = function (item) {
        var options = this.getOptions(item.typesetRoot);
        this.update(options);
        return (this.promise = this.webworker.nextRules(item.outputData.mml, Object.assign({}, this.options, { modality: 'speech' }), item));
    };
    GeneratorPool.prototype.nextStyle = function (node, item) {
        var options = this.getOptions(item.typesetRoot);
        this.update(options);
        return (this.promise = this.webworker.nextStyle(item.outputData.mml, Object.assign({}, this.options, { modality: 'speech' }), this.adaptor.getAttribute(node, 'data-semantic-id'), item));
    };
    GeneratorPool.prototype.getLabel = function (node, _center, sep) {
        if (_center === void 0) { _center = ''; }
        if (sep === void 0) { sep = ' '; }
        var adaptor = this.adaptor;
        return ((0, SpeechUtil_js_1.buildLabel)(adaptor.getAttribute(node, SpeechUtil_js_1.SemAttr.SPEECH_SSML), adaptor.getAttribute(node, SpeechUtil_js_1.SemAttr.PREFIX_SSML), adaptor.getAttribute(node, SpeechUtil_js_1.SemAttr.POSTFIX_SSML), sep) || adaptor.getAttribute(node, 'aria-label'));
    };
    GeneratorPool.prototype.getBraille = function (node) {
        var adaptor = this.adaptor;
        return (adaptor.getAttribute(node, 'aria-braillelabel') ||
            adaptor.getAttribute(node, SpeechUtil_js_1.SemAttr.BRAILLE));
    };
    GeneratorPool.prototype.getLocalePreferences = function (prefs) {
        return (this.promise = this.webworker.clearspeakLocalePreferences(this.options, prefs));
    };
    GeneratorPool.prototype.getRelevantPreferences = function (item, semantic, prefs, counter) {
        var mml = item.outputData.mml;
        return (this.promise = this.webworker.clearspeakRelevantPreferences(mml, semantic, prefs, counter));
    };
    return GeneratorPool;
}());
exports.GeneratorPool = GeneratorPool;
//# sourceMappingURL=GeneratorPool.js.map