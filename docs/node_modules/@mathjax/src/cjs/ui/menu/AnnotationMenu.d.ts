import { DynamicSubmenu } from './MJContextMenu.js';
type AnnotationTypes = {
    [type: string]: string[];
};
export declare function showAnnotations(box: () => void, types: AnnotationTypes, cache: [string, string][]): DynamicSubmenu;
export declare function copyAnnotations(cache: [string, string][]): DynamicSubmenu;
export declare let annotation: string;
export {};
