export declare const hasWindow: boolean;
export declare const context: {
    window: Window & typeof globalThis;
    document: Document;
    os: string;
    path: (file: string) => string;
};
