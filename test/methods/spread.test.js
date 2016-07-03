/*
 * cls-bluebird tests
 * Tests for .spread()
 */

/* global describe */

// Imports
var runTests = require('../support');

// Run tests

// TODO tests for reject handler in bluebird v2
runTests('.spread()', function(u, Promise) {
    describe('returns instance of patched Promise constructor when passed array containing', function() {
        u.testSetValueReturnsPromise(function(value) {
            return Promise.resolve([value, value]).spread(function() {});
        });
    });

    u.testSetProtoMethodAsync(function(p, handler) {
        return p.spread(handler);
    }, {noUndefined: true});
});
