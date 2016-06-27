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
            fn = bind(fn, ns);
            return original.call(this, promises, fn, options, _filter);
        };
    });

    // Patch prototype method
    shimmer.wrap(Promise.prototype, methodName, function(original) {
        return function(fn, options) {
            fn = bind(fn, ns);
            return original.call(this, fn, options);
        };
    });
};

/**
 * Return function which is original wrapped so runs bound to CLS context if called async.
 *
 * @param {Function} fn - Function to wrap
 * @param {Object} ns - CLS namespace to bind callbacks to
 * @returns {Function} - Wrapped function
 */
function bind(fn, ns) {
    // Ignore input which is not a function
    if (typeof fn !== 'function') return fn;

    // Create copy of function bound to current CLS context
    var boundFn = ns.bind(fn);

    // Create proxy which calls the original function, or bound function
    // depending on whether called sync or async
    var sync = true;

    var outputFn = function() {
        if (sync) return fn.apply(this, arguments);
        return boundFn.apply(this, arguments);
    };

    sync = false;

    return outputFn;
}
