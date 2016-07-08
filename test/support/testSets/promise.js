/*
 * cls-bluebird tests
 * Utilities
 * Functions to run a set of tests relating to testing that methods return a promise of correct type.
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
	testSetProtoMethodReceivingValueReturnsPromise: function(fn) {
		var u = this;
		describe('returns instance of patched Promise constructor when attached to promise', function() {
			u.describeResolveRejectSyncAsyncAttachSyncAsync(function(makePromise, attach) {
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
			}, u.Promise, {continues: true, catches: true});
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
	 * @returns {undefined}
	 */
	testSetStaticMethodReceivingHandlerReturnsPromise: function(fn) {
		var u = this;
		describe('returns instance of patched Promise constructor when callback', function() {
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
	 * Run set of tests on a prototype method to ensure always returns a promise
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
	testSetProtoMethodReturnsPromise: function(fn, options) {
		var u = this;
		describe('returns instance of patched Promise constructor when called on promise', function() {
			u.describeResolveRejectSyncAsyncAttachSyncAsync(function(makePromise, attach) {
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
			}, u.Promise, {continues: true, catches: true});
		});
	}
};
