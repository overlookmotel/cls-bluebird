/*
 * cls-bluebird tests
 * Tests for Promise.coroutine()
 * File required by coroutine.test.js
 */

/* global describe */
// jshint esversion:6

// Export function to run tests

// TODO Add tests for indirect binding

module.exports = function(u, Promise) {
	describe('returns instance of patched Promise constructor when generator', function() {
		describe('returns value', function() {
			u.testIsPromiseFromHandler(function(handler, cb) {
				var fn = Promise.coroutine(function*() {
					handler();
					return u.makeValue();
				}); // jshint ignore:line

				var p = fn();
				cb(p);
			});
		});

		describe('throws error', function() {
			u.testIsPromiseFromHandler(function(handler, cb) {
				var fn = Promise.coroutine(function*() {
					handler();
					throw u.makeError();
				}); // jshint ignore:line

				var p = fn();
				u.setRejectStatus(p);
				cb(p);
			});
		});

		describe('yields', function() {
			u.describeAllPromises(function(makePromise) {
				u.testIsPromiseFromHandler(function(handler, cb) {
					var fn = Promise.coroutine(function*() {
						yield handler();
					});

					var p = fn();
					u.inheritRejectStatus(p, handler);
					cb(p);
				}, makePromise);
			});
		});
	});

	describe('calls', function() {
		describe('generator synchronously', function() {
			u.testSync(function(handler, cb) {
				var fn = Promise.coroutine(function*() {
					handler();
				}); // jshint ignore:line

				var p = fn();
				cb(p);
			});
		});

		describe('generator code asynchronously after yielding', function() {
			u.describeAllPromises(function(makePromise) {
				u.testAsync(function(handler, cb) {
					var fn = Promise.coroutine(function*() {
						try {
							yield makePromise();
						} catch (err) {}

						handler();
					});

					var p = fn();
					cb(p);
				});
			});
		});

		describe('generator code in finally block asynchronously after yielding', function() {
			u.describeAllPromises(function(makePromise) {
				u.testAsync(function(handler, cb) {
					var fn = Promise.coroutine(function*() {
						try {
							yield makePromise();
						} finally {
							handler();
						}
					});

					var p = fn();
					u.inheritRejectStatus(p, makePromise);
					cb(p);
				});
			});
		});
	});

	describe('generator code runs in context', function() {
		describe('prior to yield', function() {
			u.testRunContext(function(handler, fn, cb) {
				var p = fn(handler);
				cb(p);
			}, function() {
				// pre-fn to create coroutine
				return Promise.coroutine(function*(handler) {
					handler();
				}); // jshint ignore:line
			});
		});

		describe('after yielding', function() {
			u.describeAllPromises(function(makePromise) {
				u.testRunContext(function(handler, fn, cb) {
					var p = fn(handler);
					cb(p);
				}, function() {
					// pre-fn to create coroutine
					return Promise.coroutine(function*(handler) {
						try {
							yield makePromise();
						} catch (err) {}

						handler();
					});
				});
			});
		});

		describe('in finally block after yielding', function() {
			u.describeAllPromises(function(makePromise) {
				u.testRunContext(function(handler, fn, cb) {
					var p = fn(handler);
					u.inheritRejectStatus(p, makePromise);
					cb(p);
				}, function() {
					// pre-fn to create coroutine
					return Promise.coroutine(function*(handler) {
						try {
							yield makePromise();
						} finally {
							handler();
						}
					});
				});
			});
		});
	});
};
