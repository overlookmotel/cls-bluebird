'use strict';

/*
 * cls-bluebird
 * Function to shim `Promise.join`.
 * In bluebird v2 + v3, the callback on may be called sync or async.
 * This shim only binds the callback if it's run async.
 */

// Modules
var shimmer = require('shimmer');

// Exports

/**
 * Patch method to run callbacks in current CLS context.
 *
 * @param {string} methodName - method name
 * @param {Function} Promise - Bluebird Promise constructor to patch
 * @param {Object} ns - CLS namespace to bind callbacks to
 * @returns {undefined}
 */
module.exports = function(Promise, ns) {
    shimmer.wrap(Promise, 'join', function(original) {
        return function() {
            var syncStatus = {sync: true};

            if (arguments.length && typeof arguments[arguments.length - 1] === 'function') {
                arguments[arguments.length - 1] = bind(arguments[arguments.length - 1], ns, syncStatus);
            }

            var result = original.apply(this, arguments);
            syncStatus.sync = false;
            return result;
        };
    });
};

/**
 * Return function which is original wrapped so runs bound to CLS context if called async.
 *
 * @param {Function} fn - Function to wrap
 * @param {Object} ns - CLS namespace to bind callbacks to
 * @param {Object} syncStatus - Sync status object with property `sync`
 * @returns {Function} - Wrapped function
 */
function bind(fn, ns, syncStatus) {
    // Get current CLS context
    var context = ns.active;

    // Create proxy which calls the original function, or bound function
    // depending on whether called sync or async
    var bound = false;
    return function() {
        if (!bound && !syncStatus.sync) {
            bound = true;
            fn = ns.bind(fn, context);
        }
        return fn.apply(this, arguments);
    };
}
