/*
 * cls-bluebird tests
 * Tests for .then()
 */

/* global describe */

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
            u.testSetCallbackAsync(function(p, handler) {
                p.then(handler);
            });
        });

        describe('reject handler', function() {
            u.testSetCallbackAsync(function(p, handler) {
                p.then(undefined, handler);
            }, {catches: true});
        });
    });

    describe('binds callback on', function() {
        u.testSetCallbackBound(function(p, handler) {
            p.then(handler);
        }, {name: 'resolve handler'});

        u.testSetCallbackBound(function(p, handler) {
            p.then(undefined, handler);
        }, {name: 'reject handler', catches: true});
    });
});
