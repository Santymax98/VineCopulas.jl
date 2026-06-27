import { ChtmlCharMap } from './FontData.js';
export declare function AddFontIds(ranges: {
    [variant: string]: {
        [id: string]: ChtmlCharMap;
    };
}, prefix?: string): {
    [variant: string]: ChtmlCharMap;
};
