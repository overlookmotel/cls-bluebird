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
			// NB If `generatorFunction` is not a function, do not alter it.
			// Pass value directly to bluebird which will throw an error.
			if (typeof generatorFunction === 'function') {
				// Create proxy generator function
				var generatorFunctionOriginal = generatorFunction;
				generatorFunction = function() {
					// Create generator from generator function
					var generator = generatorFunctionOriginal.apply(this, arguments);

					// Bind `.next()`, '.throw()' and `.return()` to current CLS context.
					// NB CLS context is from when coroutine is called, not when created.
					['next', 'throw', 'return'].forEach(function(name) {
						if (typeof generator[name] === 'function') generator[name] = ns.bind(generator[name]);
					});

					return generator;
				};
			}

			return original.call(this, generatorFunction, options);
		};
	});
};
