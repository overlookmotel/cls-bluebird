/*
 * cls-bluebird tests
 * Utilities
 * Functions to check conditions and return error if problem.
 * Mixin to Utils prototype.
 */

// Exports

module.exports = {
	/**
	 * Checks provided promise is a Promise and instance of main Bluebird constructor.
	 * Returns error object if not.
	 *
	 * @param {*} promise - Promise to check
	 * @returns {Error|undefined} - Error if not correct Promise, undefined if fine
	 */
	checkIsPromise: function(promise) {
		var u = this;
		if (!promise || typeof promise.then !== 'function') return new Error('Did not return promise');
		if (!(promise instanceof u.Promise)) return new Error('Did not return promise from correct constructor');
	},

	/**
	 * Checks provided function has been bound to a CLS context exactly once.
	 * Returns error object if not.
	 *
	 * @param {Function} fn - Function to check
	 * @param {Object} context - CLS context object which `fn` should be bound to
	 * @returns {Error|undefined} - Error if not bound correctly, undefined if fine
	 */
	checkBound: function(fn, context) {
		var bound = fn._bound;
		if (!bound || !bound.length) return new Error('Function not bound');
		if (bound.length > 1) return new Error('Function bound multiple times (' + bound.length + ')');
		if (bound[0].context !== context) return new Error('Function bound to wrong context (expected: ' + JSON.stringify(context) + ', got: ' + JSON.stringify(bound[0].context) + ')');
	},

	/**
	 * Checks provided function has not been bound to a CLS context.
	 * Returns error object if it has been bound.
	 *
	 * @param {Function} fn - Function to check
	 * @returns {Error|undefined} - Error if bound, undefined if has not
	 */
	checkNotBound: function(fn) {
		if (fn._bound) return new Error('Function bound');
	},

	/**
	 * Checks is called in expected CLS context.
	 * Returns error object if not running in correct context.
	 *
	 * @param {Object} context - CLS context object which `fn` should be bound to
	 * @returns {Error|undefined} - Error if not run in correct context, undefined if fine
	 */
	checkRunContext: function(context) {
		var u = this;
		if (u.ns.active !== context) return new Error('Function run in wrong context (expected: ' + JSON.stringify(context) + ', got: ' + JSON.stringify(u.ns.active) + ')');
	}
};
