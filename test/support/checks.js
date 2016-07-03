/*
 * cls-bluebird tests
 * Utilities
 * Functions to check conditions are true and return nothing/error to `done` callback.
 * Mixin to Utils prototype.
 */

// Exports

module.exports = {
    /**
     * Run a function and check it calls back a handler synchronously.
     * `fn` is called immediately, and passed a handler.
     * If handler is called synchronously, `done` callback is called without error.
     * If handler is called asynchronously, `done` callback is called with an error.
     *
     * @param {Function} fn - Function to run.
     * @param {Function} done - Final callback to call with result
     * @returns {undefined}
     */
    checkSync: function(fn, done) {
        var u = this;
    	var sync = true;
    	var handler = function() {
    		u.toCallback(function() {
    			if (!sync) throw new Error('Called asynchronously');
    		}, done);
    	};

    	fn(handler);
    	sync = false;
    },

    /**
     * Runs a function and checks it calls back a handler asynchronously.
     * `fn` is called immediately, and passed a handler.
     * If handler is called asynchronously, `done` callback is called without error.
     * If handler is called synchronously, `done` callback is called with an error.
     *
     * @param {Function} fn - Function to run.
     * @param {Function} done - Final callback to call with result
     * @returns {undefined}
     */
    checkAsync: function(fn, done) {
        var u = this;
    	var sync = true;
    	var handler = function() {
    		u.toCallback(function() {
    			if (sync) throw new Error('Called synchronously');
    		}, done);
    	};

    	fn(handler);
    	sync = false;
    },

    /**
     * Runs a function and checks that when it calls back a handler, the handler has not been bound to a CLS context.
     * `fn` is called immediately, and passed a handler.
     * If handler is not bound, `done` callback is called without error.
     * If handler is bound, `done` callback is called with an error.
     *
     * @param {Function} fn - Function to run.
     * @param {Function} done - Final callback to call with result
     * @returns {undefined}
     */
    checkNotBound: function(fn, done) {
        var u = this;
    	var handler = function() {
    		u.toCallback(function() {
    			u.throwIfBound(handler);
    		}, done);
    	};

    	fn(handler);
    },

    /**
     * Runs a function and checks that when it calls back a handler, the handler has been bound to CLS context.
     * `fn` is called immediately, and passed a handler.
     *
     * Checks:
     *   - Handler is bound to correct context
     *   - Handler is bound exactly once, synchronously after handler attached
     *   - Handler is not bound again before handler is executed (asynchronously)
     *
     * If all checks pass, `done` callback is called without error.
     * If any check fails, `done` callback is called with an error.
     *
     * @param {Function} fn - Function to run.
     * @param {Function} done - Final callback to call with result
     * @returns {undefined}
     */
    checkBound: function(fn, context, done) {
        var u = this;
        var err;
    	var handler = function() {
    		u.toCallback(function() {
    			// Throw if was not bound synchronously
    			if (err) throw err;

    			// Throw if not bound at time handler called
    			u.throwIfNotBound(handler, context);
    		}, done);
    	};

    	// Run function, passing handler
    	fn(handler);

    	// Check if bound synchronously and set `err` to Error object if not
    	err = u.returnErrIfNotBound(handler, context);
    },

    /**
     * Runs a function and checks that when it calls back a handler, the handler runs within correct CLS context.
     * `fn` is called immediately, and passed a handler.
     *
     * `done` callback is called with/without error if is/isn't in right context.
     *
     * @param {Function} fn - Function to run.
     * @param {Function} done - Final callback to call with result
     * @returns {undefined}
     */
    checkRunContext: function(fn, context, done) {
        var u = this;
        var handler = function() {
    		u.toCallback(function() {
                if (u.ns.active !== context) throw new Error('Function run in wrong context (expected: ' + JSON.stringify(context) + ', got: ' + JSON.stringify(u.ns.active) + ')');
    		}, done);
    	};

    	// Run function, passing handler
    	fn(handler);
    },

    /**
     * Checks provided function has not been bound to a CLS context.
     * Throws error if it has been bound.
     *
     * @param {Function} fn - Function to check
     * @returns {undefined}
     * @throws {Error} - If has been bound
     */
    throwIfBound: function(fn) {
        var u = this;
    	var err = u.returnErrIfBound(fn);
        if (err) throw err;
    },

    /**
     * Checks provided function has not been bound to a CLS context.
     * Calls callback with error if it has been bound.
     *
     * @param {Function} fn - Function to check
     * @param {Function} cb - Function to call with error if not bound
     * @returns {undefined}
     */
    callbackIfBound: function(fn, cb) {
        var u = this;
    	var err = u.returnErrIfBound(fn);
        if (err) cb(err);
    },

    /**
     * Checks provided function has not been bound to a CLS context.
     * Returns error object if it has been bound.
     *
     * @param {Function} fn - Function to check
     * @returns {Error|undefined} - Error if bound, undefined if has not
     */
    returnErrIfBound: function(fn) {
        if (fn._bound) return new Error('Function bound');
    },

    /**
     * Checks provided function has been bound to a CLS context exactly once.
     * Throws error if not.
     *
     * @param {Function} fn - Function to check
     * @param {Object} context - CLS context object which `fn` should be bound to
     * @returns {undefined}
     * @throws {Error} - If not been bound correctly
     */
    throwIfNotBound: function(fn, context) {
        var u = this;
    	var err = u.returnErrIfNotBound(fn, context);
        if (err) throw err;
    },

    /**
     * Checks provided function has been bound to a CLS context exactly once.
     * Calls callback with error if not.
     *
     * @param {Function} fn - Function to check
     * @param {Object} context - CLS context object which `fn` should be bound to
     * @param {Function} cb - Function to call with error if not bound
     * @returns {undefined}
     */
    callbackIfNotBound: function(fn, context, cb) {
        var u = this;
    	var err = u.returnErrIfNotBound(fn, context);
        if (err) cb(err);
    },

    /**
     * Checks provided function has been bound to a CLS context exactly once.
     * Returns error object if not.
     *
     * @param {Function} fn - Function to check
     * @param {Object} context - CLS context object which `fn` should be bound to
     * @returns {Error|undefined} - Error if not bound correctly, undefined if fine
     */
    returnErrIfNotBound: function(fn, context) {
        var bound = fn._bound;
    	if (!bound || !bound.length) return new Error('Function not bound');
    	if (bound.length > 1) return new Error('Function bound multiple times (' + bound.length + ')');
    	if (bound[0].context !== context) return new Error('Function bound to wrong context (expected: ' + JSON.stringify(context) + ', got: ' + JSON.stringify(bound[0].context) + ')');
    },

    /**
     * Checks provided promise is a Promise and instance of main Bluebird constructor.
     * Throws error if not.
     *
     * @param {*} promise - Promise to check
     * @returns {undefined}
     * @throws {Error} - If not correct Promise
     */
    throwIfNotPromise: function(promise) {
        var u = this;
    	var err = u.returnErrIfNotPromise(promise);
        if (err) throw err;
    },

    /**
     * Checks provided promise is a Promise and instance of main Bluebird constructor.
     * Calls callback with error if not.
     *
     * @param {*} promise - Promise to check
     * @param {Function} cb - Function to call with error if not correct promise
     * @returns {undefined}
     */
    callbackIfNotPromise: function(promise, cb) {
        var u = this;
    	var err = u.returnErrIfNotPromise(promise);
        if (err) cb(err);
    },

    /**
     * Checks provided promise is a Promise and instance of main Bluebird constructor.
     * Returns error object if not.
     *
     * @param {*} promise - Promise to check
     * @returns {Error|undefined} - Error if not correct Promise, undefined if fine
     */
    returnErrIfNotPromise: function(promise) {
        var u = this;
        if (!promise || typeof promise.then !== 'function') return new Error('Did not return promise');
        if (!(promise instanceof u.Promise)) return new Error('Did not return promise from correct constructor');
    }
};
