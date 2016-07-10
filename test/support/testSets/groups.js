/*
 * cls-bluebird tests
 * Utilities
 * Functions to run a set of tests.
 * Mixin to Utils prototype.
 */

// Modules
var _ = require('lodash');

// Exports

module.exports = {
	/**
	 * Run set of tests on a static method that takes a callback to ensure:
	 *   - always returns a Promise which is instance of patched Promise constructor
	 *   - callback is called synchronously
	 *   - callback is not bound to CLS context
	 *
	 * `fn` is called with a `handler` function which should be attached as the callback to the method under test.
	 * `fn` should return the resulting promise.
	 * e.g. `return Promise.try(handler)`
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} [options] - Options object
	 * @param {boolean} [options.noUndefined=false] - true if method does not accept undefined handler
	 * @param {boolean} [options.noContextTest=false] - Skip handler called in context test if true
	 * @returns {undefined}
	 */
	testGroupStaticSyncHandler: function(fn, options) {
		var u = this;
		options = options || {};

		u.testSetReturnsPromiseStaticReceivingHandler(fn, options);
		u.testSetCallbackSyncStatic(fn);
		u.testSetNotBoundStatic(fn);
		if (!options.noContextTest) u.testSetCallbackContextStatic(fn);
	},

	/**
	 * Run set of tests on a prototype method that takes a callback to ensure:
	 *   - always returns a Promise which is instance of patched Promise constructor
	 *   - callback is called asynchronously
	 *   - callback is bound to CLS context
	 *
	 * `fn` is called with a `promise` and a `handler` function.
	 * `fn` should:
	 *   - call the method under test on `promise` with `handler` as callback
	 *   - return the resulting promise.
	 * e.g. `return promise.then(handler)`
	 *
	 * If handler should be called when promise attached to resolves, `options.continues` should be true (default)
	 * If handler should be called when promise attached to rejects, `options.catches` should be true
	 * If handler passes through rejections, `options.passThrough` should be true (e.g. `promise.finally()`)
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} [options] - Options object
	 * @param {boolean} [options.continues] - true if handler fires on resolved promise (default `!options.catches`)
	 * @param {boolean} [options.catches] - true if handler fires on rejected promise (default `false`)
	 * @param {boolean} [options.passThrough] - true if method passes through errors even if handler fires (default `false`)
	 * @param {boolean} [options.noUndefined] - true if method does not accept undefined handler (default `false`)
	 * @param {boolean} [options.noAsyncTest] - Skip handler called async test if true (default `false`)
	 * @param {boolean} [options.noBindTest] - Skip handler bound test if true (default `false`)
	 * @returns {undefined}
	 */
	testGroupProtoAsyncHandler: function(fn, options) {
		var u = this;

		// Conform options
		options = _.extend({
			catches: false,
			passThrough: false,
			noUndefined: false,
			noAsyncTest: false,
			noBindTest: false
		}, options);

		_.defaults(options, {continues: !options.catches});

		// Run tests
		u.testSetReturnsPromiseProtoReceivingHandler(fn, options);
		if (!options.noAsyncTest) u.testSetCallbackAsyncProto(fn, options);
		if (!options.noBindTest) u.testSetBoundProto(fn, options);
		u.testSetCallbackContextProto(fn, options);
	}
};
