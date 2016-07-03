/*
 * cls-bluebird tests
 * Tests for Promise.resolve()
 */

/* global describe, it */

// Modules
var expect = require('chai').expect;

// Imports
var runTests = require('../support');

// Run tests

runTests('Promise.resolve()', function(u, Promise) {
    describe('returns instance of patched Promise constructor when passed', function() {
        u.testSetValueReturnsPromise(function(value) {
            return Promise.resolve(value);
        });
    });
});

runTests('Promise.fulfilled()', function(u, Promise) { // jshint ignore:line
    it('is alias of Promise.resolve()', function() {
        expect(Promise.fulfilled).to.equal(Promise.resolve);
    });
});

runTests('Promise.cast()', function(u, Promise) { // jshint ignore:line
    it('is alias of Promise.resolve()', function() {
        expect(Promise.cast).to.equal(Promise.resolve);
    });
});
