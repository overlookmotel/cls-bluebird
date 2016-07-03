/*
 * cls-bluebird tests
 * Utilities
 * Functions to run a set of tests relating to testing that callbacks are run sync/async.
 * Mixin to Utils prototype.
 */

/* global describe */

// Exports

module.exports = {
    /**
     * Run set of tests on a method to ensure always calls callback asynchronously.
     * Function `fn` should take provided `promise` and call the method being tested on it.
     * `fn` is called with a `promise` and a `handler` function which should be attached as the callback to the method under test.
     * e.g. `promise.then(handler)`
     *
     * If handler is being attached to catch rejections, `options.catches` should be `true`
     *
     * @param {Function} fn - Test function
     * @param {Object} [options] - Options object
     * @param {boolean} [options.catches] - true if method catches rejected promises e.g. `promise.catch()`
     * @returns {undefined}
     */
    testSetCallbackAsync: function(fn, options) {
        var u = this;
        options = options || {};

        var makePromiseSync = options.catches ? u.rejectSyncMethod() : u.resolveSyncMethod(),
            makePromiseAsync = options.catches ? u.rejectAsyncMethod() : u.resolveAsyncMethod();

        describe('attached sync to', function() {
            u.it('settled promise', function(done, error) {
                var p = makePromiseSync();
                u.checkAsync(function(handler) {
                    return fn(p, handler);
                }, done, error);
            });

            u.it('pending promise', function(done, error) {
                var p = makePromiseAsync();
                u.checkAsync(function(handler) {
                    return fn(p, handler);
                }, done, error);
            });
        });

        describe('attached async to', function() {
            u.it('settled promise', function(done, error) {
                var p = makePromiseSync();
                u.suppressUnhandledRejections(p);
                u.awaitPromise(p, function() {
                    u.checkAsync(function(handler) {
                        return fn(p, handler);
                    }, done, error);
                });
            });

            u.it('pending promise', function(done, error) {
                var p = makePromiseAsync();
                u.suppressUnhandledRejections(p);
                u.awaitPromise(p, function() {
                    u.checkAsync(function(handler) {
                        return fn(p, handler);
                    }, done, error);
                });
            });
        });
    },

    /**
     * Run set of tests on a method to ensure always calls callback synchronously.
     * `fn` is called with a `handler` function which should be attached as the callback to the method under test.
     * e.g. `Promise.try(handler)`
     *
     * @param {Function} fn - Test function
     * @param {Object} [options] - Options object
     * @param {Function} [options.handler] - Optional handler function
     * @returns {undefined}
     */
    testSetCallbackSync: function(fn, options) {
        var u = this;
        options = options || {};

        u.it('calls callback synchronously', function(done, error) {
            u.checkSync(function(handler) {
                return fn(handler);
            }, done, error, options.handler);
        });
    }
};
