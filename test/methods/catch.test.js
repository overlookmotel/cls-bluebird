/*
 * cls-bluebird tests
 * Tests for .catch()
 */

/* global describe, it */

// Imports
var runTests = require('../support');

// Run tests

runTests('.catch()', function(Promise, u) { // jshint ignore:line
    describe('returns instance of patched Promise constructor when handler', function() {
        u.testSetProtoMethodReturnsPromise(function(p, handler) {
            return p.catch(handler);
        }, {catches: true});
    });

    describe('calls callback asynchronously when handler', function() {
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

    it('binds callback', function(done) {
        var p = u.rejectSync();
        u.runInContext(function(context) {
            u.checkBound(function(handler) {
                p.catch(handler);
            }, context, done);
        });
    });
});
