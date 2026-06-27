import * as Sre from '../sre.js';
const ProsodyKeys = ['pitch', 'rate', 'volume'];
export function ssmlParsing(speech) {
    const xml = Sre.parseDOM(speech);
    const instr = [];
    const text = [];
    recurseSsml(Array.from(xml.childNodes), instr, text);
    return [text.join(' '), instr];
}
function recurseSsml(nodes, instr, text, prosody = {}) {
    for (const node of nodes) {
        if (node.nodeType === 3) {
            const content = node.textContent.trim();
            if (content) {
                text.push(content);
                instr.push(Object.assign({ text: content }, prosody));
            }
            continue;
        }
        if (node.nodeType === 1) {
            const element = node;
            const tag = element.tagName;
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
                    const txt = element.textContent;
                    instr.push(Object.assign({ text: txt, character: true }, prosody));
                    text.push(txt);
                    break;
                }
            }
        }
    }
}
const combinePros = {
    pitch: (x, _sign) => 1 * (x / 100),
    volume: (x, _sign) => 0.5 * (x / 100),
    rate: (x, _sign) => 1 * (x / 100),
};
function getProsody(element, prosody) {
    const combine = {};
    for (const pros of ProsodyKeys) {
        if (element.hasAttribute(pros)) {
            const [sign, value] = extractProsody(element.getAttribute(pros));
            if (!sign) {
                combine[pros] = pros === 'volume' ? 0.5 : 1;
                continue;
            }
            let orig = prosody[pros];
            orig = orig ? orig : pros === 'volume' ? 0.5 : 1;
            const relative = combinePros[pros](parseInt(value, 10), sign);
            combine[pros] = sign === '-' ? orig - relative : orig + relative;
        }
    }
    return combine;
}
const prosodyRegexp = /([+-]?)([0-9]+)%/;
function extractProsody(attr) {
    const match = attr.match(prosodyRegexp);
    if (!match) {
        console.warn('Something went wrong with the prosody matching.');
        return ['', '100'];
    }
    return [match[1], match[2]];
}
export function buildLabel(speech, prefix, postfix, sep = ' ') {
    if (!speech) {
        return '';
    }
    const label = [speech];
    if (prefix) {
        label.unshift(prefix);
    }
    if (postfix) {
        label.push(postfix);
    }
    return label.join(sep);
}
export function buildSpeech(speech, locale = 'en', rate = '100') {
    return ssmlParsing('<?xml version="1.0"?><speak version="1.1"' +
        ' xmlns="http://www.w3.org/2001/10/synthesis"' +
        ` xml:lang="${locale}">` +
        `<prosody rate="${rate}%">${speech}` +
        '</prosody></speak>');
}
export function honk() {
    const ac = new AudioContext();
    const os = ac.createOscillator();
    os.frequency.value = 300;
    os.connect(ac.destination);
    os.start(ac.currentTime);
    os.stop(ac.currentTime + 0.05);
}
export var InPlace;
(function (InPlace) {
    InPlace[InPlace["NONE"] = 0] = "NONE";
    InPlace[InPlace["DEPTH"] = 1] = "DEPTH";
    InPlace[InPlace["SUMMARY"] = 2] = "SUMMARY";
})(InPlace || (InPlace = {}));
export var SemAttr;
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
})(SemAttr || (SemAttr = {}));
//# sourceMappingURL=SpeechUtil.js.map