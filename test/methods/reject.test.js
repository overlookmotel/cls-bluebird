/*
 * cls-bluebird tests
 * Tests for Promise.reject()
 */

/* global describe, it */

// Imports
var runTests = require('../support');

// Run tests

runTests('Promise.reject()', function(Promise, u) {
    describe('always returns instance of patched Promise constructor when passed', function() {
        it('literal value', function(done) {
            var err = u.makeError();
            var p = Promise.reject(err);
            u.throwIfNotPromise(p);
            u.addCatch(p, err, done);
        });
    });
});
