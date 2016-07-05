/*
 * cls-bluebird tests
 * Utilities
 * Test functions.
 * Mixin to Utils prototype.
 */

/* global it */

// Constants
var TEST_MULTIPLE_ROUNDS = 3;

// Exports
module.exports = {
	/**
	 * Register `it()` test with mocha which will run test function.
	 * Test function is passed a Test object with `.error()` and `.done()` methods.
	 * Like mocha's `it()` except passes a Test object rather than callback to the test function.
	 *
	 * @param {string} name - Test case name
	 * @param {Function} fn - Test function
	 * @returns {undefined}
     */
	test: function(name, fn) {
		it(name, function(done) {
            runTest(fn, done);
        });
	},

	/**
     * Same as`u.test()` but runs the test in parallel multiple times.
     * If all test runs pass, executes callback with no error.
     * If any test run fails, executes callback with first error received.
     * Waits for all test runs to complete before calling callback, even if an error is encountered.
     *
	 * Test function is passed a Test object with `.error()` and `.done()` methods.
     *
     * @param {string} name - Name of test
     * @param {Function} fn - Test function
     * @returns {undefined}
     */
	testMultiple: function(name, fn) {
		it(name, function(done) {
    		done = callbackAggregator(TEST_MULTIPLE_ROUNDS, done);

    		for (var i = 0; i < TEST_MULTIPLE_ROUNDS; i++) {
                runTest(fn, done);
    		}
        });
	}
};

/**
 * Run a test function.
 * `fn` is called with a Test object, bound to provided `done` callback.
 * If test function throws, error is passed to `done` callback.
 * Otherwise completion of test is controlled by Test object's `.done()` method.
 *
 * @param {Function} fn - Test function
 * @param {Function} done - Callback function
 */
function runTest(fn, done) {
	var t = new Test(done);
	try {
		fn(t);
	} catch (err) {
		done(err);
	}
}

/**
 * Return a callback function which calls superior callback when it's been called a number of times.
 * If called with no errors on any occasion, calls callback with no error.
 * If called with an error on any occasion, executes callback with first error.
 * Waits to be called expected number of times before calling callback, even if receives an early error.
 * (i.e. does not call superior callback immediately on receipt of an error)
 *
 * @param {number} numCallbacks - Number of times expects callback to be called
 * @param {Function} cb - Superior callback to be called with aggregate result
 * @returns {Function} - Callback function
 */
function callbackAggregator(numCallbacks, cb) {
	var err;

	return function(thisErr) {
		if (thisErr && !err) err = thisErr;
		numCallbacks--;
		if (!numCallbacks) cb(err);
	};
}

/**
 * Test object constructor.
 * @constructor
 * @param {Function} done - Callback to be called when test is complete (i.e. `test.done()` is called)
 */
function Test(done) {
	this._done = done;
}

Test.prototype = {
	/**
	 * Register error.
	 * If called with a value, it is registered as error for the test.
	 * (if an error is already registered, it is ignored - 1st error takes precedence)
	 * @param {Error|undefined}
	 * @returns {undefined}
	 */
	error: function(err) {
		if (err !== undefined && !this._err) this._err = err;
	},

	/**
	 * Completes test.
	 * @param {Promise} promise - Test completes when this promise settles
	 * @param {Error|undefined} [expectedErr] - If promise is expected to reject, the error it should reject with.
	 *        If promise expected to resolve without error, should be `undefined`
	 * @param {Function} [final] - Function to execute after promise settles but before test completes.
	 *        Last chance to register an error e.g. an event should have happened before this point but didn't.
	 * @returns {undefined}
	 */
	done: function(promise, expectedErr, final) {
		var test = this;
		promise.then(function() {
			if (final) final();
			if (expectedErr !== undefined) test.error(new Error('Promise should not be resolved'));
			test._done(this._err);
		}, function(err) {
			if (final) final();
			if (expectedErr === undefined || err !== expectedErr) test.error(err || new Error('Empty rejection'));
			test._done(this._err);
		});
	}
};
