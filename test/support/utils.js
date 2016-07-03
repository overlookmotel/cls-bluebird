/*
 * cls-bluebird tests
 * Utilities constructor
 */

/* global it */

// Modules
var _ = require('lodash');

// Imports
var promises = require('./promises'),
    checks = require('./checks'),
    testSetsGroups = require('./testSets/groups'),
    testSetsPromise = require('./testSets/promise'),
    testSetsSyncAsync = require('./testSets/syncAsync'),
    testSetsBinding = require('./testSets/binding');

// Constants
var IT_MULTIPLE_ROUNDS = 3;

// Exports
function Utils(Promise, UnpatchedPromise, ns, altPromises, bluebirdVersion) {
    this.Promise = Promise;
    this.UnpatchedPromise = UnpatchedPromise;
    this.ns = ns;
    this.altPromises = altPromises;
    this.bluebirdVersion = bluebirdVersion;
}

var nextId = 1;

Utils.prototype = {
    /**
     * Create a CLS context and run function within it.
     * Context is created with a unique `_id` attribute within it.
     * `fn` is called with the CLS context object as argument.
     *
     * @param {Object} ns - CLS namespace to run within
     * @param {Function} fn - Function to execute within context
     * @returns {*} - Return value of `fn()`
     */
    runInContext: function(fn) {
        var u = this;
        return u.runAndReturn(function(context) {
            var id = nextId;
            u.ns.set('_id', id);
            nextId++;

            return fn(context);
        });
    },

    /**
     * Creates CLS context and runs a function within it.
     * Like `ns.run(fn)` but returns the return value of `fn` rather than the context object.
     * `fn` is called with the CLS context object as argument.
     *
     * @param {Function} fn - Function to execute within context
     * @returns {*} - Return value of `fn()`
     */
    runAndReturn: function runAndReturn(fn) {
        var u = this;
        var value;
        u.ns.run(function(context) {
            value = fn(context);
        });
        return value;
    },

    /**
     * Test runner function, replacement for mocha's `it()`.
     * Calls mocha's 'it()' to create test case.
     *
     * Test function is called with `done` and `error` arguments.
     * `error()` registers an error. Call with an error object.
     * `done()` finishes the test and calls mocha's `it` done callback with any error that's been registered.
     *
     * `done` should be called with arguments:
     *   - {Promise} promise - Promise to await resolution of to finish test
     *   - {Error} [expectedErr] - Error expect `promise` to reject with, undefined if expect `promise` to resolve
     *   - {Function} [final] - Function to run once promise has resolved just before ending test
     *
     * @param {string} name - Test name
     * @param {Function} fn - Test function
     * @returns {undefined}
     */
    it: function(name, fn) {
        var u = this;
        it(name, function(done) {
            u._it(fn, done);
        });
    },

    /**
     * Same as`u.it()` but runs the test in parallel multiple times.
     * If all test runs pass, executes callback with no error.
     * If any test run fails, executes callback with first error received.
     * Waits for all test runs to complete before calling callback, even if an error is encountered.
     *
     * Test function is called with `done` and `error` arguments.
     * `error()` registers an error. Call with an error object.
     * `done()` finishes the test and calls `cb()` callback with any error that's been registered.
     *
     * `done` should be called with arguments:
     *   - {Promise} promise - Promise to await resolution of to finish test
     *   - {Error} [expectedErr] - Error expect `promise` to reject with, undefined if expect `promise` to resolve
     *   - {Function} [final] - Function to run once promise has resolved just before ending test
     *
     * @param {string} name - Name of test
     * @param {Function} fn - Test function
     * @returns {undefined}
     */
    itMultiple: function(name, fn) {
        var u = this;
    	it(name, function(mochaDone) {
    		// Run `fn` multiple times
    		var done = u.callbackAggregator(IT_MULTIPLE_ROUNDS, mochaDone);

    		for (var i = 0; i < IT_MULTIPLE_ROUNDS; i++) {
                u._it(fn, done);
    		}
        });
    },

    /**
     * Calls test function with arguments `(done, error)`.
     * `error()` registers an error. Call with an error object.
     * `done()` finishes the test and calls `cb()` callback with any error that's been registered.
     *
     * `done` should be called with arguments:
     *   - {Promise} promise - Promise to await resolution of to finish test
     *   - {Error} [expectedErr] - Error expect `promise` to reject with, undefined if expect `promise` to resolve
     *   - {Function} [final] - Function to run once promise has resolved just before ending test
     *
     * @private
     * @param {Function} fn - Test function
     * @param {Function} cb - Callback to call on completion
     * @returns {undefined}
     */
    _it: function(fn, cb) {
        var err;
        var error = function(thisErr) {
            if (thisErr && !err) err = thisErr;
        };

        var done = function(promise, expectedErr, final) {
            promise.then(function() {
                if (final) final();
                if (expectedErr) error(new Error('Promise should not be resolved'));
                cb(err);
            }, function(rejectedErr) {
                if (final) final();
                if (!expectedErr || rejectedErr !== expectedErr) error(rejectedErr || new Error('Empty rejection'));
                cb(err);
            });
        };

        try {
            fn(done, error);
        } catch (err) {
            cb(err);
        }
    },

    /**
     * Same as mocha's `it()` but runs the test in parallel multiple times.
     * If all test runs pass, executes callback with no error.
     * If any test run fails, executes callback with first error received.
     * Waits for all test runs to complete before calling callback, even if an error is encountered.
     * Test functions are passed `cb` argument which must be called at end of test run.
     *
     * @param {string} name - Name of test
     * @param {Function} fn - Test function
     * @returns {undefined}
     */
    // Not used. TODO remove this!
    itMultipleMocha: function(name, fn) {
        var u = this;
    	it(name, function(mochaDone) {
    		// Run `fn` multiple times
    		var done = u.callbackAggregator(IT_MULTIPLE_ROUNDS, mochaDone);

    		for (var i = 0; i < IT_MULTIPLE_ROUNDS; i++) {
    			try {
    				fn.call(this, done);
    			} catch (err) {
    				done(err);
    			}
    		}
        });
    },

    /**
     * Make a callback function which calls superior callback when it's been called a number of times.
     * If called with no errors on any occasion, calls callback with no error.
     * If called with an error on any occasion, executes callback with first error.
     * Waits to be called expected number of times before calling callback, even if receives an early error.
     * (i.e. does not call superior callback immediately on receipt of an error)
     *
     * @param {number} numCallbacks - Number of times expects callback to be called
     * @param {Function} cb - Superior callback to be called with aggregate result
     * @returns {Function} - Callback function
     */
    callbackAggregator: function(numCallbacks, cb) {
    	var err;

    	return function(thisErr) {
    		if (thisErr && !err) err = thisErr;
    		numCallbacks--;
    		if (!numCallbacks) cb(err);
    	};
    },

    /**
     * Execute function synchronously or later dependng on condition.
     * If `later == true` schedules function to run in next tick.
     * Otherwise, executes function synchronously.
     * If scheduling for later and `suppress == true` also suppresses unhandled rejections on promise.
     *
     * @param {Function} fn - Function to execute
     * @param {boolean} later - true if to run in next tick, false if to run now
     * @param {Promise} promise - Promise
     * @param {boolean} suppress - true to suppress unhandled rejections (only if `later == true` too)
     * @returns {undefined}
     */
    execAsyncIf: function(fn, later, promise, suppress) {
        var u = this;
        if (later) {
            if (suppress) u.suppressUnhandledRejections(promise);
            u.awaitPromise(promise, fn);
        } else {
            fn();
        }
    },

    /**
     * Run function and pass return value/thrown error to node-style callback function.
     * If function returns a value, this is passed to callback is 2nd arg.
     * If function throws an error, this is passed to callback as 1st arg.
     *
     * @param {Function} fn - Function to execute
     * @param {Function} cb - Callback function to call with result
     * @returns {undefined}
     */
    toCallback: function(fn, cb) {
    	var result;
    	try {
    		result = fn();
    	} catch (err) {
    		cb(err);
    		return;
    	}
    	cb(null, result);
    },

    /**
     * Await resolution of promise and call callback when resolved.
     * Always calls callback asynchronously even if promise is resolved at start.
     *
     * @param {Promise} promise - Promise to watch
     * @param {Function} cb - Callback function called when promise is resolved
     * @returns {undefined}
     */
    awaitPromise: function(promise, cb) {
        (function checkResolved() {
            setImmediate(function() {
                if (!promise.isPending()) {
                    cb();
                    return;
                }
                checkResolved();
            });
        })();
    },

    /**
     * Attach empty catch handler to promise to prevent unhandled rejections
     * @param {Promise} promise - Promise to attach catch handler to
     * @returns {undefined}
     */
    suppressUnhandledRejections: function(promise) {
    	promise.catch(function() {});
    }
};

// mixins
_.extend(Utils.prototype, promises);
_.extend(Utils.prototype, checks);
_.extend(Utils.prototype, testSetsGroups);
_.extend(Utils.prototype, testSetsPromise);
_.extend(Utils.prototype, testSetsSyncAsync);
_.extend(Utils.prototype, testSetsBinding);

module.exports = Utils;
