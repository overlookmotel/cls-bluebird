/*
 * cls-bluebird tests
 * Utilities
 * Functions to run a set of tests relating to testing that callbacks are run sync/async.
 * Mixin to Utils prototype.
 */

/* global describe */

// Exports

module.exports = {
	/**
	 * Run set of tests on a prototype method to ensure always calls callback asynchronously.
	 * Function `fn` should take provided `promise` and call the method being tested on it,
	 * attaching `handler` as the callback.
	 * e.g. `return promise.then(handler)`
	 *
	 * If handler is being attached to catch rejections, `options.catches` should be `true`
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} options - Options object
	 * @param {boolean} [options.continues=false] - true if handler fires on resolved promise
	 * @param {boolean} [options.catches=false] - true if handler fires on rejected promise
	 * @param {boolean} [options.passThrough=false] - true if method passes through errors even if handler fires
	 * @returns {undefined}
	 */
	testSetProtoCallbackAsync: function(fn, options) {
		var u = this;
		describe('calls callback asynchronously when called on promise', function() {
			u.describeMainPromisesAttach(function(makePromise, attach) {
				u.testAsync(function(handler, cb) {
					var p = makePromise();

					attach(function() {
						var newP = fn(p, handler);
						if (options.passThrough) u.inheritRejectStatus(newP, p);
						cb(newP);
					}, p);
				});
			}, options);
		});
	},

	/**
	 * Run set of tests on a static method to ensure always calls callback synchronously.
	 * Function `fn` should call the method being tested, attaching `handler` as the callback.
	 * e.g. `return Promise.try(handler)`
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} [options] - Options object
	 * @param {Function} [options.handler] - Optional handler function
	 * @returns {undefined}
	 */
	testSetStaticCallbackSync: function(fn, options) {
		var u = this;
		options = options || {};

		describe('calls callback synchronously', function() {
			u.testSync(function(handler, cb) {
				var p = fn(handler);
				cb(p);
			}, options.handler);
		});
	}
};
