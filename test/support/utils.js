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
    testSetsPromise = require('./testSets/promise'),
    testSetsSyncAsync = require('./testSets/syncAsync'),
    testSetsBinding = require('./testSets/binding');

// Exports

function Utils(Promise, UnpatchedPromise, ns, altPromises) {
    this.Promise = Promise;
    this.UnpatchedPromise = UnpatchedPromise;
    this.ns = ns;
    this.altPromises = altPromises;
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
     * Within test, calls test function with arguments `(done, error)`
     * `error()` registers an error
     * `done()` calls mocha's `it` done callback with any error that's been registered
     *
     * @param {string} name - Test name
     * @param {Function} fn - Test function
     * @returns {undefined}
     */
    it: function(name, fn) {
        it(name, function(done) {
            var err;
            fn(
                // `done` callback
                function(promise, expectedErr) {
                    promise.then(function() {
                        if (expectedErr && !err) err = new Error('Promise should not be resolved');
                        done(err);
                    }, function(rejectedErr) {
                        if (rejectedErr !== expectedErr && !err) err = rejectedErr || new Error('Empty rejection');
                        done(err);
                    });
                },
                // `error` callback
                function(thisErr) {
                    if (thisErr && !err) err = thisErr;
                }
            );
        });
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
_.extend(Utils.prototype, testSetsPromise);
_.extend(Utils.prototype, testSetsSyncAsync);
_.extend(Utils.prototype, testSetsBinding);

module.exports = Utils;
