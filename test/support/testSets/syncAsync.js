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
     * @param {Object} options - Options object
     * @param {boolean} options.continues - true if handler fires on resolved promise
     * @param {boolean} options.catches - true if handler fires on rejected promise
     * @param {boolean} options.passThrough - true if method passes through errors even if handler fires
     * @returns {undefined}
     */
    testSetCallbackAsync: function(fn, options) {
        var u = this;

        describe('attached sync to', function() {
            testSet(false);
        });

        describe('attached async to', function() {
            testSet(true);
        });

        function testSet(attachAsync) {
            if (options.continues) {
                test(u.resolveSyncMethod(), false, false, attachAsync);
                test(u.resolveAsyncMethod(), true, false, attachAsync);
            }

            if (options.catches) {
                test(u.rejectSyncMethod(), false, true, attachAsync);
                test(u.rejectAsyncMethod(), true, true, attachAsync);
            }
        }

        function test(makePromise, pending, rejects, attachAsync) {
            u.test((pending ? 'pending ' : '') + (rejects ? 'rejected' : 'resolved') + ' promise', function(t) {
                var p = makePromise();

                u.execAsyncIf(function() {
                    u.checkAsync(function(handler) {
                        var newP = fn(p, handler);
                        if (options.passThrough) u.inheritRejectStatus(newP, p);
                        return newP;
                    }, t);
                }, attachAsync, p);
            });
        }
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

        u.test('calls callback synchronously', function(t) {
            u.checkSync(function(handler) {
                return fn(handler);
            }, t, options.handler);
        });
    }
};
