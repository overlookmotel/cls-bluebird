/*
 * cls-bluebird tests
 * Function to test all methods are patched
 */

/* global describe, it */

// Modules
var _ = require('lodash');

// Exports

module.exports = function(Promise) {
    describe('patched', function() {
        describe('static method', function() {
            var ignore = [
                'onPossiblyUnhandledRejection',
                'onUnhandledRejectionHandled',
                'longStackTraces',
                'hasLongStackTraces',
                'config',
                'getNewLibraryCopy',
                'is',
                'fromCallback',
                'fromNode',
                'promisify',
                'promisifyAll',
                'all',
                'props',
                'any',
                'some',
                'race',
                'resolve',
                'fulfilled',
                'cast',
                'reject',
                'rejected',
                'setScheduler',
                'method',
                'try',
                'attempt',
                'bind',
                'settle',
                'delay',
                'defer',
                'pending',
                'clone' // comes from bluebird2 / bluebird3 libraries not bluebird itself
            ];

            checkPatched(Promise, ignore);
        });

        describe('prototype method', function() {
            var ignore = [
                'catch',
                'caught',
                'error',
                'all',
                'props',
                'any',
                'some',
                'race',
                'bind',
                'isFulfilled',
                'isRejected',
                'isPending',
                'isCancelled',
                'isResolved',
                'value',
                'reason',
                'reflect',
                'settle',
                'delay',
                'timeout',
                'get',
                'return',
                'thenReturn',
                'throw',
                'thenThrow',
                'catchReturn',
                'catchThrow',
                'cancel',
                'break',
                'isCancellable',
                'cancellable',
                'uncancellable',
                'suppressUnhandledRejections',
                'toString',
                'toJSON'
            ];
            checkPatched(Promise.prototype, ignore);
        });
    });
};

function checkPatched(obj, ignore) {
    _.forIn(obj, function(method, name) {
        if (name.match(/^[A-Z_]/)) return;
        if (ignore.indexOf(name) !== -1) return;
        if (typeof method !== 'function') return;

        it(name, function() {
            if (!method.__wrapped) throw new Error("'" + name + "' method not patched"); // jshint ignore:line
        });
    });
}
