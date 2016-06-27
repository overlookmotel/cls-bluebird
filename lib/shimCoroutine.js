'use strict';

/*
 * cls-bluebird
 * Function to shim `Promise.coroutine`
 */

// Modules
var shimmer = require('shimmer');

// Exports

/**
 * Patch `Promise.coroutine` or `Promise.spawn` to maintain current CLS context after all `yield` statements.
 *
 * @param {string} methodName - method name (either 'coroutine' or 'spawn')
 * @param {Function} Promise - Bluebird Promise constructor to patch
 * @param {Object} ns - CLS namespace to bind callbacks to
 * @returns {undefined}
 *
 * TODO make sure this works!
 */
module.exports = function(methodName, Promise, ns) {
    // Patch method
    shimmer.wrap(Promise, methodName, function(original) {
        return function(generatorFunction, options) {
            // NB If `generatorFunction` is not a function, does not create proxy.
            // Passes it directly to bluebird which will throw an error.
            if (typeof generatorFunction === 'function') {
                // Create proxy generator function
                var generatorFunctionOriginal = generatorFunction;
                generatorFunction = function() {
                    // Create generator from generator function
                    var generator = generatorFunctionOriginal.apply(this, arguments);

                    // Return proxy generator which binds `.next()` and `.throw()` to current CLS context
                    // NB CLS context is from when coroutine is called, not when created
                    return {
                        next: ns.bind(generator.next.bind(generator)),
                        throw: ns.bind(generator.throw.bind(generator)),
                    };
                };
            }

            return original.call(this, generatorFunction, options);
        };
    });
};

/*
// beginnings of an alternative approach - I think unneccesary and approach above should work fine
return {
    next: function(value) {
        var result = generator.next(value);
        if (result.done) return result;

        // if promise or thenable, convert to bluebird promise
        if (!(result instanceof Promise)) {
            if (isObject(result) && typeof result.then === 'function') {
                // is a thenable - convert to a promise
                result = Promise.resolve(result);
            } else {
                // not a promise or a thenable - return as is
                return result;
            }
        }

        // add _proxy handler to bind CLS
        // TODO write this
        //result._proxy = function() {};

        return result;
    },
    throw: function(reason) {
        return generator.throw(reason);
    }
};
*/
/*
function isObject(value) {
    return typeof value === 'function' || typeof value === 'object' && value !== null;
}
*/
