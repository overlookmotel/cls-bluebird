/*
 * cls-bluebird tests
 * Utilities constructor
 */

// Modules
var _ = require('lodash');

// Imports
var addCtors = require('./ctors'),
	test = require('./test'),
	promises = require('./promises'),
	checks = require('./checks'),
	tests = require('./tests'),
	describeSets = require('./describeSets'),
	testSetPromise = require('./testSets/promise'),
	testSetSyncAsync = require('./testSets/syncAsync'),
	testSetBinding = require('./testSets/binding'),
	testSetContext = require('./testSets/context'),
	testSetGroups = require('./testSets/groups');

// Constants
var REJECT_STATUS_KEY = '__clsBluebirdTestRejectStatus';

// Exports
function Utils(Promise, UnpatchedPromise, ns, altPromises, bluebirdVersion) {
	this.Promise = Promise;
	this.UnpatchedPromise = UnpatchedPromise;
	this.ns = ns;
	this.altPromises = altPromises;
	this.bluebirdVersion = bluebirdVersion;

	addCtors(this);
}

// Define initial value for `nextId`, used by `.runInContext()`
var nextId = 1;

Utils.prototype = {
	/**
	 * Create a CLS context and run function within it.
	 * Context is created with a unique `_id` attribute within it.
	 * `fn` is called with the CLS context object as argument.
	 *
	 * @param {Object} ns - CLS namespace to run within
	 * @param {Function} fn - Function to execute within context
	 * @returns {*} - Return value of `fn()`
	 */
	runInContext: function(fn) {
		var u = this;
		return u.runAndReturn(function(context) {
			var id = nextId;
			u.ns.set('_id', id);
			nextId++;

			return fn(context);
		});
	},

	/**
	 * Creates CLS context and runs a function within it.
	 * Like `ns.run(fn)` but returns the return value of `fn` rather than the context object.
	 * `fn` is called with the CLS context object as argument.
	 *
	 * @param {Function} fn - Function to execute within context
	 * @returns {*} - Return value of `fn()`
	 */
	runAndReturn: function runAndReturn(fn) {
		var u = this;
		var value;
		u.ns.run(function(context) {
			value = fn(context);
		});
		return value;
	},

	/**
	 * Await settling of promise and call callback when settled.
	 * Callback is called regardless of whether promise resolves or rejects.
	 * Always calls callback asynchronously even if promise is already settled at time function is called.
	 *
	 * @param {Promise} promise - Promise to watch
	 * @param {Function} cb - Callback function to call when promise is resolved
	 * @returns {undefined}
	 */
	awaitPromise: function(promise, cb) {
		(function checkResolved() {
			setImmediate(function() {
				if (!promise.isPending()) {
					cb();
					return;
				}
				checkResolved();
			});
		})();
	},

	/**
	 * Get rejection status of promise.
	 * @param {Promise} - Promise to get status of
	 * @returns {boolean} - true if rejecting, false if not
	 */
	getRejectStatus: function(promise) {
		if (!promise) return false;
		return !!promise[REJECT_STATUS_KEY];
	},

	/**
	 * Set rejection status of promise as rejecting.
	 * @param {Promise} - Promise to set status of
	 * @returns {Promise} - Input promise
	 */
	setRejectStatus: function(promise) {
		promise[REJECT_STATUS_KEY] = true;
		return promise;
	},

	/**
	 * Inherit rejection status from one promise to another.
	 * @param {Promise} target - Target promise
	 * @param {Promise} source - Source promise
	 * @returns {Promise} - Target promise
	 */
	inheritRejectStatus: function(target, source) {
		target[REJECT_STATUS_KEY] = this.getRejectStatus(source);
		return target;
	},

	/**
	 * Attach empty catch handler to promise to prevent unhandled rejections.
	 * Only catches test errors - all other errors are re-thrown.
	 * @param {Promise} promise - Promise to attach catch handler to
	 * @returns {undefined}
	 */
	suppressUnhandledRejections: function(promise) {
		var u = this;
		promise.catch(function(err) {
			if (!(err instanceof u.TestError)) throw err;
		});
	}
};

// mixins
_.extend(Utils.prototype, test);
_.extend(Utils.prototype, promises);
_.extend(Utils.prototype, checks);
_.extend(Utils.prototype, tests);
_.extend(Utils.prototype, describeSets);
_.extend(Utils.prototype, testSetPromise);
_.extend(Utils.prototype, testSetSyncAsync);
_.extend(Utils.prototype, testSetBinding);
_.extend(Utils.prototype, testSetContext);
_.extend(Utils.prototype, testSetGroups);

module.exports = Utils;
