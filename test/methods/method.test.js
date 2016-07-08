/*
 * cls-bluebird tests
 * Tests for Promise.method()
 */

/* global describe */

// Imports
var runTests = require('../support');

// Run tests

runTests('Promise.method()', function(u, Promise) {
	describe('returns a function that', function() {
		u.testSetStaticMethodSyncHandler(function(handler) {
			return (Promise.method(handler))();
		});
	});
});
