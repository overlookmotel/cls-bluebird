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
        u.describeResolveRejectSyncAsync(function(makePromise) {
            u.testIsPromise(function() {
                return makePromise();
            });
        }, Promise, {continues: true, catches: true});

        /*
        // TODO test for when resolved with promise e.g. `new Promise(function(resolve) { resolve(Promise.resolve(); )})`
        describe('resolves with', function() {
            testValues(function(value) {
                return new Promise(function(resolve) {
                    resolve(value);
                });
            });
        });

        describe('rejects with', function() {
            testValues(function(value) {
                var p = new Promise(function(resolve, reject) { // jshint ignore:line
                    reject(value);
                });
                u.setRejectStatus(p);
                return p;
            });
        });

        function testValues(fn) {
            u.describeValues(function(makeValue) {
                u.testIsPromise(function() {
                    var value = makeValue();
                    var p = fn(value);
                    u.inheritRejectStatus(p, value);
                    return p;
                });
            });
        }
        */

        it('unresolved', function(done) {
            var p = new Promise(function() {});
            done(u.checkIsPromise(p));
        });

        describe('handler throws', function() {
            u.testIsPromise(function() {
                var p = new Promise(function() {
                    throw u.makeError();
                });
                u.setRejectStatus(p);
                return p;
            });
        });
    });

    var testFn = function(handler) {
        return new Promise(handler);
    };

    u.testSetStaticCallbackSync(testFn, {handler: function(resolve) { resolve(); }});

    u.testSetStaticCallbackNotBound(testFn, {handler: function(resolve) { resolve(); }});
});
