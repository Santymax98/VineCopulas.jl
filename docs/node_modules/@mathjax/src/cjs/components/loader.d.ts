import { MathJaxObject as MJObject, MathJaxLibrary, MathJaxConfig as MJConfig } from './global.js';
import { PackageReady, PackageFailed, PackageConfig } from './package.js';
import { FunctionList } from '../util/FunctionList.js';
export type PathFilterFunction = (data: {
    name: string;
    original: string;
    addExtension: boolean;
}) => boolean;
export type PathFilterList = (PathFilterFunction | [PathFilterFunction, number])[];
export interface MathJaxConfig extends MJConfig {
    loader?: {
        paths?: {
            [name: string]: string;
        };
        source?: {
            [name: string]: string;
        };
        dependencies?: {
            [name: string]: string[];
        };
        provides?: {
            [name: string]: string[];
        };
        load?: string[];
        ready?: PackageReady;
        failed?: PackageFailed;
        require?: (url: string) => any;
        pathFilters?: PathFilterList;
        versionWarnings?: boolean;
        [name: string]: any;
    };
}
export interface MathJaxObject extends MJObject {
    _: MathJaxLibrary;
    config: MathJaxConfig;
    loader: {
        ready: (...names: string[]) => Promise<string[]>;
        load: (...names: string[]) => Promise<string>;
        preLoaded: (...names: string[]) => void;
        defaultReady: () => void;
        getRoot: () => string;
        checkVersion: (name: string, version: string) => boolean;
        saveVersion: (name: string) => void;
        pathFilters: FunctionList;
        addPackageData: (name: string, data: PackageConfig) => void;
    };
    startup?: any;
}
export declare const PathFilters: {
    [name: string]: PathFilterFunction;
};
export declare const Loader: {
    versions: Map<string, string>;
    nestedLoads: Promise<any[]>[];
    ready(...names: string[]): Promise<string[]>;
    load(...names: string[]): Promise<any[]>;
    preLoaded(...names: string[]): void;
    addPackageData(name: string, data: PackageConfig): void;
    defaultReady(): void;
    getRoot(): string;
    checkVersion(name: string, version: string, _type?: string): boolean;
    saveVersion(name: string): void;
    pathFilters: FunctionList;
};
export declare const MathJax: MathJaxObject;
export declare const CONFIG: {
    [name: string]: any;
    paths?: {
        [name: string]: string;
    };
    source?: {
        [name: string]: string;
    };
    dependencies?: {
        [name: string]: string[];
    };
    provides?: {
        [name: string]: string[];
    };
    load?: string[];
    ready?: PackageReady;
    failed?: PackageFailed;
    require?: (url: string) => any;
    pathFilters?: PathFilterList;
    versionWarnings?: boolean;
};
