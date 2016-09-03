/*
 * cls-bluebird tests
 * Tests for .spread()
 */

/* global describe */

// Imports
var runTests = require('../../support');

// Run tests

// TODO Add tests for when both handlers provided
runTests('.spread()', function(u) {
	describe('resolve handler', function() {
		u.testGroupProtoAsyncArrayHandler(function(p, handler) {
			return p.spread(handler);
		}, {noUndefinedValue: true, noUndefinedHandler: true, oneCallback: true});
	});

	(u.bluebirdVersion === 2 ? describe : describe.skip)('reject handler', function() {
		u.testGroupProtoAsyncArrayHandler(function(p, handler) {
			return p.spread(undefined, handler);
		}, {catches: true, noUndefinedValue: true, noUndefinedHandler: true, oneCallback: true});
	});
});
