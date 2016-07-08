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
     * @returns {Array}
     */
    // TODO revert to returning number and find better way to deal with collection methods
    makeValue: function() {
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
    resolveSync: function(Promise) {
        var value = this.makeValue();
        return new Promise(function(resolve) {
            resolve(value);
        });
    },

    resolveAsync: function(Promise) {
        var value = this.makeValue();
        return new Promise(function(resolve) {
            setImmediate(function() {
                resolve(value);
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
    resolveSyncMethod: function(Promise) {
        var u = this;
        return function() {
    		return u.resolveSync(Promise);
    	};
    },

    resolveAsyncMethod: function(Promise) {
        var u = this;
        return function() {
    		return u.resolveAsync(Promise);
    	};
    },

    rejectSyncMethod: function(Promise) {
        var u = this;
        var fn = function() {
    		return u.rejectSync(Promise);
    	};
        this.setRejectStatus(fn);
        return fn;
    },

    rejectAsyncMethod: function(Promise) {
        var u = this;
        var fn = function() {
    		return u.rejectAsync(Promise);
    	};
        this.setRejectStatus(fn);
        return fn;
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
