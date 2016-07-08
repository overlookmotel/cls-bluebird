/*
 * cls-bluebird tests
 * Utilities
 * Describe sets.
 * Mixin to Utils prototype.
 */

/* global describe */

// Exports
module.exports = {
	/**
	 * Create `describe` test groups for values that can be consumed by methods that take a value
	 * e.g. `Promise.resolve(value)`.
	 * Calls `testFn` with functions that create different values when called.
	 *
	 * Values are:
	 *   - literal value
	 *   - undefined
	 *   - promises of different types, resolved or rejected, async or sync
	 *
	 * @param {Function} testFn - Function to call for each `describe`. Called with `makePromise` function.
	 * @returns {undefined}
	 */
	describeValues: function(testFn) {
		var u = this;

		describe('literal value', function() {
			testFn(u.makeValue);
		});

		describe('undefined', function() {
			testFn(u.makeUndefined);
		});

		u.describePromiseConstructorsResolveRejectSyncAsync(testFn, {continues: true, catches: true});
	},

	/**
	 * Create `describe` test groups for handler functions that can be consumed by methods which take a callback.
	 * e.g. `Promise.try(handler)`, `promise.then(handler)`.
	 * Calls `testFn` with handler functions.
	 *
	 * Handlers return:
	 *   - literal value
	 *   - undefined
	 *   - thrown error
	 *   - promises of different types, resolved or rejected, async or sync
	 *
	 * @param {Function} testFn - Function to call for each `describe`. Called with `makePromise` function.
	 * @returns {undefined}
	 */
	describeHandlers: function(testFn) {
		var u = this;

		describe('returns', function() {
			u.describeValues(testFn);
		});

		describe('throws error', function() {
			testFn(u.throwMethod());
		});
	},

	/**
	 * Create `describe` test groups for promise of different types resolved/rejected sync/async.
	 * Calls `testFn` with a function `makePromise` to create a promise.
	 *
	 * Cases cover:
	 *   - promises made from each alterative Promise constructors
	 *   - promises resolved or rejected
	 *   - promises resolved/rejected sync or async
	 *
	 * @param {Function} testFn - Function to call for each `describe`.
	 * @param {Object} options - Options object
	 * @param {boolean} [options.continues=false] - true if handler fires on resolved promise
	 * @param {boolean} [options.catches=false] - true if handler fires on rejected promise
	 * @param {boolean} [options.creator=false] - true if `makePromise` should accept a `makeValue` argument
	 * @returns {undefined}
	 */
	describePromiseConstructorsResolveRejectSyncAsync: function(testFn, options) {
		var u = this;
		u.describePromiseConstructors(function(Promise) {
			u.describeResolveRejectSyncAsync(testFn, Promise, options);
		});
	},

	/**
	 * Create `describe` test groups for each alternative Promise constructor.
	 * @param {Function} testFn - Function to call for each `describe`. Called with `Promise` constructor.
	 * @returns {undefined}
	 */
	describePromiseConstructors: function(testFn) {
		var u = this;

		u.altPromises.forEach(function(altPromiseParams) {
			var Promise = altPromiseParams.Promise;

			var runThis = (Promise ? describe : describe.skip);
			runThis('promise (' + altPromiseParams.name + ')', function() {
				testFn(Promise);
			});
		});
	},

	/**
	 * Create `describe` test groups for promise resolved/rejected sync/async and handler attached sync/async.
	 * Calls `testFn` with a function `makePromise` to create a promise.
	 *
	 * @param {Function} testFn - Function to call for each `describe`.
	 * @param {Function} Promise - Promise constructor to create promises with
	 * @param {Object} options - Options object
	 * @param {boolean} [options.continues=false] - true if handler fires on resolved promise
	 * @param {boolean} [options.catches=false] - true if handler fires on rejected promise
	 * @param {boolean} [options.creator=false] - true if `makePromise` should accept a `makeValue` argument
	 * @returns {undefined}
	 */
	describeResolveRejectSyncAsyncAttachSyncAsync: function(testFn, Promise, options) {
		var u = this;
		u.describeResolveRejectSyncAsync(function(makePromise) {
			describe('and method attached', function() {
				u.describeAttachSyncAsync(function(attach) {
					testFn(makePromise, attach);
				});
			});
		}, Promise, options);
	},

	/**
	 * Create `describe` test groups for promise resolved/rejected sync/async.
	 * Calls `testFn` with:
	 *   - a function `makePromise` to create a promise
	 *   - a function `attach` that schedules a function to run immediately or in next tick
	 *
	 * @param {Function} testFn - Function to call for each `describe`. Called with function to create a promise.
	 * @param {Function} Promise - Promise constructor to create promises with
	 * @param {Object} options - Options object
	 * @param {boolean} [options.continues=false] - true if handler fires on resolved promise
	 * @param {boolean} [options.catches=false] - true if handler fires on rejected promise
	 * @param {boolean} [options.creator=false] - true if `makePromise` should accept a `makeValue` argument
	 * @returns {undefined}
	 */
	describeResolveRejectSyncAsync: function(testFn, Promise, options) {
		var u = this;

		if (options.continues) {
			describe('resolved', function() {
				describe('sync', function() {
					testFn(u[options.creator ? 'resolveSyncCreator' : 'resolveSyncHandler'](Promise));
				});

				describe('async', function() {
					testFn(u[options.creator ? 'resolveAsyncCreator' : 'resolveAsyncHandler'](Promise));
				});
			});
		}

		if (options.catches) {
			describe('rejected', function() {
				describe('sync', function() {
					testFn(u.rejectSyncHandler(Promise));
				});

				describe('async', function() {
					testFn(u.rejectAsyncHandler(Promise));
				});
			});
		}
	},

	/**
	 * Create `describe` test groups for attaching a handler to a promise sync/async.
	 * Calls `testFn` with an `attach` function that schedules a function to run immediately or in next tick.
	 * If running in next tick, and promise attaching to is going to reject, it suppresses unhandled rejections
	 * on the promise.
	 *
	 * @param {Function} testFn - Function to call for each `describe`. Called with function that.
	 * @returns {undefined}
	 */
	describeAttachSyncAsync: function(testFn) {
		var u = this;

		describe('sync', function() {
			testFn(function(fn) { // jshint ignore:line
				fn();
			});
		});

		describe('async', function() {
			testFn(function(fn, p) {
				if (u.getRejectStatus(p)) u.suppressUnhandledRejections(p);
				setImmediate(fn);
			});
		});
	}
};
