"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemAttr = exports.InPlace = void 0;
exports.ssmlParsing = ssmlParsing;
exports.buildLabel = buildLabel;
exports.buildSpeech = buildSpeech;
exports.honk = honk;
var Sre = __importStar(require("../sre.js"));
var ProsodyKeys = ['pitch', 'rate', 'volume'];
function ssmlParsing(speech) {
    var xml = Sre.parseDOM(speech);
    var instr = [];
    var text = [];
    recurseSsml(Array.from(xml.childNodes), instr, text);
    return [text.join(' '), instr];
}
function recurseSsml(nodes, instr, text, prosody) {
    var e_1, _a;
    if (prosody === void 0) { prosody = {}; }
    try {
        for (var nodes_1 = __values(nodes), nodes_1_1 = nodes_1.next(); !nodes_1_1.done; nodes_1_1 = nodes_1.next()) {
            var node = nodes_1_1.value;
            if (node.nodeType === 3) {
                var content = node.textContent.trim();
                if (content) {
                    text.push(content);
                    instr.push(Object.assign({ text: content }, prosody));
                }
                continue;
            }
            if (node.nodeType === 1) {
                var element = node;
                var tag = element.tagName;
                if (tag === 'speak') {
                    continue;
                }
                if (tag === 'prosody') {
                    recurseSsml(Array.from(node.childNodes), instr, text, getProsody(element, prosody));
                    continue;
                }
                switch (tag) {
                    case 'break':
                        instr.push({ pause: element.getAttribute('time') });
                        break;
                    case 'mark':
                        instr.push({ mark: element.getAttribute('name') });
                        break;
                    case 'say-as': {
                        var txt = element.textContent;
                        instr.push(Object.assign({ text: txt, character: true }, prosody));
                        text.push(txt);
                        break;
                    }
                }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (nodes_1_1 && !nodes_1_1.done && (_a = nodes_1.return)) _a.call(nodes_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
var combinePros = {
    pitch: function (x, _sign) { return 1 * (x / 100); },
    volume: function (x, _sign) { return 0.5 * (x / 100); },
    rate: function (x, _sign) { return 1 * (x / 100); },
};
function getProsody(element, prosody) {
    var e_2, _a;
    var combine = {};
    try {
        for (var ProsodyKeys_1 = __values(ProsodyKeys), ProsodyKeys_1_1 = ProsodyKeys_1.next(); !ProsodyKeys_1_1.done; ProsodyKeys_1_1 = ProsodyKeys_1.next()) {
            var pros = ProsodyKeys_1_1.value;
            if (element.hasAttribute(pros)) {
                var _b = __read(extractProsody(element.getAttribute(pros)), 2), sign = _b[0], value = _b[1];
                if (!sign) {
                    combine[pros] = pros === 'volume' ? 0.5 : 1;
                    continue;
                }
                var orig = prosody[pros];
                orig = orig ? orig : pros === 'volume' ? 0.5 : 1;
                var relative = combinePros[pros](parseInt(value, 10), sign);
                combine[pros] = sign === '-' ? orig - relative : orig + relative;
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (ProsodyKeys_1_1 && !ProsodyKeys_1_1.done && (_a = ProsodyKeys_1.return)) _a.call(ProsodyKeys_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return combine;
}
var prosodyRegexp = /([+-]?)([0-9]+)%/;
function extractProsody(attr) {
    var match = attr.match(prosodyRegexp);
    if (!match) {
        console.warn('Something went wrong with the prosody matching.');
        return ['', '100'];
    }
    return [match[1], match[2]];
}
function buildLabel(speech, prefix, postfix, sep) {
    if (sep === void 0) { sep = ' '; }
    if (!speech) {
        return '';
    }
    var label = [speech];
    if (prefix) {
        label.unshift(prefix);
    }
    if (postfix) {
        label.push(postfix);
    }
    return label.join(sep);
}
function buildSpeech(speech, locale, rate) {
    if (locale === void 0) { locale = 'en'; }
    if (rate === void 0) { rate = '100'; }
    return ssmlParsing('<?xml version="1.0"?><speak version="1.1"' +
        ' xmlns="http://www.w3.org/2001/10/synthesis"' +
        " xml:lang=\"".concat(locale, "\">") +
        "<prosody rate=\"".concat(rate, "%\">").concat(speech) +
        '</prosody></speak>');
}
function honk() {
    var ac = new AudioContext();
    var os = ac.createOscillator();
    os.frequency.value = 300;
    os.connect(ac.destination);
    os.start(ac.currentTime);
    os.stop(ac.currentTime + 0.05);
}
var InPlace;
(function (InPlace) {
    InPlace[InPlace["NONE"] = 0] = "NONE";
    InPlace[InPlace["DEPTH"] = 1] = "DEPTH";
    InPlace[InPlace["SUMMARY"] = 2] = "SUMMARY";
})(InPlace || (exports.InPlace = InPlace = {}));
var SemAttr;
(function (SemAttr) {
    SemAttr["SPEECH"] = "data-semantic-speech-none";
    SemAttr["SPEECH_SSML"] = "data-semantic-speech";
    SemAttr["SUMMARY"] = "data-semantic-summary-none";
    SemAttr["SUMMARY_SSML"] = "data-semantic-summary";
    SemAttr["PREFIX"] = "data-semantic-prefix-none";
    SemAttr["PREFIX_SSML"] = "data-semantic-prefix";
    SemAttr["POSTFIX"] = "data-semantic-postfix-none";
    SemAttr["POSTFIX_SSML"] = "data-semantic-postfix";
    SemAttr["BRAILLE"] = "data-semantic-braille";
})(SemAttr || (exports.SemAttr = SemAttr = {}));
//# sourceMappingURL=SpeechUtil.js.map