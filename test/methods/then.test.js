/*
 * cls-bluebird tests
 * Tests for .then()
 */

/* global describe, it */

// Imports
var runTests = require('../support');

// Run tests

runTests('.then()', function(Promise, u) { // jshint ignore:line
    describe('always returns instance of patched Promise constructor when passed', function() {
        // TODO test for cases where attached to async resolved/rejected promise

        describe('resolve handler', function() {
            u.checkReturnsPromise(function(handler) {
                return u.resolveSync().then(handler);
            });
        });

        describe('reject handler', function() {
            u.checkReturnsPromise(function(handler, done) {
                return u.rejectSync().then(u.makeHandlerBadResolve(done), handler);
            });
        });
    });

    describe('calls callback asynchronously', function() {
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
            // TODO ensure handler receives correct error
            describe('attached sync to', function() {
                it('settled promise', function(done) {
                    var p = u.rejectSync();
                    u.checkAsync(function(handler) {
                        p.then(u.makeHandlerBadResolve(done), handler);
                    }, done);
                });

                it('pending promise', function(done) {
                    var p = u.rejectAsync();
                    u.checkAsync(function(handler) {
                        p.then(u.makeHandlerBadResolve(done), handler);
                    }, done);
                });
            });

            describe('attached async to', function() {
                it('settled promise', function(done) {
                    var p = u.rejectSync();
                    u.suppressUnhandledRejections(p);
                    setImmediate(function() {
                        u.checkAsync(function(handler) {
                            p.then(u.makeHandlerBadResolve(done), handler);
                        }, done);
                    });
                });

                it('pending promise', function(done) {
                    var p = u.rejectAsync();
                    u.suppressUnhandledRejections(p);
                    setImmediate(function() {
                        u.checkAsync(function(handler) {
                            p.then(u.makeHandlerBadResolve(done), handler);
                        }, done);
                    });
                });
            });
        });
    });

    describe('patch binds callback', function() {
        // TODO add tests for binding to async rejected promise or handler attached async?
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
                    p.then(u.makeHandlerBadResolve(done), handler);
                }, context, done);
            });
        });
    });
});
