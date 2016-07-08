/*
 * cls-bluebird tests
 * Utilities
 * Functions to run a set of tests relating to testing that callbacks run in CLS context.
 * Mixin to Utils prototype.
 */

/* global describe */

// Exports

module.exports = {
    /**
     * Run set of tests on a method to ensure callback is always run in correct CLS context.
     * Function `fn` should take provided `promise` and call the method being tested on it.
     * `fn` is called with a `promise` and a `handler` function which should be attached as the callback to the method under test.
     * e.g. `promise.then(handler)`
     *
     * If handler is being attached to catch rejections, `options.catches` should be `true`
     *
     * @param {Function} fn - Test function
     * @param {Object} options - Options object
     * @param {boolean} options.continues - true if handler fires on resolved promise
     * @returns {undefined}
     */
    testSetProtoCallbackContext: function(fn, options) {
        var u = this;

        var makePromise = options.continues ? u.resolveSyncMethod(u.Promise) : u.rejectSyncMethod(u.Promise);

        // TODO tests for attaching to promises which are resolved/rejected async?
        // TODO tests for attaching method to promise in next tick?
        // TODO would be better if promise was created outside of CLS context rather than inside
        describe('callback runs in context', function() {
            u.testRunContext(function(handler) {
                var p = makePromise();
                return fn(p, handler);
            });
        });
    }
};
