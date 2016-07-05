/*
 * cls-bluebird tests
 * Tests for Promise.bind() / .bind()
 */

/* global describe */

// Imports
var runTests = require('../support');

// Run tests

runTests('Promise.bind()', function(u, Promise) {
    describe('returns instance of patched Promise constructor when passed', function() {
        u.test('object', function(t) {
            var p = Promise.bind({});
            t.error(u.returnErrIfNotPromise(p));
            t.done(p);
        });
    });
});

runTests('.bind()', function(u, Promise) {
    describe('returns instance of patched Promise constructor when passed', function() {
        u.test('object', function(t) {
            var p = Promise.resolve().bind({});
            t.error(u.returnErrIfNotPromise(p));
            t.done(p);
        });
    });
});
