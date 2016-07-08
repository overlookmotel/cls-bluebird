/*
 * cls-bluebird tests
 * Utilities
 * Functions to run a set of tests relating to testing that callbacks have been bound to CLS context.
 * Mixin to Utils prototype.
 */

/* global describe */

// Exports

module.exports = {
    /**
     * Run set of tests on a method to ensure callback is always bound to CLS context.
     * Function `fn` should take provided `promise` and call the method being tested on it.
     * `fn` is called with a `promise` and a `handler` function which should be attached as the callback to the method under test.
     * e.g. `return promise.then(handler)`
     *
     * If handler is being attached to catch rejections, `options.catches` should be `true`
     *
     * @param {Function} fn - Test function
     * @param {Object} options - Options object
     * @param {boolean} options.continues - true if handler fires on resolved promise
     * @returns {undefined}
     */
    testSetProtoCallbackBound: function(fn, options) {
        var u = this;

        // TODO tests for attaching to promises which are resolved/rejected async?
        // TODO tests for attaching method to promise in next tick?
        // TODO would be better if promise was created outside of CLS context rather than inside
        var makePromise = options.continues ? u.resolveSyncMethod(u.Promise) : u.rejectSyncMethod(u.Promise);

        describe('binds callback', function() {
            u.testBound(function(handler) {
                var p = makePromise();
                return fn(p, handler);
            }, options.handler);
        });
    },

    /**
     * Run set of tests on a static method to ensure callback is never bound to CLS context.
     * Function `fn` should call the method being tested, attaching `handler` as the callback.
     * e.g. `return Promise.try(handler)`
     *
     * @param {Function} fn - Test function
     * @param {Object} [options] - Options object
     * @param {Function} [options.handler] - Optional handler function
     * @returns {undefined}
     */
    testSetStaticCallbackNotBound: function(fn, options) {
        var u = this;
        options = options || {};

        describe('does not bind callback', function() {
            u.testNotBound(function(handler) {
                return fn(handler);
            }, options.handler);
        });
    }
};
