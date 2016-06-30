/*
 * cls-bluebird tests
 * Utilities
 * Functions to create promises.
 * Mixin to Utils prototype.
 */

module.exports = {
    /*
     * Functions to create default literal value and error.
     */
    makeValue: function() {
        return 123;
    },

    makeError: function() {
        return new Error('<rejection value>');
    },

    /*
     * Set of functions to create promises which resolve or reject either synchronously or asynchronously.
     * Promises are created from specified Promise constructor.
     */

    resolveSyncAlt: function(Promise, value) {
        if (value === undefined) value = this.makeValue();
        return new Promise(function(resolve) {
            resolve(value);
        });
    },

    resolveAsyncAlt: function(Promise, value) {
        if (value === undefined) value = this.makeValue();
        return new Promise(function(resolve) {
            setImmediate(function() {
                resolve(value);
            });
        });
    },

    rejectSyncAlt: function(Promise, err) {
        if (err === undefined) err = this.makeError();
        return new Promise(function(resolve, reject) { // jshint ignore:line
            reject(err);
        });
    },

    rejectAsyncAlt: function(Promise, err) {
        if (err === undefined) err = this.makeError();
        return new Promise(function(resolve, reject) { // jshint ignore:line
            setImmediate(function() {
                reject(err);
            });
        });
    },

    /*
     * Set of functions to create promises which resolve or reject either synchronously or asynchronously.
     * Promises are created from main Promise constructor.
    */
    resolveSync: function(value) {
        return this.resolveSyncAlt(this.Promise, value);
    },

    resolveAsync: function(value) {
        return this.resolveAsyncAlt(this.Promise, value);
    },

    rejectSync: function(err) {
        return this.rejectSyncAlt(this.Promise, err);
    },

    rejectAsync: function(err) {
        return this.rejectAsyncAlt(this.Promise, err);
    },

    /*
     * Set of functions to create functions which return promises/values/throw error.
     */
    resolveSyncMethod: function(Promise, value) {
        var self = this;
        return function() {
    		return self.resolveSyncAlt(Promise, value);
    	};
    },

    resolveAsyncMethod: function(Promise, value) {
        var self = this;
        return function() {
    		return self.resolveAsyncAlt(Promise, value);
    	};
    },

    rejectSyncMethod: function(Promise, err) {
        var self = this;
        return function() {
    		return self.rejectSyncAlt(Promise, err);
    	};
    },

    rejectAsyncMethod: function(Promise, err) {
        var self = this;
        return function() {
    		return self.rejectAsyncAlt(Promise, err);
    	};
    },

    literalMethod: function(value) {
        if (value === undefined) value = this.makeValue();
        return function() {
    		return value;
    	};
    },

    throwMethod: function(err) {
        if (err === undefined) err = this.makeError();
        return function() {
    		throw err;
    	};
    }
};
