/*
 * cls-bluebird tests
 * Tests for .then()
 */

/* global describe */

// Imports
var runTests = require('../../support');

// Run tests

// TODO Add tests for when both handlers provided
// TODO Add tests for progression handler
runTests('.then()', function(u) {
	describe('resolve handler', function() {
		u.testGroupProtoAsyncHandler(function(p, handler) {
			return p.then(handler);
		});
	});

	describe('reject handler', function() {
		u.testGroupProtoAsyncHandler(function(p, handler) {
			return p.then(undefined, handler);
		}, {catches: true});
	});
});
