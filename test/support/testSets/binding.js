/*
 * cls-bluebird tests
 * Utilities
 * Functions to run a set of tests relating to testing that callbacks have been bound to CLS context.
 * Mixin to Utils prototype.
 */

// Exports

module.exports = {
    /**
     * Run set of tests on a method to ensure callback is always bound to CLS context.
     * Function `fn` should call the method being tested on it.
     * `fn` is called with a `handler` function which should be attached as the callback to the method under test.
     * e.g. `return Promise.join(Promise.resolve().then(function() {}), handler)`
     *
     * @param {Function} fn - Test function
     * @param {Object} [options] - Options object
     * @param {boolean} [options.name] - Test name
     * @param {boolean} [options.asyncOnly] - Test for binding in handler only, not that it was bound immediately
     * @returns {undefined}
     */
    testSetCallbackBound: function(fn, options) {
        var u = this;
        options = options || {};

        u.it(options.name || 'binds callback', function(done, error) {
            u.runInContext(function(context) {
                u.checkBound(function(handler) {
                    return fn(handler);
                }, context, done, error, {asyncOnly: options.asyncOnly});
            });
        });
    },

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
     * @param {boolean} [options.name] - Test name
     * @returns {undefined}
     */
    testSetProtoCallbackBound: function(fn, options) {
        var u = this;

        var makePromise = options.continues ? u.resolveSyncMethod() : u.rejectSyncMethod();

        u.it(options.name || 'binds callback', function(done, error) {
            var p = makePromise();
            u.runInContext(function(context) {
                u.checkBound(function(handler) {
                    return fn(p, handler);
                }, context, done, error);
            });
        });
    },

    /**
     * Run set of tests on a method to ensure callback is never bound to CLS context.
     * `fn` is called with a `handler` function which should be attached as the callback to the method under test.
     * e.g. `return Promise.try(handler)`
     *
     * @param {Function} fn - Test function
     * @param {Object} [options] - Options object
     * @param {Function} [options.handler] - Optional handler function
     * @param {boolean} [options.name] - Test name
     * @returns {undefined}
     */
    testSetCallbackNotBound: function(fn, options) {
        var u = this;
        options = options || {};

        u.it(options.name || 'does not bind callback', function(done, error) {
            u.checkNotBound(function(handler) {
                return fn(handler);
            }, done, error, options.handler);
        });
    },

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

        var makePromise = options.continues ? u.resolveSyncMethod() : u.rejectSyncMethod();

        u.itMultiple('callback runs in context', function(done, error) {
            var p = makePromise();
            u.runInContext(function(context) {
                u.checkRunContext(function(handler) {
                    return fn(p, handler);
                }, context, done, error);
            });
        });
    }
};
