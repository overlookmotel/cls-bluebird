/*
 * cls-bluebird tests
 * Tests for .spread()
 */

// Imports
var runTests = require('../support');

// Run tests

// TODO Tests for reject handler in bluebird v2
// TODO Intersect these two test sets - test all combinations of promise values and handler return values.
//      This will make it work like the collection method tests.
runTests('.spread()', function(u, Promise) {
    u.testSetStaticMethodReceivingValueReturnsPromise(function(value) {
        return Promise.resolve([value, value]).spread(function() {});
    });

    u.testSetProtoMethodAsyncHandler(function(p, handler) {
        return p.spread(handler);
    }, {noUndefined: true});
});
