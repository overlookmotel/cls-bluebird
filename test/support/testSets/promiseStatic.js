/*
 * cls-bluebird tests
 * Utilities
 * Functions to run a set of tests relating to testing that static methods return a promise of correct type.
 * Mixin to Utils prototype.
 */

/* global describe */

// Exports

module.exports = {
	/**
	 * Run set of tests on a static method which receives a value to ensure always returns a promise
	 * inherited from correct Promise constructor.
	 *
	 * Test function `fn` is called with a `value`.
	 * `fn` should call the method being tested with `value`, and return resulting promise.
	 * e.g. `return Promise.resolve(value)`
	 *
	 * A different `value` is provided in each test:
	 *   - literal value
	 *   - undefined
	 *   - promise from various constructors, resolved or rejected, sync or async
	 *
	 * @param {Function} fn - Test function
	 * @returns {undefined}
	 */
	testSetStaticMethodReceivingValueReturnsPromise: function(fn) {
		var u = this;
		describe('returns instance of patched Promise constructor when passed', function() {
			u.describeValues(function(makeValue) {
				u.testIsPromise(function(cb) {
					var value = makeValue();
					var p = fn(value);
					u.inheritRejectStatus(p, value);
					cb(p);
				});
			});
		});
	},

	/**
	 * Run set of tests on a static method which receives a handler to ensure always returns a promise
	 * inherited from correct Promise constructor.
	 *
	 * Test function `fn` is called with a function `handler`.
	 * `fn` should call the method being tested with `handler`, and return resulting promise.
	 * e.g. `return Promise.try(handler)`
	 *
	 * A different `handler` is provided in each test, which returns:
	 *   - literal value
	 *   - undefined
	 *   - thrown error
	 *   - promise from various constructors, resolved or rejected, sync or async
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} options - Options object
	 * @param {boolean} options.noUndefined - true if method does not accept undefined handler
	 * @returns {undefined}
	 */
	testSetStaticMethodReceivingHandlerReturnsPromise: function(fn, options) {
		var u = this;
		describe('returns instance of patched Promise constructor when callback', function() {
			// Test undefined handler
			if (!options.noUndefined) {
				u.test('is undefined', function(t) {
					var p = fn(undefined);

					t.error(u.checkIsPromise(p));
					t.done(p);
				});
			}

			// Test handlers
			u.describeHandlers(function(handler) {
				u.test(function(t) {
					// Create handler
					var called = 0;

					var handlerWrapped = function() {
						called++;
						return handler.apply(this, arguments);
					};

					// Run test function with handler
					var p = fn(handlerWrapped);
					u.inheritRejectStatus(p, handler);

					// Check result is Promise
					t.error(u.checkIsPromise(p));

					// Check handler was called once
					t.done(p, function() {
						if (!called) t.error(new Error('Callback not called'));
						if (called !== 1) t.error(new Error('Callback called ' + called + ' times'));
					});
				});
			});
		});
	},

	/**
	 * Run set of tests on a static method that takes an array (not promise of an array)
	 * to ensure always returns a promise inherited from correct Promise constructor.
	 *
	 * Test function `fn` is called with an `array`.
	 * `fn` should call the method being tested with `array`, and return resulting promise.
	 * e.g. `return Promise.join.apply(Promise, array)`
	 *
	 * A different `array` is provided in each test, containing members:
	 *   - literal value
	 *   - undefined
	 *   - promises of different types, resolved or rejected, sync or async
	 *
	 * If `options.noUndefined` is not true, a test is included for an undefined array.
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} [options] - Options object
	 * @param {boolean} [options.noUndefined=false] - true if method does not accept undefined value
	 * @returns {undefined}
	 */
	testSetStaticMethodReceivingArrayReturnsPromise: function(fn, options) {
		var u = this;
		options = options || {};

		describe('returns instance of patched Promise constructor when passed', function() {
			u.describeArrays(function(makeValue) {
				u.testIsPromise(function(cb) {
					var value = makeValue();
					var p = fn(value);
					u.inheritRejectStatus(p, value);
					cb(p);
				});
			}, options);
		});
	},

	/**
	 * Run set of tests on a static method that takes an array or promise of an array
	 * to ensure always returns a promise inherited from correct Promise constructor.
	 *
	 * Test function `fn` is called with a `value`.
	 * `fn` should call the method being tested with `value`, and return resulting promise.
	 * e.g. `return Promise.all(value)`
	 *
	 * A different `value` is provided in each test:
	 *   - undefined
	 *   - array
	 *   - promises of different types
	 *     - resolved sync or async with
	 *       - undefined
	 *       - array
	 *     - rejected sync or async with error
	 *
	 * Arrays can have members:
	 *   - literal value
	 *   - undefined
	 *   - promises of different types, resolved or rejected, sync or async
	 *
	 * If `options.noUndefined` is true, tests for undefined value and promises of undefined are skipped.
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} [options] - Options object
	 * @param {boolean} [options.noUndefined=false] - true if method does not accept undefined value
	 * @returns {undefined}
	 */
	testSetStaticMethodReceivingArrayOrPromiseOfArrayReturnsPromise: function(fn, options) {
		var u = this;
		options = options || {};

		describe('returns instance of patched Promise constructor when passed', function() {
			u.describeArrayOrPromiseOfArrays(function(makeValue) {
				u.testIsPromise(function(cb) {
					var value = makeValue();
					var p = fn(value);
					u.inheritRejectStatus(p, value);
					cb(p);
				});
			}, options);
		});
	}
};
