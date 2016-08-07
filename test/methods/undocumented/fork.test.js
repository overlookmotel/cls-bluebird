/*
 * cls-bluebird tests
 * Tests for .fork()
 */

/* global describe */

// Imports
var runTests = require('../../support');

// Run tests

// TODO Add tests for when both handlers provided
// TODO Add tests for progression handler
runTests('.fork()', function(u) {
	// `.fork()` does not exist in bluebird v3.4.1 despite docs stating that it is.
	// https://github.com/petkaantonov/bluebird/issues/1188
	// TODO Enable tests for bluebird v3 if `.fork()` is reinstated to API.

	var thisDescribe = (u.bluebirdVersion === 2 ? describe : describe.skip);

	thisDescribe('resolve handler', function() {
		u.testGroupProtoAsyncHandler(function(p, handler) {
			return p.fork(handler);
		});
	});

	thisDescribe('reject handler', function() {
		u.testGroupProtoAsyncHandler(function(p, handler) {
			return p.fork(undefined, handler);
		}, {catches: true});
	});
});
