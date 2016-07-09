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
		if (makeValue) {
			var value = makeValue();
			return this.inheritRejectStatus(value, makeValue);
		}

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
		if (!makeValue) makeValue = this.valueCreator();
		return new Promise(function(resolve) {
			resolve(makeValue());
		});
	},

	resolveAsync: function(Promise, makeValue) {
		if (!makeValue) makeValue = this.valueCreator();
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
		var makePromise = function() {
			return u.resolveSync(Promise);
		};
		makePromise.__constructor = Promise; // TODO Remove this once issue with unhandled rejections is solved
		return makePromise;
	},

	resolveAsyncHandler: function(Promise) {
		var u = this;
		var makePromise = function() {
			return u.resolveAsync(Promise);
		};
		makePromise.__constructor = Promise; // TODO Remove this once issue with unhandled rejections is solved
		makePromise.__async = true; // TODO Remove this once issue with unhandled rejections is solved
		return makePromise;
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
		var makePromise = function(makeValue) {
			var p = u.resolveSync(Promise, makeValue);
			return u.inheritRejectStatus(p, makeValue);
		};
		makePromise.__constructor = Promise; // TODO Remove this once issue with unhandled rejections is solved
		return makePromise;
	},

	resolveAsyncCreator: function(Promise) {
		var u = this;
		var makePromise = function(makeValue) {
			var p = u.resolveAsync(Promise, makeValue);
			return u.inheritRejectStatus(p, makeValue);
		};
		makePromise.__constructor = Promise; // TODO Remove this once issue with unhandled rejections is solved
		makePromise.__async = true; // TODO Remove this once issue with unhandled rejections is solved
		return makePromise;
	},

	/**
	 * Function to create function that creates value
	 */
	valueCreator: function() {
		var u = this;
		return function(makeValue) {
			return u.makeValue(makeValue);
		};
	},

	/**
	 * Function that returns function which throws error when called.
	 * @returns {Function}
	 */
	throwHandler: function() {
		var u = this;
		var fn = function() {
			u.makeThrow();
		};
		this.setRejectStatus(fn);
		return fn;
	}
};
