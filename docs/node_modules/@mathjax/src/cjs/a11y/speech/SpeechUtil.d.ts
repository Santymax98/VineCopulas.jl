interface ProsodyElement {
    [propName: string]: string | boolean | number;
    pitch?: number;
    rate?: number;
    volume?: number;
}
export interface SsmlElement extends ProsodyElement {
    pause?: string;
    text?: string;
    mark?: string;
    character?: boolean;
    kind?: string;
}
export declare function ssmlParsing(speech: string): [string, SsmlElement[]];
export declare function buildLabel(speech: string, prefix: string, postfix: string, sep?: string): string;
export declare function buildSpeech(speech: string, locale?: string, rate?: string): [string, SsmlElement[]];
export declare function honk(): void;
export declare enum InPlace {
    NONE = 0,
    DEPTH = 1,
    SUMMARY = 2
}
export declare enum SemAttr {
    SPEECH = "data-semantic-speech-none",
    SPEECH_SSML = "data-semantic-speech",
    SUMMARY = "data-semantic-summary-none",
    SUMMARY_SSML = "data-semantic-summary",
    PREFIX = "data-semantic-prefix-none",
    PREFIX_SSML = "data-semantic-prefix",
    POSTFIX = "data-semantic-postfix-none",
    POSTFIX_SSML = "data-semantic-postfix",
    BRAILLE = "data-semantic-braille"
}
export {};
