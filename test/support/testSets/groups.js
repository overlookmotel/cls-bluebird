/*
 * cls-bluebird tests
 * Utilities
 * Functions to run a set of tests.
 * Mixin to Utils prototype.
 */

/* global describe */

// Modules
var _ = require('lodash');

// Exports

module.exports = {
    /**
     * Run set of tests on a static method to ensure:
     *   - always returns a Promise which is instance of patched Promise constructor
     *   - callback is called synchronously
     *   - callback is never bound to CLS context
     *
     * `fn` is called with a `handler` function which should be attached as the callback to the method under test.
     * `fn` should return the resulting promise.
     * e.g. `return Promise.try(handler)`
     *
     * @param {Function} fn - Test function
     * @returns {undefined}
     */
    testSetStaticMethodSync: function(fn) {
        var u = this;
        u.testSetStaticMethodReturnsPromise(fn);
        u.testSetCallbackSync(fn);
        u.testSetCallbackNotBound(fn);
    },

    /**
     * Run set of tests on a prototype method to ensure:
     *   - always returns a Promise which is instance of patched Promise constructor
     *   - callback is called asynchronously
     *   - callback is bound to CLS context
     *
     * `fn` is called with a `promise` and a `handler` function.
     * `fn` should:
     *   - call the method under test on `promise` with `handler` as callback
     *   - return the resulting promise.
     * e.g. `return Promise.try(handler)`
     *
     * @param {Function} fn - Test function
     * @param {Object} [options] - Options object
     * @param {boolean} [options.continues] - true if handler fires on resolved promise (default `!options.catches`)
     * @param {boolean} [options.catches] - true if handler fires on rejected promise (default `false`)
     * @param {boolean} [options.passThrough] - true if method passes through errors even if handler fires (default `false`)
     * @param {boolean} [options.noBind] - Skip handler bound test if true (default `false`)
     * @returns {undefined}
     */
    testSetProtoMethodAsync: function(fn, options) {
        var u = this;

        // Conform options
        options = _.extend({catches: false, passThrough: false}, options);
        _.defaults(options, {continues: !options.catches});

        // Run tests
        describe('returns instance of patched Promise constructor when handler', function() {
            u.testSetProtoMethodReturnsPromise(fn, options);
        });

        describe('calls callback asynchronously when handler', function() {
            u.testSetCallbackAsync(fn, options);
        });

        if (!options.noBind) u.testSetProtoCallbackBound(fn, options);

        u.testSetProtoCallbackContext(fn, options);
    }
};
