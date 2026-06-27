export function handleRetriesFor(code) {
    return new Promise(function run(ok, fail) {
        const handleRetry = (err) => {
            var _a;
            if (err.retry instanceof Promise) {
                err.retry.then(() => run(ok, fail)).catch((e) => fail(e));
            }
            else if ((_a = err.restart) === null || _a === void 0 ? void 0 : _a.isCallback) {
                MathJax.Callback.After(() => run(ok, fail), err.restart);
            }
            else {
                fail(err);
            }
        };
        try {
            const result = code();
            if (result instanceof Promise) {
                result.then((value) => ok(value)).catch((err) => handleRetry(err));
            }
            else {
                ok(result);
            }
        }
        catch (err) {
            handleRetry(err);
        }
    });
}
export function retryAfter(promise) {
    const err = new Error('MathJax retry -- an asynchronous action is required; ' +
        'try using one of the promise-based functions and await its resolution.');
    err.retry = promise;
    throw err;
}
//# sourceMappingURL=Retries.js.map