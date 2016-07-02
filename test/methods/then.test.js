/*
 * cls-bluebird tests
 * Tests for .then()
 */

/* global describe, it */

// Imports
var runTests = require('../support');

// Run tests

runTests('.then()', function(Promise, u) { // jshint ignore:line
    describe('returns instance of patched Promise constructor when', function() {
        describe('resolve handler', function() {
            u.testSetProtoMethodReturnsPromise(function(p, handler) {
                return p.then(handler);
            });
        });

        describe('reject handler', function() {
            u.testSetProtoMethodReturnsPromise(function(p, handler) {
                return p.then(undefined, handler);
            }, {catches: true});
        });
    });

    describe('calls callback asynchronously when', function() {
        describe('resolve handler', function() {
            describe('attached sync to', function() {
                it('settled promise', function(done) {
                    var p = u.resolveSync();
                    u.checkAsync(function(handler) {
                        p.then(handler);
                    }, done);
                });

                it('pending promise', function(done) {
                    var p = u.resolveAsync();
                    u.checkAsync(function(handler) {
                        p.then(handler);
                    }, done);
                });
            });

            describe('attached async to', function() {
                it('settled promise', function(done) {
                    var p = u.resolveSync();
                    setImmediate(function() {
                        u.checkAsync(function(handler) {
                            p.then(handler);
                        }, done);
                    });
                });

                it('pending promise', function(done) {
                    var p = u.resolveAsync();
                    setImmediate(function() {
                        u.checkAsync(function(handler) {
                            p.then(handler);
                        }, done);
                    });
                });
            });
        });

        describe('reject handler', function() {
            describe('attached sync to', function() {
                it('settled promise', function(done) {
                    var p = u.rejectSync();
                    u.checkAsync(function(handler) {
                        p.then(undefined, handler);
                    }, done);
                });

                it('pending promise', function(done) {
                    var p = u.rejectAsync();
                    u.checkAsync(function(handler) {
                        p.then(undefined, handler);
                    }, done);
                });
            });

            describe('attached async to', function() {
                it('settled promise', function(done) {
                    var p = u.rejectSync();
                    u.suppressUnhandledRejections(p);
                    setImmediate(function() {
                        u.checkAsync(function(handler) {
                            p.then(undefined, handler);
                        }, done);
                    });
                });

                it('pending promise', function(done) {
                    var p = u.rejectAsync();
                    u.suppressUnhandledRejections(p);
                    setImmediate(function() {
                        u.checkAsync(function(handler) {
                            p.then(undefined, handler);
                        }, done);
                    });
                });
            });
        });
    });

    describe('binds callback on', function() {
        it('resolve handler', function(done) {
            var p = u.resolveSync();
            u.runInContext(function(context) {
                u.checkBound(function(handler) {
                    p.then(handler);
                }, context, done);
            });
        });

        it('reject handler', function(done) {
            var p = u.rejectSync();
            u.runInContext(function(context) {
                u.checkBound(function(handler) {
                    p.then(undefined, handler);
                }, context, done);
            });
        });
    });
});
