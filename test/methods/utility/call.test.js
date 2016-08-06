/*
 * cls-bluebird tests
 * Tests for .call()
 */

/* global describe */

// Imports
var runTests = require('../../support');

// Run tests

runTests('.call()', function(u) {
	// NB No test for binding as is bound indirectly and at time of promise resolution, not when `.call()` called

	describe('returns instance of patched Promise constructor when called on promise', function() {
		describeSetWithHandlers(function(makePromise, handler, attach, expectedCalls) {
			u.testIsPromiseFromHandler(function(handler, cb) {
				testFn(makePromise, handler, attach, expectedCalls, cb);
			}, handler, {expectedCalls: expectedCalls});
		});
	});

	describe('calls callback asynchronously when called on promise', function() {
		u.describeMainPromisesAttach(function(makePromise, attach) {
			var expectedCalls = u.getRejectStatus(makePromise) ? 0 : 1;
			u.testAsync(function(handler, cb) {
				testFn(makePromise, handler, attach, expectedCalls, cb);
			}, undefined, {expectedCalls: expectedCalls});
		});
	});

	// TODO Split creation of promise to be chained onto into a `preFn`
	describe('callback runs in context on a promise', function() {
		u.describeMainPromisesAttach(function(makePromise, attach) {
			var expectedCalls = u.getRejectStatus(makePromise) ? 0 : 1;
			u.testRunContext(function(handler, ignore, cb) { // jshint ignore:line
				testFn(makePromise, handler, attach, expectedCalls, cb);
			}, undefined, undefined, {expectedCalls: expectedCalls});
		});
	});

	// TODO test for indirect binding

	/**
	 * Create promise that resolves to an object and then attaches `.call()` method to it.
	 * Calls `cb` with resulting promise.
	 *
	 * @param {Function} makePromise - Function to create promise to be chained onto
	 * @param {Function} handler - Function to be added as method on object contained in promise
	 * @param {Function} attach - Function to execute callback sync or async
	 * @param {number} expectedCalls - Number of times expect handler to be called
	 * @param {Function} cb - Callback which is called with resulting promise
	 * @returns {undefined}
	 */
	function testFn(makePromise, handler, attach, expectedCalls, cb) {
		// Create initial promise in separate CLS context for the run-in-context test
		var p;
		u.runInContext(function() {
			if (expectedCalls) {
				p = makePromise(function() {
					return {a: handler};
				});
			} else {
				p = makePromise();
			}
		});

		attach(function() {
			var newP = p.call('a');

			if (expectedCalls) {
				u.inheritRejectStatus(newP, handler);
			} else {
				u.setRejectStatus(newP);
			}

			cb(newP);
		}, p);
	}

	/**
	 * Create `describe` test groups for combinations of:
	 *   - promises to be chained on to
	 *   - handlers to be used as object method that gets called
	 *   - attach method sync/async
	 *
	 * `testFn` is called with `(makePromise, handler, attach, expectedCalls)`
	 *
	 * Where promise being chained on is rejected, only an undefined handler is provided
	 * as it won't be called.
	 *
	 * @param {Function} testFn - Test function
	 * @returns {undefined}
	 */
	function describeSetWithHandlers(testFn) {
		u.describeMainPromisesAttach(function(makePromise, attach) {
			describe('and handler', function() {
				if (u.getRejectStatus(makePromise)) {
					describe('is ignored', function() {
						testFn(makePromise, undefined, attach, 0);
					});
				} else {
					u.describeHandlers(function(handler) {
						testFn(makePromise, handler, attach, 1);
					});
				}
			});
		});
	}
});
