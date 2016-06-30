/*
 * cls-bluebird tests
 * Utilities constructor
 */

// Modules
var _ = require('lodash');

// Imports
var promises = require('./promises'),
    checks = require('./checks');

// Exports

function Utils(Promise, ns, altPromises) {
    this.Promise = Promise;
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
     * Create callback function to be passed to a Promise method which should never be called.
     * Calls `done` callback with error if called.
     *
     * @param {Function} done - Final callback to call with result
     * @returns {Function} - Created callback function
     */
    makeHandlerBadResolve: function(done) {
    	return function () {
    		done(new Error('Unexpected resolve'));
    	};
    },

    /**
     * Create callback function to be passed to a Promise method which should never be called.
     * Calls `done` callback with error if called.
     *
     * @param {Function} done - Final callback to call with result
     * @returns {Function} - Created callback function
     */
    makeHandlerBadReject: function(done) {
    	return function () {
    		done(new Error('Unexpected reject'));
    	};
    },

    /**
     * Add a then handler to a promise.
     * Calls `done` with no error if resolve handler calls.
     * If reject handler called, calls `done` with the error.
     */
    addThen: function(promise, done) {
    	promise.then(
    		function() {
    			done();
    		},
    		function(err) {
    			done(err);
    		}
    	);
    },

    /**
     * Add a catch handler to a promise.
     * If error is unexpected, calls `done` with the error.
     * Otherwise, calls `done` with no error.
     */
    addCatch: function(promise, expectedErr, done) {
        //console.log('promise:', promise);
    	promise.then(
    		function() {
                done(new Error('Unexpected resolve'));
    		},
    		function(err) {
                if (err === expectedErr) {
                    done();
    			} else {
                    done(err);
    			}
    		}
    	);
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

module.exports = Utils;
