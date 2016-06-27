/*
 * cls-bluebird tests
 * Create a CLS namespace
 */

// Imports
var cls = require('continuation-local-storage'),
	shimmer = require('shimmer');

// Create CLS namespace
var ns = cls.createNamespace('test');
module.exports = ns;

/*
 * Shim namespace's `bind()` method to record when a function is bound.
 * The binding is recorded in `_bound` property created on the function.
 * The `_bound` property is an array with each occurance of a binding being added to the array.
 */
shimmer.wrap(ns, 'bind', function(bind) {
	return function(fn) {
		var originalFn = fn._originalFn || fn;

		if (!originalFn._bound) originalFn._bound = [];
		originalFn._bound.push({ns: ns, context: ns.active});

        var fnBound = bind.call(this, fn);

        fnBound._originalFn = originalFn;
		return fnBound;
	};
});

/*
var fnBound = bind.call(this, function() {
	if (originalFn._bound.length > 1 && originalFn !== fn) console.log('Function bound ' + originalFn._bound.length + ' times: ' + originalFn.toString());
	return fn.apply(this, arguments);
});
*/
