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
     *
     * If handler is called synchronously, `t.done()` is called without error.
     * Error is registered on test object and `t.done()` called if either:
     *   - handler is not called
     *   - handler is called asynchronously
     *
     * @param {Function} fn - Function to run.
     * @param {Test} t - Test object
     * @param {boolean} [rejects] - true if promise rejects, false if not
     * @param {Function} [handler] - Optional handler function
     * @returns {undefined}
     */
    checkSync: function(fn, t, rejects, handler) {
        this.checkSyncAsync(fn, true, t, rejects, handler);
    },

    /**
     * Runs a function and checks it calls back a handler asynchronously.
     * `fn` is called immediately, and passed a handler.
     *
     * If handler is called asynchronously, `t.done()` is called without error.
     * Error is registered on test object and `t.done()` called if either:
     *   - handler is not called
     *   - handler is called synchronously
     *
     * @param {Function} fn - Function to run.
     * @param {Test} t - Test object
     * @param {boolean} [rejects] - true if promise rejects, false if not
     * @param {Function} [handler] - Optional handler function
     * @returns {undefined}
     */
    checkAsync: function(fn, t, rejects, handler) {
        this.checkSyncAsync(fn, false, t, rejects, handler);
    },

    /**
     * Runs a function and checks it calls back a handler synchronously or asynchronously.
     * `fn` is called immediately, and passed a handler.
     * Whether expect sync or async callback is defined by `expectSync` argument.
     *
     * If handler is called as expected, `t.done()` is called without error.
     * Error is registered on test object and `t.done()` called if either:
     *   - handler is not called
     *   - handler is called not as expected
     *
     * If `handler` argument is provided to this function, it's executed as part of the handler.
     *
     * @param {Function} fn - Function to run.
     * @param {boolean} expectSync - true if expect callback to be called sync, false if expect async
     * @param {Test} t - Test object
     * @param {boolean} [rejects] - true if promise rejects, false if not
     * @param {Function} [handler] - Handler function
     * @returns {undefined}
     */
    checkSyncAsync: function(fn, expectSync, t, rejects, handler) {
        // Create handler
        var sync = true,
            called = false;

    	var handlerWrapped = function() {
            called = true;
            if (sync !== expectSync) t.error(new Error('Callback called ' + (expectSync ? 'asynchronously' : 'synchronously')));
            if (handler) return handler.apply(this, arguments);
    	};

        // Run test function with handler
    	var p = fn(handlerWrapped);
    	sync = false;

        // Check handler was called
        t.done(p, rejects, function() {
            if (!called) t.error(new Error('Callback not called'));
        });
    },

    /**
     * Runs a function and checks that when it calls back a handler, the handler has not been bound to a CLS context.
     * `fn` is called immediately, and passed a handler.
     * If handler is not bound, `t.done()` is called without error.
     * If handler is bound, error is registered on test object and `t.done()` called.
     *
     * @param {Function} fn - Function to run.
     * @param {Test} t - Test object
     * @param {Function} [handler] - Handler function
     * @returns {undefined}
     */
    checkNotBound: function(fn, t, handler) {
        var u = this;

        // Create handler
        var called = false;

    	var handlerWrapped = function() {
            called = true;
            t.error(u.returnErrIfBound(handlerWrapped));
            if (handler) return handler.apply(this, arguments);
    	};

        // Run test function with handler
    	var p = fn(handlerWrapped);

        // Check handler was called
        t.done(p, null, function() {
            if (!called) t.error(new Error('Callback not called'));
        });
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
     * If all checks pass, `t.done()` is called without error.
     * If any check fails, error is registered on test object and `t.done()` called.
     *
     * @param {Function} fn - Function to run.
     * @param {Object} context - CLS context should be bound to
     * @param {Test} t - Test object
     * @returns {undefined}
     */
    checkBound: function(fn, context, t) {
        var u = this;

        // Create handler
        var called = false;

    	var handler = function() {
            called = true;
            t.error(u.returnErrIfNotBound(handler, context));
    	};

        // Run test function with handler
    	var p = fn(handler);

    	// Check that bound synchronously
    	t.error(u.returnErrIfNotBound(handler, context));

        // Check handler was called
        t.done(p, null, function() {
            if (!called) t.error(new Error('Callback not called'));
        });
    },

    /**
     * Runs a function and checks that when it calls back a handler, the handler runs within correct CLS context.
     * `fn` is called immediately, and passed a handler.
     *
     * `done` callback is called with/without error if is/isn't in right context.
     *
     * @param {Function} fn - Function to run.
     * @param {Function} done - Final callback to finish test
     * @param {Function} error - Callback to call with errors
     * @returns {undefined}
     */
    checkRunContext: function(fn, context, t) {
        var u = this;

        // Create handler
        var called = false;

    	var handler = function() {
            called = true;
            if (u.ns.active !== context) t.error(new Error('Function run in wrong context (expected: ' + JSON.stringify(context) + ', got: ' + JSON.stringify(u.ns.active) + ')'));
    	};

        // Run test function with handler
    	var p = fn(handler);

        // Check handler was called
        t.done(p, null, function() {
            if (!called) t.error(new Error('Callback not called'));
        });
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
