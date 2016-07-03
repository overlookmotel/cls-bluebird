/*
 * cls-bluebird tests
 * Tests for .catch()
 */

/* global describe */

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
        u.testSetCallbackAsync(function(p, handler) {
            p.catch(handler);
        }, {catches: true});
    });

    u.testSetCallbackBound(function(p, handler) {
        p.catch(handler);
    }, {catches: true});
});
