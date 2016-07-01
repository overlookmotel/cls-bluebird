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
     * @params {Object} [options] - Options object
     * @param {boolean} options.valuesOnly - If true, skips throwand undefined handler tests
     * @param {boolean} options.catches - true if method catches rejected promises e.g. `promise.catch()`
     * @returns {undefined}
     */
    // TODO these test cases should provide the promise to `fn` rather than expect `fn` to create promise
    // TODO multiply test cases by whether base promise is sync/async resolved/rejected
    // TODO use `catches` option (i.e. whether rejected promises should trigger `handler` to run)
    // TODO use handler to throw not promise errors (i.e. ensure `done` only called once and no sync throwing)
    testSetMethodReturnsPromise: function(fn, options) {
        var u = this;
        options = options || {};

    	it('literal value', function(done) {
    		var p = fn(u.literalMethod());
    		u.throwIfNotPromise(p);
    		u.addThen(p, done);
    	});

        if (!options.valuesOnly) {
            // TODO remove addCatch() call?
        	it('thrown error', function(done) {
    			var err = u.makeError();
    			var p = fn(u.throwMethod(err));
    			u.throwIfNotPromise(p);
    			u.addCatch(p, err, done);
    		});

            /*
            // TODO make this work
            it('undefined handler', function(done) {
                var p = fn(undefined);
    			u.throwIfNotPromise(p);
    			u.addThen(p, done);
            });
            */
    	}

    	u.altPromises.forEach(function(altPromiseParams) {
    		var name = altPromiseParams.name,
    			AltPromise = altPromiseParams.Promise;

            var _describe = (AltPromise ? describe : describe.skip);
    		_describe(name, function() {
    			it('resolved sync', function(done) {
    				var p = fn(u.resolveSyncMethod(AltPromise));
    				u.throwIfNotPromise(p);
    				u.addThen(p, done);
    			});

    			it('resolved async', function(done) {
    				var p = fn(u.resolveAsyncMethod(AltPromise));
    				u.throwIfNotPromise(p);
    				u.addThen(p, done);
    			});

                // TODO remove addCatch() call?
    			it('rejected sync', function(done) {
    				var err = u.makeError();
    				var p = fn(u.rejectSyncMethod(AltPromise, err));
    				u.throwIfNotPromise(p);
    				u.addCatch(p, err, done);
    			});

                // TODO remove addCatch() call?
    			it('rejected async', function(done) {
                    var err = u.makeError();
    				var p = fn(u.rejectAsyncMethod(AltPromise, err));
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
    	}, {valuesOnly: true});
    }
};
