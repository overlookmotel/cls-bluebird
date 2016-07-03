/*
 * cls-bluebird tests
 * Tests for new Promise()
 */

/* global describe, it */

// Imports
var runTests = require('../support');

// Run tests

runTests('new Promise()', function(u, Promise) {
    describe('returns instance of patched Promise constructor when', function() {
        u.it('resolved sync', function(done, error) {
            var p = u.resolveSync();
            error(u.returnErrIfNotPromise(p));
            done(p);
        });

        u.it('resolved async', function(done, error) {
            var p = u.resolveAsync();
            error(u.returnErrIfNotPromise(p));
            done(p);
        });

        u.it('rejected sync', function(done, error) {
            var rejectErr = u.makeError();
            var p = u.rejectSync(rejectErr);
            error(u.returnErrIfNotPromise(p));
            done(p, rejectErr);
        });

        u.it('rejected async', function(done, error) {
            var rejectErr = u.makeError();
            var p = u.rejectAsync(rejectErr);

            error(u.returnErrIfNotPromise(p));
            done(p, rejectErr);
        });

        it('unresolved', function() {
            var p = new Promise(function() {});
            u.throwIfNotPromise(p);
        });

        u.it('handler throws', function(done, error) {
            var rejectErr = u.makeError();
            var p = new Promise(function() {
                throw rejectErr;
            });

            error(u.returnErrIfNotPromise(p));
            done(p, rejectErr);
        });
    });

    var testFn = function(handler) {
        return new Promise(handler);
    };

    u.testSetCallbackSync(testFn);

    u.testSetCallbackNotBound(testFn);
});
