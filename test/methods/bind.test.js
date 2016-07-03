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
        u.it('object', function(done, error) {
            var p = Promise.bind({});
            error(u.returnErrIfNotPromise(p));
            done(p);
        });
    });
});

runTests('.bind()', function(u, Promise) {
    describe('returns instance of patched Promise constructor when passed', function() {
        u.it('object', function(done, error) {
            var p = Promise.resolve().bind({});
            error(u.returnErrIfNotPromise(p));
            done(p);
        });
    });
});
