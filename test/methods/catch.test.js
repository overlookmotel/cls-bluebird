/*
 * cls-bluebird tests
 * Tests for .catch()
 */

/* global describe, it */

// Modules
var expect = require('chai').expect;

// Imports
var runTests = require('../support');

// Run tests

runTests('.catch()', function(Promise, u) { // jshint ignore:line
    describe('always returns instance of patched Promise constructor', function() {
        // TODO test for cases where attached to async resolved/rejected promise

        it('resolved promise', function(done) {
            var p = u.resolveSync().catch(u.makeHandlerBadReject(done));
            expect(p).to.be.instanceof(Promise);
            u.addThen(p, done);
        });

        describe('rejected promise', function() {
            u.checkReturnsPromise(function(handler) {
                return u.rejectSync().catch(handler);
            });
        });
    });

    describe('calls callback asynchronously', function() {
        // TODO ensure handler receives correct error
        describe('attached sync to', function() {
            it('settled promise', function(done) {
                var p = u.rejectSync();
                u.checkAsync(function(handler) {
                    p.catch(handler);
                }, done);
            });

            it('pending promise', function(done) {
                var p = u.rejectAsync();
                u.checkAsync(function(handler) {
                    p.catch(handler);
                }, done);
            });
        });

        describe('attached async to', function() {
            it('settled promise', function(done) {
                var p = u.rejectSync();
                u.suppressUnhandledRejections(p);
                setImmediate(function() {
                    u.checkAsync(function(handler) {
                        p.catch(handler);
                    }, done);
                });
            });

            it('pending promise', function(done) {
                var p = u.rejectAsync();
                u.suppressUnhandledRejections(p);
                setImmediate(function() {
                    u.checkAsync(function(handler) {
                        p.catch(handler);
                    }, done);
                });
            });
        });
    });

    it('patch binds callback', function(done) {
        // TODO add tests for binding to async rejected promise or handler attached async?
        var p = u.rejectSync();
        u.runInContext(function(context) {
            u.checkBound(function(handler) {
                p.catch(handler);
            }, context, done);
        });
    });
});
