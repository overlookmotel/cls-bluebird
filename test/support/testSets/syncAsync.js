/*
 * cls-bluebird tests
 * Utilities
 * Functions to run a set of tests relating to testing that callbacks are run sync/async.
 * Mixin to Utils prototype.
 */

/* global describe, it */

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
            it('settled promise', function(done) {
                var p = makePromiseSync();
                u.checkAsync(function(handler) {
                    fn(p, handler);
                }, done);
            });

            it('pending promise', function(done) {
                var p = makePromiseAsync();
                u.checkAsync(function(handler) {
                    fn(p, handler);
                }, done);
            });
        });

        describe('attached async to', function() {
            it('settled promise', function(done) {
                var p = makePromiseSync();
                u.suppressUnhandledRejections(p);
                setImmediate(function() {
                    u.checkAsync(function(handler) {
                        fn(p, handler);
                    }, done);
                });
            });

            it('pending promise', function(done) {
                var p = makePromiseAsync();
                u.suppressUnhandledRejections(p);
                setImmediate(function() {
                    u.checkAsync(function(handler) {
                        fn(p, handler);
                    }, done);
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
     * @returns {undefined}
     */
    testSetCallbackSync: function(fn) {
        var u = this;
        it('calls callback synchronously', function(done) {
            u.checkSync(function(handler) {
                fn(handler);
            }, done);
        });
    }
};
