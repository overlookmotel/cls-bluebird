/*
 * cls-bluebird tests
 * Tests for Promise.resolve()
 */

/* global describe */

// Imports
var runTests = require('../support');

// Run tests

runTests('Promise.resolve()', function(Promise, u) {
    describe('always returns instance of patched Promise constructor when passed', function() {
        u.checkReturnsPromiseValue(function(value) {
            return Promise.resolve(value);
        });
    });
});
