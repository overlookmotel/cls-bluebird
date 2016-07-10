/*
 * cls-bluebird tests
 * Tests for .join()
 */

/* global describe */

// Imports
var runTests = require('../../support');

// Run tests
runTests('Promise.join()', function(u, Promise) {
	describe('with no handler', function() {
		u.testSetReturnsPromiseStaticReceivingArrayLiteral(function(array) {
			if (!array) array = [];
			return Promise.join.apply(Promise, array);
		});
	});

	describe('with handler', function() {
		/*
		 * NB Due to oddity in bluebird https://github.com/petkaantonov/bluebird/issues/1153
		 * `Promise.join()` calls the callback synchronously if input is only values or
		 * resolved promises, but async if any promises are pending.
		 * So async calling test is performed separately to allow for this.
		 * TODO Change test once issue is fixed (if it is considered a bug).
		 */
		// TODO Use array test set instead. NB no sense in testing for "handler attached async".
		u.testGroupProtoAsyncHandler(function(p, handler) {
			return Promise.join(p, p, p, handler);
		}, {noUndefined: true, noAsyncTest: true});

		// Check callback called sync/async
		describe('calls callback', function() {
			describe('synchronously when promises are resolved', function() {
				u.testSync(function(handler, cb) {
					var p = Promise.join(Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), handler);
					cb(p);
				});
			});

			describe('asynchronously when promises are pending', function() {
				u.testAsync(function(handler, cb) {
					var p = Promise.join(Promise.resolve(1), Promise.resolve(2).tap(function() {}), Promise.resolve(3), handler);
					cb(p);
				});
			});
		});
	});
});
