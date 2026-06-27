export interface RetryError extends Error {
    retry: Promise<any>;
}
export declare function handleRetriesFor(code: () => any): Promise<any>;
export declare function retryAfter(promise: Promise<any>): void;
