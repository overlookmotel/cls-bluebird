/*
 * cls-bluebird tests
 * Tests for .join()
 */

/* global describe */

// Imports
var runTests = require('../support');

// Run tests

runTests('.join()', function(u, Promise) {
    describe('returns instance of patched Promise constructor when resolving values are', function() {
        u.testSetValueReturnsPromise(function(value) {
            return Promise.join(value, value, value);
        });
    });

    /*
     * NB Due to oddity in bluebird https://github.com/petkaantonov/bluebird/issues/1153
     * `Promise.join()` calls the callback synchronously if input is only values or
     * resolved promises, but async if any promises are pending.
     * So async calling test is performed separately to allow for this.
     * TODO Change test once issue is fixed (if it is considered a bug).
     */
    u.testSetProtoMethodAsync(function(p, handler) {
        return Promise.join(p, p, p, handler);
    }, {noUndefined: true, noAsyncTest: true});

    // Check callback called sync/async
    describe('calls callback', function() {
        u.test('synchronously when promises are resolved', function(t) {
            u.checkSync(function(handler) {
                return Promise.join(Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), handler);
            }, t);
        });

        u.test('asynchronously when promises are pending', function(t) {
            u.checkAsync(function(handler) {
                return Promise.join(Promise.resolve(1), Promise.resolve(2).tap(function() {}), Promise.resolve(3), handler);
            }, t);
        });
    });
});
