/*
 * cls-bluebird tests
 * Tests for .then()
 */

/* global describe */

// Imports
var runTests = require('../support');

// Run tests

runTests('.then()', function(u) {
	describe('resolve handler', function() {
		u.testSetProtoMethodAsyncHandler(function(p, handler) {
			return p.then(handler);
		});
	});

	describe('reject handler', function() {
		u.testSetProtoMethodAsyncHandler(function(p, handler) {
			return p.then(undefined, handler);
		}, {catches: true});
	});
});
