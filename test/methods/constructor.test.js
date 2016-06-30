/*
 * cls-bluebird tests
 * Tests for new Promise()
 */

/* global describe, it */

// Modules
var expect = require('chai').expect;

// Imports
var runTests = require('../support');

// Run tests

runTests('new Promise()', function(Promise, u) {
    describe('always returns instance of patched Promise constructor when', function() {
        it('resolved sync', function(done) {
            var p = u.resolveSync();
            expect(p).to.be.instanceof(Promise);
            u.addThen(p, done);
        });

        it('resolved async', function(done) {
            var p = u.resolveAsync();
            expect(p).to.be.instanceof(Promise);
            u.addThen(p, done);
        });

        it('rejected sync', function(done) {
            var err = u.makeError();
            var p = u.rejectSync(err);
            expect(p).to.be.instanceof(Promise);
            u.addCatch(p, err, done);
        });

        it('rejected async', function(done) {
            var err = u.makeError();
            var p = u.rejectAsync(err);
            expect(p).to.be.instanceof(Promise);
            u.addCatch(p, err, done);
        });

        it('unresolved', function() {
            var p = new Promise(function() {});
            expect(p).to.be.instanceof(Promise);
        });

        it('throws', function(done) {
            var err = u.makeError();
            var p = new Promise(function() {
                throw err;
            });
            expect(p).to.be.instanceof(Promise);
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
