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
	 * `fn` is called immediately and should call callback `cb` with promise to be tested.
	 *
	 * Checks:
	 *   - `fn()` calls back with a promise
	 *   - `fn()` calls back with a promise of the right type
	 * Any failed check errors are registered on test object, and `t.done()` is called.
	 *
	 * @param {Function} fn - Function to run.
	 * @param {Object} [options] - Options object
	 * @param {boolean} [options.aggregateError] - true if method produces `AggregateError`s on rejection
	 * @returns {undefined}
	 */
	testIsPromise: function(fn, options) {
		var u = this;
		u.test(function(t) {
			fn(function(p) {
				t.error(u.checkIsPromise(p));
				t.done(p);
			});
		}, options);
	},

	/**
	 * Run a function with handler and check it returns a promise from patched constructor.
	 * Also checks handler is called expected number of times.
	 *
	 * `fn` is called immediately with handler and should call callback `cb` with promise to be tested.
	 *
	 * Checks:
	 *   - `fn()` calls back with a promise
	 *   - `fn()` calls back with a promise of the right type
	 *   - `handler()` called expected number of times
	 * Any failed check errors are registered on test object, and `t.done()` is called.
	 *
	 * @param {Function} fn - Function to run.
	 * @param {Function} handler - Handler function - will be wrapped and passed to `fn`
	 * @param {Object} [options] - Options object
	 * @param {number} [options.expectedCalls=1] - Number of times expect handler to be called
	 * @returns {undefined}
	 */
	testIsPromiseFromHandler: function(fn, handler, options) {
		var u = this;
		options = options || {};

		u.testHandlerCalled(function(handler, t, cb) {
			fn(handler, function(p) {
				t.error(u.checkIsPromise(p));
				cb(p);
			});
		}, handler, options.expectedCalls);
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
	 * @param {Object} [options] - Options object
	 * @param {number} [options.expectedCalls=1] - Number of times expect handler to be called
	 * @returns {undefined}
	 */
	testAsync: function(fn, handler, options) {
		this._testSyncAsync(fn, false, handler, options);
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
	 * @param {Object} [options] - Options object
	 * @param {number} [options.expectedCalls=1] - Number of times expect handler to be called
	 * @returns {undefined}
	 */
	testSync: function(fn, handler, options) {
		this._testSyncAsync(fn, true, handler, options);
	},

	/**
	 * Runs a function and checks it calls back a handler synchronously or asynchronously.
	 * `fn` is called immediately, and passed a handler `handler` and callback `cb`.
	 * `fn` should create a promise and attach handler to it, and call callback `cb` with resulting promise.
	 * e.g. `fn = function(handler, cb) { var p = Promise.try(handler); cb(p); }`
	 *
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
	 * @param {Object} [options] - Options object
	 * @param {number} [options.expectedCalls=1] - Number of times expect handler to be called
	 * @returns {undefined}
	 */
	_testSyncAsync: function(fn, expectSync, handler, options) {
		var u = this;
		options = options || {};

		u.testHandlerCalled(function(handler, t, cb) {
			var sync = true;
			// TODO create general function to do wrapping and inheriting of reject status to wrapped function
			var handlerWrapped = function() {
				if (sync !== expectSync) t.error(new Error('Callback called ' + (expectSync ? 'asynchronously' : 'synchronously')));
				return handler.apply(this, arguments);
			};
			u.inheritRejectStatus(handlerWrapped, handler);

			fn(handlerWrapped, function(p) {
				sync = false;
				cb(p);
			});
		}, handler, options.expectedCalls);
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
	 * @param {Object} [options] - Options object
	 * @param {number} [options.expectedCalls=1] - Number of times expect handler to be called
	 * @returns {undefined}
	 */
	testBound: function(fn, preFn, handler, options) {
		var u = this;
		options = options || {};

		u.testHandlerCalled(function(handler, t, cb) {
			var preResult;
			if (preFn) preResult = preFn();

			u.runInContext(function(context) {
				// Create handler
				var handlerWrapped = function() {
					t.error(u.checkBound(handlerWrapped, context));
					return handler.apply(this, arguments);
				};
				u.inheritRejectStatus(handlerWrapped, handler);

				// Run test function with handler
				fn(handlerWrapped, preResult, function(p) {
					// Check that bound synchronously
					t.error(u.checkBound(handlerWrapped, context));
					cb(p);
				});
			});
		}, handler, options.expectedCalls);
	},

	/**
	 * Runs a function and checks that when it calls back a handler, the handler has not been bound to a CLS context.
	 * `fn` is called immediately, and passed a handler.
	 * `fn` should create promise and attach handler and return resulting promise.
	 * e.g. `fn = function(handler) { return Promise.try(handler); }`
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
	 * @param {Object} [options] - Options object
	 * @param {number} [options.expectedCalls=1] - Number of times expect handler to be called
	 * @returns {undefined}
	 */
	testNotBound: function(fn, handler, options) {
		var u = this;
		options = options || {};

		u.testHandlerCalled(function(handler, t, cb) {
			// Create handler
			var handlerWrapped = function() {
				t.error(u.checkNotBound(handlerWrapped));
				return handler.apply(this, arguments);
			};
			u.inheritRejectStatus(handlerWrapped, handler);

			// Run test function with handler
			var p = fn(handlerWrapped);
			cb(p);
		}, handler, options.expectedCalls);
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
	 * @param {Object} [options] - Options object
	 * @param {number} [options.expectedCalls=1] - Number of times expect handler to be called
	 * @returns {undefined}
	 */
	testRunContext: function(fn, preFn, handler, options) {
		var u = this;
		options = options || {};

		u.testHandlerCalled(function(handler, t, cb) {
			var preResult;
			if (preFn) preResult = preFn();

			u.runInContext(function(context) {
				// Create handler
				var handlerWrapped = function() {
					if (u.ns.active !== context) t.error(new Error('Function run in wrong context (expected: ' + JSON.stringify(context) + ', got: ' + JSON.stringify(u.ns.active) + ')'));
					return handler.apply(this, arguments);
				};
				u.inheritRejectStatus(handlerWrapped, handler);

				// Run test function with handler
				fn(handlerWrapped, preResult, function(p) {
					cb(p);
				});
			});
		}, handler, options.expectedCalls, {multiple: true});
	},

	/**
	 * Run a function with handler and check handler is called expected number of times.
	 * Calls `fn` immediately passing wrapped `handler`, test object `t` and callback `cb`.
	 * `fn` should call callback `cb` with created promise.
	 *
	 * @param {Function} fn - Function to run.
	 * @param {Function} [handler] - Handler function - will be wrapped and passed to `fn`
	 * @param {number} [expectedCalls=1] - Number of times expect handler to be called
	 * @param {boolean} [options.multiple] - Set `true` to use `u.testMultiple` rather than `u.test`
	 * @returns {undefined}
	 */
	testHandlerCalled: function(fn, handler, expectedCalls, options) {
		var u = this;
		options = options || {};
		if (expectedCalls === undefined) expectedCalls = 1;

		u[options.multiple ? 'testMultiple' : 'test'](function(t) {
			// Create handler
			var called = 0;

			var handlerWrapped = function() {
				called++;
				if (handler) return handler.apply(this, arguments);
			};
			u.inheritRejectStatus(handlerWrapped, handler);

			// Run test function with handler
			fn(handlerWrapped, t, function(p) {
				// Check handler was called once
				t.done(p, function() {
					if (!called && expectedCalls !== 0) t.error(new Error('Callback not called'));
					if (called !== expectedCalls) t.error(new Error('Callback called ' + called + ' times'));
				});
			});
		});
	},

	/**
	 * Run a function with handler and checks handler is not called.
	 * Calls `fn` immediately passing wrapped `handler`, test object `t` and callback `cb`.
	 * `fn` should call callback `cb` with created promise.
	 *
	 * @param {Function} fn - Function to run.
	 * @returns {undefined}
	 */
	// TODO Remove this - not used at present
	testHandlerNotCalled: function(fn) {
		this.testHandlerCalled(fn, null, 0);
	}
};
