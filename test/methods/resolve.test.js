/*
 * cls-bluebird tests
 * Tests for Promise.resolve()
 */

/* global describe */

// Imports
var runTests = require('../support');

// Run tests

runTests('Promise.resolve()', function(Promise, u) {
    describe('returns instance of patched Promise constructor when passed', function() {
        u.testSetValueReturnsPromise(function(value) {
            return Promise.resolve(value);
        });
    });
});
