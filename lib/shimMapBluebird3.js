'use strict';

/*
 * cls-bluebird
 * Function to shim `Promise.map` + `.map` or `Promise.filter` + `.filter` on bluebird v3.
 * In bluebird v3, callbacks on these methods may be called sync or async.
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
module.exports = function(methodName, Promise, ns) {
    // Patch static method
    shimmer.wrap(Promise, methodName, function(original) {
        return function(promises, fn, options, _filter) {
            var syncStatus = {sync: true};

            fn = bind(fn, ns, syncStatus);

            var result = original.call(this, promises, fn, options, _filter);
            syncStatus.sync = false;
            return result;
        };
    });

    // Patch prototype method
    shimmer.wrap(Promise.prototype, methodName, function(original) {
        return function(fn, options) {
            var syncStatus = {sync: true};

            fn = bind(fn, ns, syncStatus);

            var result = original.call(this, fn, options);
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
    // Ignore input which is not a function
    if (typeof fn !== 'function') return fn;

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
