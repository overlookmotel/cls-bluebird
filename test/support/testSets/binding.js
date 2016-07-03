/*
 * cls-bluebird tests
 * Utilities
 * Functions to run a set of tests relating to testing that callbacks have been bound to CLS context.
 * Mixin to Utils prototype.
 */

/* global it */

// Exports

module.exports = {
    /**
     * Run set of tests on a method to ensure callback is always bound to CLS context.
     * Function `fn` should take provided `promise` and call the method being tested on it.
     * `fn` is called with a `promise` and a `handler` function which should be attached as the callback to the method under test.
     * e.g. `promise.then(handler)`
     *
     * If handler is being attached to catch rejections, `options.catches` should be `true`
     *
     * @param {Function} fn - Test function
     * @param {Object} [options] - Options object
     * @param {boolean} [options.catches] - true if method catches rejected promises e.g. `promise.catch()`
     * @param {string} [options.name] - Name of test ('binds callback' if not provided)
     * @returns {undefined}
     */
    testSetCallbackBound: function(fn, options) {
        var u = this;
        options = options || {};

        var makePromise = options.catches ? u.rejectSyncMethod() : u.resolveSyncMethod();

        it(options.name || 'binds callback', function(done) {
            var p = makePromise();
            u.runInContext(function(context) {
                u.checkBound(function(handler) {
                    fn(p, handler);
                }, context, done);
            });
        });
    }
};
