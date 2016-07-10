/*
 * cls-bluebird tests
 * Utilities
 * Functions to run a set of tests relating to testing that prototype methods return a promise of correct type.
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
	 * e.g. `return promise.bind(value)`
	 *
	 * A different `value` is provided in each test:
	 *   - literal value
	 *   - undefined
	 *   - promise from various constructors, resolved or rejected, sync or async
	 *
	 * @param {Function} fn - Test function
	 * @returns {undefined}
	 */
	testSetReturnsPromiseProtoReceivingValue: function(fn) {
		var u = this;
		describe('returns instance of patched Promise constructor when attached to promise', function() {
			u.describeMainPromisesAttach(function(makePromise, attach) {
				describe('when value is', function() {
					u.describeValues(function(makeValue) {
						u.testIsPromise(function(cb) {
							var p = makePromise();

							attach(function() {
								var value = makeValue();
								var newP = fn(p, value);
								if (u.getRejectStatus(p) || u.getRejectStatus(value)) u.setRejectStatus(newP);
								cb(newP);
							}, p);
						});
					});
				});
			}, {continues: true, catches: true});
		});
	},

	/**
	 * Run set of tests on a prototype method that takes a handler to ensure always returns a promise
	 * inherited from correct Promise constructor.
	 *
	 * `fn` is called with a `promise` and a `handler` function.
	 * `fn` should call method under test on `promise` with `handler` callback attached
	 * and return resulting promise.
	 * e.g. `return promise.then(handler)`
	 *
	 * A different `handler` is provided in each test.
	 * Handlers returns a literal value, throw, or return or a promise that resolves/rejects.
	 * Promises returned from handlers are instances of various different Promise constructors.
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} options - Options object
	 * @param {boolean} options.continues - true if handler fires on resolved promise
	 * @param {boolean} options.catches - true if handler fires rejected promise
	 * @param {boolean} options.passThrough - true if method passes through errors even if handler fires
	 * @param {boolean} options.noUndefined - true if method does not accept undefined handler
	 * @returns {undefined}
	 */
	testSetReturnsPromiseProtoReceivingHandler: function(fn, options) {
		var u = this;
		describe('returns instance of patched Promise constructor when called on promise', function() {
			u.describeMainPromisesAttach(function(makePromise, attach) {
				describe('and handler', function() {
					// Test undefined handler
					if (!options.noUndefined) {
						u.test('is undefined', function(t) {
							var p = makePromise();

							attach(function() {
								var newP = fn(p, undefined);
								u.inheritRejectStatus(newP, p);

								t.error(u.checkIsPromise(newP));
								t.done(newP);
							}, p);
						});
					}

					// If handler should not be fired on this promise, check is not fired
					var handlerShouldBeCalled = u.getRejectStatus(makePromise) ? options.catches : options.continues;

					if (!handlerShouldBeCalled) {
						u.test('is ignored', function(t) {
							var p = makePromise();

							attach(function() {
								var newP = fn(p, function() {
									t.error(new Error('Handler should not be called'));
								});
								u.inheritRejectStatus(newP, p);

								t.error(u.checkIsPromise(newP));
								t.done(newP);
							}, p);
						});
						return;
					}

					// Handler should fire on this promise
					// Test all handlers
					u.describeHandlers(function(handler) {
						u.test(function(t) {
							// Create handler
							var called = 0;

							var handlerWrapped = function() {
								called++;
								return handler.apply(this, arguments);
							};

							// Create promise
							var p = makePromise();

							// Run method on promise and pass handler
							attach(function() {
								var newP = fn(p, handlerWrapped);
								u.inheritRejectStatus(newP, handler);
								if (options.passThrough && u.getRejectStatus(p)) u.setRejectStatus(newP);

								// Check result is promise
								t.error(u.checkIsPromise(newP));

								// Check handler was called once
								t.done(newP, function() {
									if (!called) t.error(new Error('Callback not called'));
									if (called !== 1) t.error(new Error('Callback called ' + called + ' times'));
								});
							}, p);
						});
					});
				});
			}, {continues: true, catches: true});
		});
	},

	/**
	 * Run set of tests on a prototype method that chains onto promise of an array
	 * and receives no value or handler to ensure always returns a promise
	 * inherited from correct Promise constructor.
	 *
	 * Test function `fn` is called with a `promise`.
	 * `fn` should call the method being tested on `promise`, and return resulting promise.
	 * e.g. `return Promise.all(value)`
	 *
	 * A different `promise` is provided in each test:
	 *   - resolved sync or async with
	 *     - undefined
	 *     - array
	 *   - rejected sync or async with error
	 *
	 * Arrays can have members:
	 *   - literal value
	 *   - undefined
	 *   - promises of different types, resolved or rejected, sync or async
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} [options] - Options object
	 * @param {boolean} [options.noUndefined=false] - true if method does not accept undefined value
	 * @returns {undefined}
	 */
	testSetReturnsPromiseProtoOnArrayReceivingNothing: function(fn, options) {
		var u = this;

		describe('returns instance of patched Promise constructor when chained on promise', function() {
			u.describeMainPromisesArray(function(makePromise) {
				describe('and method attached', function() {
					u.describeAttach(function(attach) {
						u.testIsPromise(function(cb) {
							var p = makePromise();

							attach(function() {
								var newP = fn(p);
								u.inheritRejectStatus(newP, p);
								cb(newP);
							}, p);
						});
					});
				});
			}, options);
		});
	}
};
