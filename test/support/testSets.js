/*
 * cls-bluebird tests
 * Utilities
 * Functions to run a set of tests.
 * Mixin to Utils prototype.
 */

/* global describe, it */

// Exports

module.exports = {
    /*
     * Run set of tests on a method to ensure always returns a promise
     * inherited from correct Promise constructor.
     *
     * Function `fn` should create a promise and call the method being tested to it.
     * `fn` is called with a `handler` function which should be attached as the callback to the method under test.
     * e.g. `Promise.resolve().then(handler)`
     *
     * A different `handler` is provided in each test.
     * Handlers returns a literal value, throw, or return or a promise that resolves/rejects.
     * Promises returned from handlers are instances of various different Promise constructors.
     *
     * @param {Function} fn - Test function
     * @param {boolean} noThrow - If true, skips throw test
     * @returns {undefined}
     */
    testSetMethodReturnsPromise: function(fn, noThrow) {
        var u = this;

    	it('literal value', function(done) {
    		var p = fn(u.literalMethod(), done);
    		u.throwIfNotPromise(p);
    		u.addThen(p, done);
    	});

        // TODO remove addCatch() call?
    	if (!noThrow) {
    		it('thrown error', function(done) {
    			var err = u.makeError();
    			var p = fn(u.throwMethod(err), done);
    			u.throwIfNotPromise(p);
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
    				u.throwIfNotPromise(p);
    				u.addThen(p, done);
    			});

    			it('resolved async', function(done) {
    				var p = fn(u.resolveAsyncMethod(AltPromise), done);
    				u.throwIfNotPromise(p);
    				u.addThen(p, done);
    			});

                // TODO remove addCatch() call?
    			it('rejected sync', function(done) {
    				var err = u.makeError();
    				var p = fn(u.rejectSyncMethod(AltPromise, err), done);
    				u.throwIfNotPromise(p);
    				u.addCatch(p, err, done);
    			});

                // TODO remove addCatch() call?
    			it('rejected async', function(done) {
                    var err = u.makeError();
    				var p = fn(u.rejectAsyncMethod(AltPromise, err), done);
    				u.throwIfNotPromise(p);
    				u.addCatch(p, err, done);
    			});
    		});
    	});
    },

    /*
     * Run set of tests on a value-taking method to ensure always returns a promise
     * inherited from correct Promise constructor.
     *
     * Function `fn` should call the static promise method being tested.
     * `fn` is called with a value `value` which should be the parameter of the method under test.
     * e.g. `Promise.resolve(value)`
     *
     * A different `value` is provided in each test.
     * Values are a literal, or a promise that resolves/rejects.
     * Promises provided as values are instances of various different Promise constructors.
     *
     * @param {Function} fn - Test function
     * @returns {undefined}
     */
    testSetValueReturnsPromise: function(fn) {
        var u = this;
    	u.testSetMethodReturnsPromise(function(handler) {
    		var value = handler();
    		return fn(value);
    	}, true);
    }
};
