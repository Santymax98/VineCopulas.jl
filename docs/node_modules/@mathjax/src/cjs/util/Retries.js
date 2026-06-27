"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRetriesFor = handleRetriesFor;
exports.retryAfter = retryAfter;
function handleRetriesFor(code) {
    return new Promise(function run(ok, fail) {
        var handleRetry = function (err) {
            var _a;
            if (err.retry instanceof Promise) {
                err.retry.then(function () { return run(ok, fail); }).catch(function (e) { return fail(e); });
            }
            else if ((_a = err.restart) === null || _a === void 0 ? void 0 : _a.isCallback) {
                MathJax.Callback.After(function () { return run(ok, fail); }, err.restart);
            }
            else {
                fail(err);
            }
        };
        try {
            var result = code();
            if (result instanceof Promise) {
                result.then(function (value) { return ok(value); }).catch(function (err) { return handleRetry(err); });
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
function retryAfter(promise) {
    var err = new Error('MathJax retry -- an asynchronous action is required; ' +
        'try using one of the promise-based functions and await its resolution.');
    err.retry = promise;
    throw err;
}
//# sourceMappingURL=Retries.js.map