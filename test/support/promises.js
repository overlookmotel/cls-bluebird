/*
 * cls-bluebird tests
 * Utilities
 * Functions to create promises.
 * Mixin to Utils prototype.
 */

// Exports

module.exports = {
	/**
	 * Function to create default literal value.
	 * NB Returns array so works with collection methods.
	 *
	 * @param {Function} [makeValue] - If provided, function is called to create value
	 * @returns {Array}
	 */
	// TODO revert to returning number and find better way to deal with collection methods
	makeValue: function(makeValue) {
		if (makeValue) return makeValue();
		return [1, 2, 3];
	},

	/**
	 * Function to create default error.
	 * Error is instance of TestError constructor.
	 * @returns {TestError}
	 */
	makeError: function() {
		return new this.TestError();
	},

	/**
	 * Function to create undefined value.
	 * @returns {undefined}
	 */
	makeUndefined: function() {
		return undefined;
	},

	/**
	 * Function that throws an error.
	 * @throws {TestError}
	 */
	makeThrow: function() {
		throw this.makeError();
	},

	/*
	 * Set of functions to create promises which resolve or reject either synchronously or asynchronously.
	 * Promises are created from specified Promise constructor.
	 */
	resolveSync: function(Promise, makeValue) {
		if (!makeValue) makeValue = this.makeValue;
		return new Promise(function(resolve) {
			resolve(makeValue());
		});
	},

	resolveAsync: function(Promise, makeValue) {
		if (!makeValue) makeValue = this.makeValue;
		return new Promise(function(resolve) {
			setImmediate(function() {
				resolve(makeValue());
			});
		});
	},

	rejectSync: function(Promise) {
		var err = this.makeError();
		var p = new Promise(function(resolve, reject) { // jshint ignore:line
			reject(err);
		});
		this.setRejectStatus(p);
		return p;
	},

	rejectAsync: function(Promise) {
		var err = this.makeError();
		var p = new Promise(function(resolve, reject) { // jshint ignore:line
			setImmediate(function() {
				reject(err);
			});
		});
		this.setRejectStatus(p);
		return p;
	},

	/*
	 * Set of functions to create functions which return promises.
	 * Promises resolve or reject either synchronously or asynchronously.
	 * Promises are created from specified Promise constructor.
	 */
	resolveSyncHandler: function(Promise) {
		var u = this;
		return function() {
			return u.resolveSync(Promise);
		};
	},

	resolveAsyncHandler: function(Promise) {
		var u = this;
		return function() {
			return u.resolveAsync(Promise);
		};
	},

	rejectSyncHandler: function(Promise) {
		var u = this;
		var fn = function() {
			return u.rejectSync(Promise);
		};
		this.setRejectStatus(fn);
		return fn;
	},

	rejectAsyncHandler: function(Promise) {
		var u = this;
		var fn = function() {
			return u.rejectAsync(Promise);
		};
		this.setRejectStatus(fn);
		return fn;
	},

	/*
	 * Set of functions to create functions which return promises.
	 * Unlike handler functions above, the functions returned will take a `makeValue` argument.
	 * Promises resolve either synchronously or asynchronously.
	 * Promises are created from specified Promise constructor.
	 */
	resolveSyncCreator: function(Promise) {
		var u = this;
		return function(makeValue) {
			return u.resolveSync(Promise, makeValue);
		};
	},

	resolveAsyncCreator: function(Promise) {
		var u = this;
		return function(makeValue) {
			return u.resolveAsync(Promise, makeValue);
		};
	},

	/**
	 * Function that returns function which throws error when called.
	 * @returns {Function}
	 */
	throwMethod: function() {
		var u = this;
		var fn = function() {
			u.makeThrow();
		};
		this.setRejectStatus(fn);
		return fn;
	}
};
