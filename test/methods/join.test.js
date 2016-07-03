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

    u.testSetProtoMethodAsync(function(p, handler) {
        return Promise.join(p, p, p, handler);
    }, {noUndefined: true, noBindTest: true, noAsyncTest: true});

    // Check callback called sync/async
    describe('calls callback', function() {
        u.it('synchronously when promises are resolved', function(done, error) {
            u.checkSync(function(handler) {
                return Promise.join(Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), handler);
            }, done, error);
        });

        u.it('asynchronously when promises are pending', function(done, error) {
            u.checkAsync(function(handler) {
                return Promise.join(Promise.resolve(1), Promise.resolve(2).tap(function() {}), Promise.resolve(3), handler);
            }, done, error);
        });
    });

    // Checking binding for sync/async
    describe('callback binding', function() {
        // Check callback not bound when promises are resolved
        u.testSetCallbackNotBound(function(handler) {
            return Promise.join(Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), handler);
        }, {name: 'not performed when promises are resolved'});

        // Check callback is bound when promises are pending
        u.testSetCallbackBound(function(handler) {
            return Promise.join(Promise.resolve(1).tap(function() {}), Promise.resolve(2), Promise.resolve(3), handler);
        }, {name: 'is performed when promises are pending', asyncOnly: true});
    });
});
