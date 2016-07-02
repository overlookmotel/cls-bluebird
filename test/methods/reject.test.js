/*
 * cls-bluebird tests
 * Tests for Promise.reject()
 */

/* global describe */

// Imports
var runTests = require('../support');

// Run tests

runTests('Promise.reject()', function(Promise, u) {
    describe('returns instance of patched Promise constructor when passed', function() {
        u.it('error object', function(done, error) {
            var rejectErr = u.makeError();
            var p = Promise.reject(rejectErr);
            error(u.returnErrIfNotPromise(p));
            done(p, rejectErr);
        });
    });
});
