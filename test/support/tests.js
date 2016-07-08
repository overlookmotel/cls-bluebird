/*
 * cls-bluebird tests
 * Utilities
 * Functions to run test for various conditions.
 * Mixin to Utils prototype.
 */

// Exports

module.exports = {
	/**
	 * Run a function and check it returns a promise from patched constructor.
	 * `fn` is called immediately.
	 *
	 * Checks:
	 *   - `fn()` returns a promise
	 *   - `fn()` returns a promise of the right type
	 * Any failed check errors are registered on test object, and `t.done()` is called.
	 *
	 * @param {Function} fn - Function to run.
	 * @returns {undefined}
	 */
	testIsPromise: function(fn) {
		var u = this;
		u.test(function(t) {
			var p = fn();
			t.error(u.checkIsPromise(p));
			t.done(p);
		});
	},

	/**
	 * Runs a function and checks it calls back a handler asynchronously.
	 * `fn` is called immediately, and passed a handler.
	 *
	 * Checks:
	 *   - handler is called
	 *   - handler is called asynchronously
	 * Any failed check errors are registered on test object, and `t.done()` is called.
	 *
	 * If `handler` argument is provided, it's executed as part of the handler.
	 *
	 * @param {Function} fn - Function to run.
	 * @param {Function} [handler] - Optional handler function
	 * @returns {undefined}
	 */
	testAsync: function(fn, handler) {
		this._testSyncAsync(fn, false, handler);
	},

	/**
	 * Run a function and check it calls back a handler synchronously.
	 * `fn` is called immediately, and passed a handler.
	 *
	 * Checks:
	 *   - handler is called
	 *   - handler is called synchronously
	 * Any failed check errors are registered on test object, and `t.done()` is called.
	 *
	 * If `handler` argument is provided, it's executed as part of the handler.
	 *
	 * @param {Function} fn - Function to run.
	 * @param {Function} [handler] - Optional handler function
	 * @returns {undefined}
	 */
	testSync: function(fn, handler) {
		this._testSyncAsync(fn, true, handler);
	},

	/**
	 * Runs a function and checks it calls back a handler synchronously or asynchronously.
	 * `fn` is called immediately, and passed a handler.
	 * Whether expect sync or async callback is defined by `expectSync` argument.
	 *
	 * Checks:
	 *   - handler is called once
	 *   - handler is called as expected (sync/async)
	 * Any failed check errors are registered on test object, and `t.done()` is called.
	 *
	 * If `handler` argument is provided, it's executed as part of the handler.
	 *
	 * @param {Function} fn - Function to run.
	 * @param {boolean} expectSync - true if expect callback to be called sync, false if expect async
	 * @param {Function} [handler] - Handler function
	 * @returns {undefined}
	 */
	_testSyncAsync: function(fn, expectSync, handler) {
		var u = this;
		u.test(function(t) {
			// Create handler
			var sync = true,
				called = 0;

			var handlerWrapped = function() {
				called++;
				if (sync !== expectSync) t.error(new Error('Callback called ' + (expectSync ? 'asynchronously' : 'synchronously')));
				if (handler) return handler.apply(this, arguments);
			};

			// Run test function with handler
			fn(handlerWrapped, function(p) {
				sync = false;

				// Check handler was called once
				t.done(p, function() {
					if (!called) t.error(new Error('Callback not called'));
					if (called !== 1) t.error(new Error('Callback called ' + called + ' times'));
				});
			});
		});
	},

	/**
	 * Runs a function and checks that when it calls back a handler, the handler has been bound to CLS context.
	 * `fn` is called immediately, and passed a handler.
	 * `fn` should create a promise and call callback `cb` with it.
	 *
	 * Checks:
	 *   - handler is called once
	 *   - Handler is bound to correct context
	 *   - Handler is bound exactly once, synchronously after handler attached
	 *   - Handler is not bound again before handler is executed (asynchronously)
	 *
	 * Any failed check errors are registered on test object, and `t.done()` is called.
	 *
	 * `preFn` (if provided) is executed before CLS context created and result passed to `fn` as 2nd arg.
	 * `handler` (if provided) is executed as part of the handler.
	 *
	 * @param {Function} fn - Function to run.
	 * @param {Function} [preFn] - Function to run before CLS context created
	 * @param {Function} [handler] - Handler function
	 * @returns {undefined}
	 */
	testBound: function(fn, preFn, handler) {
		var u = this;
		u.test(function(t) {
			var preResult;
			if (preFn) preResult = preFn();

			u.runInContext(function(context) {
				// Create handler
				var called = 0;

				var handlerWrapped = function() {
					called++;
					t.error(u.checkBound(handlerWrapped, context));
					if (handler) return handler.apply(this, arguments);
				};

				// Run test function with handler
				fn(handlerWrapped, preResult, function(p) {
					// Check that bound synchronously
					t.error(u.checkBound(handlerWrapped, context));

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
	 * Runs a function and checks that when it calls back a handler, the handler has not been bound to a CLS context.
	 * `fn` is called immediately, and passed a handler.
	 *
	 * Checks:
	 *   - handler is called once
	 *   - handler is not bound
	 * Any failed check errors are registered on test object, and `t.done()` is called.
	 *
	 * If `handler` argument is provided, it's executed as part of the handler.
	 *
	 * @param {Function} fn - Function to run.
	 * @param {Function} [handler] - Handler function
	 * @returns {undefined}
	 */
	testNotBound: function(fn, handler) {
		var u = this;
		u.test(function(t) {
			// Create handler
			var called = 0;

			var handlerWrapped = function() {
				called++;
				t.error(u.checkNotBound(handlerWrapped));
				if (handler) return handler.apply(this, arguments);
			};

			// Run test function with handler
			var p = fn(handlerWrapped);

			// Check handler was called once
			t.done(p, function() {
				if (!called) t.error(new Error('Callback not called'));
				if (called !== 1) t.error(new Error('Callback called ' + called + ' times'));
			});
		});
	},

	/**
	 * Runs a function and checks that when it calls back a handler, the handler runs within correct CLS context.
	 * `fn` is called immediately, and passed a handler.
	 *
	 * Checks:
	 *   - handler is called once
	 *   - handler is run in correct context
	 *
	 * Any failed check errors are registered on test object, and `t.done()` is called.
	 *
	 * `preFn` (if provided) is executed before CLS context created and result passed to `fn` as 2nd arg.
	 * `handler` (if provided) is executed as part of the handler.
	 *
	 * @param {Function} fn - Function to run.
	 * @param {Function} [preFn] - Function to run before CLS context created
	 * @param {Function} [handler] - Handler function
	 * @returns {undefined}
	 */
	testRunContext: function(fn, preFn, handler) {
		var u = this;
		u.testMultiple(function(t) {
			var preResult;
			if (preFn) preResult = preFn();

			u.runInContext(function(context) {
				// Create handler
				var called = 0;

				var handlerWrapped = function() {
					called++;
					if (u.ns.active !== context) t.error(new Error('Function run in wrong context (expected: ' + JSON.stringify(context) + ', got: ' + JSON.stringify(u.ns.active) + ')'));
					if (handler) return handler.apply(this, arguments);
				};

				// Run test function with handler
				fn(handlerWrapped, preResult, function(p) {
					// Check handler was called once
					t.done(p, function() {
						if (!called) t.error(new Error('Callback not called'));
						if (called !== 1) t.error(new Error('Callback called ' + called + ' times'));
					});
				});
			});
		});
	}
};
