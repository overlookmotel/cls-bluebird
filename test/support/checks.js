/*
 * cls-bluebird tests
 * Utilities
 * Functions to check conditions are true and return nothing/error to `done` callback.
 * Mixin to Utils prototype.
 */

/* global describe, it */

// Modules
var expect = require('chai').expect;

// Exports

module.exports = {
    /**
     * Runs a function and checks it calls back a handler synchronously.
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
    			// throw if was not bound synchronously
    			if (err) throw err;

    			// throw if not bound at time handler called
    			u.throwIfNotBound(handler, context);
    		}, done);
    	};

    	// run function, passing handler
    	fn(handler);

    	// check if bound synchronously and set `err` to Error object if not
    	err = u.returnErrIfNotBound(handler, context);
    },

    /*
     * Executes `fn` several times providing different handlers.
     */
    checkReturnsPromise: function(fn, noThrow) {
        var u = this,
            Promise = u.Promise;

    	it('literal value', function(done) {
    		var p = fn(u.literalMethod(), done);
    		expect(p).to.be.instanceof(Promise);
    		u.addThen(p, done);
    	});

    	if (!noThrow) {
    		it('thrown error', function(done) {
    			var err = u.makeError();
    			var p = fn(u.throwMethod(err), done);
    			expect(p).to.be.instanceof(Promise);
    			u.addCatch(p, err, done);
    		});
    	}

    	u.altPromises.forEach(function(altPromiseParams) {
    		var name = altPromiseParams.name,
    			AltPromise = altPromiseParams.Promise;

            var _describe = (AltPromise ? describe : describe.skip);
    		_describe(name, function() {
    			it('resolved sync', function(done) {
    				var p = fn(u.resolveSyncMethod(AltPromise), done);
    				expect(p).to.be.instanceof(Promise);
    				u.addThen(p, done);
    			});

    			it('resolved async', function(done) {
    				var p = fn(u.resolveAsyncMethod(AltPromise), done);
    				expect(p).to.be.instanceof(Promise);
    				u.addThen(p, done);
    			});

                // TODO remove addCatch() calls?
    			it('rejected sync', function(done) {
    				var err = new Error('foo');
    				var p = fn(u.rejectSyncMethod(AltPromise, err), done);
    				expect(p).to.be.instanceof(Promise);
    				u.addCatch(p, err, done);
    			});

    			it('rejected async', function(done) {
    				var err = new Error('foo');
    				var p = fn(u.rejectAsyncMethod(AltPromise, err), done);
    				expect(p).to.be.instanceof(Promise);
    				u.addCatch(p, err, done);
    			});
    		});
    	});
    },

    /*
     * Executes `fn` several times providing different values.
     */
    checkReturnsPromiseValue: function(fn) {
        var u = this;
    	u.checkReturnsPromise(function(handler) {
    		var value = handler();
    		return fn(value);
    	}, true);
    },

    /**
     * Checks provided function has not been bound to a CLS context, and throws if it has.
     *
     * @param {Function} fn - Function to check
     * @returns {undefined}
     * @throws {Error} - If has been bound
     */
    throwIfBound: function(fn) {
    	if (fn._bound) throw new Error('Function bound');
    },

    /**
     * Checks provided function has been bound to a CLS context exactly once, and throws if not.
     *
     * @param {Function} fn - Function to check
     * @returns {undefined}
     * @throws {Error} - If not been bound correctly
     */
    throwIfNotBound: function(fn, context) {
        var u = this;
    	var err = u.returnErrIfNotBound(fn, context);
        if (err) throw err;
    },

    /**
     * Checks provided function has been bound to a CLS context exactly once, and returns error object if not.
     *
     * @param {Function} fn - Function to check
     * @returns {Error|undefined} - Error if not bound correctly, undefined if fine
     */
    returnErrIfNotBound: function(fn, context) {
        var bound = fn._bound;
    	if (!bound || !bound.length) return new Error('Function not bound');
    	if (bound.length > 1) return new Error('Function bound multiple times (' + bound.length + ')');
    	if (bound[0].context !== context) return new Error('Function bound to wrong context (expected: ' + JSON.stringify(context) + ', got: ' + JSON.stringify(bound[0].context) + ')');
    }
};
