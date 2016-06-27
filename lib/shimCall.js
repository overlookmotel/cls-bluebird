'use strict';

/*
 * cls-bluebird
 * Function to shim `Promise.prototype.call`
 */

// Modules
var shimmer = require('shimmer');

// Exports

var _hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Patch `call` method to run callbacks in current CLS context.
 *
 * @param {Function} Promise - Bluebird Promise constructor to patch
 * @param {Object} ns - CLS namespace to bind callbacks to
 * @returns {undefined}
 */
var arraySlice = Array.prototype.slice;

module.exports = function(Promise, ns) {
    // Patch method
    shimmer.wrap(Promise.prototype, 'call', function(callOriginal) {
        return function() {
            // Temporarily wrap `this._then` to bind the object method to current CLS context
            // (`this.call()` will call `this._then()` synchronously)
            var _thenOriginal = this._then,
                fromPrototype = _hasOwnProperty.call(this, '_then');

            this._then = function() {
                var args = arraySlice.call(arguments);
                args[0] = ns.bind(arguments[0]);
                return _thenOriginal.apply(this, args);
            };

            // call original `call` method
            var result = callOriginal.apply(this, arguments);

            // unwrap `this._then` again
            if (fromPrototype) {
                delete this._then;
            } else {
                this._then = _thenOriginal;
            }

            // return result from `call()`
            return result;
        };
    });
};

/*
// a simpler alternative which does not handle errors if obj[methodName] does not exist quite the same as bluebird
shimmer.wrap(Promise.prototype, 'call', function() {
    return function(methodName) {
        return this.then(function(obj) {
            return obj[methodName].call(obj, arguments);
        });
    };
});
*/
