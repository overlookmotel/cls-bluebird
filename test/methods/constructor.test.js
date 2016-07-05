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
        u.test('resolved sync', function(t) {
            var p = u.resolveSync();
            t.error(u.returnErrIfNotPromise(p));
            t.done(p);
        });

        u.test('resolved async', function(t) {
            var p = u.resolveAsync();
            t.error(u.returnErrIfNotPromise(p));
            t.done(p);
        });

        u.test('rejected sync', function(t) {
            var rejectErr = u.makeError();
            var p = u.rejectSync(rejectErr);
            t.error(u.returnErrIfNotPromise(p));
            t.done(p, rejectErr);
        });

        u.test('rejected async', function(t) {
            var rejectErr = u.makeError();
            var p = u.rejectAsync(rejectErr);

            t.error(u.returnErrIfNotPromise(p));
            t.done(p, rejectErr);
        });

        it('unresolved', function() {
            var p = new Promise(function() {});
            u.throwIfNotPromise(p);
        });

        u.test('handler throws', function(t) {
            var rejectErr = u.makeError();
            var p = new Promise(function() {
                throw rejectErr;
            });

            t.error(u.returnErrIfNotPromise(p));
            t.done(p, rejectErr);
        });
    });

    var testFn = function(handler) {
        return new Promise(handler);
    };

    u.testSetCallbackSync(testFn, {handler: function(resolve) { resolve(); }});

    u.testSetCallbackNotBound(testFn, {handler: function(resolve) { resolve(); }});
});
