/*
 * cls-bluebird tests
 * Tests for new Promise()
 */

/* global describe, it */

// Imports
var runTests = require('../support');

// Run tests

runTests('new Promise()', function(Promise, u) {
    describe('always returns instance of patched Promise constructor when', function() {
        it('resolved sync', function(done) {
            var p = u.resolveSync();
            u.throwIfNotPromise(p);
            u.addThen(p, done);
        });

        it('resolved async', function(done) {
            var p = u.resolveAsync();
            u.throwIfNotPromise(p);
            u.addThen(p, done);
        });

        it('rejected sync', function(done) {
            var err = u.makeError();
            var p = u.rejectSync(err);
            u.throwIfNotPromise(p);
            u.addCatch(p, err, done);
        });

        it('rejected async', function(done) {
            var err = u.makeError();
            var p = u.rejectAsync(err);
            u.throwIfNotPromise(p);
            u.addCatch(p, err, done);
        });

        it('unresolved', function() {
            var p = new Promise(function() {});
            u.throwIfNotPromise(p);
        });

        it('throws', function(done) {
            var err = u.makeError();
            var p = new Promise(function() {
                throw err;
            });
            u.throwIfNotPromise(p);
            u.addCatch(p, err, done);
        });
    });

    it('calls callback synchronously', function(done) {
        u.checkSync(function(handler) {
            new Promise(handler); // jshint ignore:line
        }, done);
    });

    it('patch does not bind callback', function(done) {
        u.checkNotBound(function(handler) {
            new Promise(handler); // jshint ignore:line
        }, done);
    });
});
