/*
 * cls-bluebird tests
 * Utilities constructor
 */

// Modules
var _ = require('lodash');

// Imports
var addCtors = require('./ctors'),
    test = require('./test'),
    promises = require('./promises'),
    checks = require('./checks'),
    testSetsGroups = require('./testSets/groups'),
    testSetsPromise = require('./testSets/promise'),
    testSetsSyncAsync = require('./testSets/syncAsync'),
    testSetsBinding = require('./testSets/binding');

// Constants
var REJECT_STATUS_KEY = '__clsBluebirdTestRejectStatus';

// Exports
function Utils(Promise, UnpatchedPromise, ns, altPromises, bluebirdVersion) {
    this.Promise = Promise;
    this.UnpatchedPromise = UnpatchedPromise;
    this.ns = ns;
    this.altPromises = altPromises;
    this.bluebirdVersion = bluebirdVersion;

    addCtors(this);
}

// Define initial value for `nextId`, used by `.runInContext()`
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
     * Execute function synchronously or later dependng on condition.
     * If `later == true` schedules function to run in next tick.
     * Otherwise, executes function synchronously.
     * If scheduling for later and `suppress == true` also suppresses unhandled rejections on promise.
     *
     * @param {Function} fn - Function to execute
     * @param {boolean} later - true if to run in next tick, false if to run now
     * @param {Promise} promise - Promise
     * @returns {undefined}
     */
    execAsyncIf: function(fn, later, promise) {
        var u = this;
        if (later) {
            if (u.getRejectStatus(promise)) u.suppressUnhandledRejections(promise);
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
     * Get rejection status of promise.
     * @param {Promise} - Promise to get status of
     * @returns {boolean} - true if rejecting, false if not
     */
    getRejectStatus: function(promise) {
        return !!promise[REJECT_STATUS_KEY];
    },

    /**
     * Set rejection status of promise as rejecting.
     * @param {Promise} - Promise to set status of
     * @returns {Promise} - Input promise
     */
    setRejectStatus: function(promise) {
        promise[REJECT_STATUS_KEY] = true;
        return promise;
    },

    /**
     * Inherit rejection status from one promise to another.
     * @param {Promise} target - Target promise
     * @param {Promise} source - Source promise
     * @returns {Promise} - Target promise
     */
    inheritRejectStatus: function(target, source) {
        target[REJECT_STATUS_KEY] = !!source[REJECT_STATUS_KEY];
        return target;
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
_.extend(Utils.prototype, test);
_.extend(Utils.prototype, promises);
_.extend(Utils.prototype, checks);
_.extend(Utils.prototype, testSetsGroups);
_.extend(Utils.prototype, testSetsPromise);
_.extend(Utils.prototype, testSetsSyncAsync);
_.extend(Utils.prototype, testSetsBinding);

module.exports = Utils;
