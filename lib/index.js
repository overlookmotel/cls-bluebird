'use strict';

/*
 * cls-bluebird
 * Module entry point
 */

// Modules
var isBluebird = require('is-bluebird');

// Require Bluebird library
// Ignore errors if cannot be required
var Bluebird;
try {
    Bluebird = require('bluebird');
} catch (err) {}

// Imports
var shimMethod = require('./shimMethod'),
    shimMapBluebird3 = require('./shimMapBluebird3'),
    shimCall = require('./shimCall'),
    shimCoroutine = require('./shimCoroutine');

// Exports

/**
 * Patch bluebird to run maintain CLS context for a specific namespace.
 * If a Bluebird Promise constructor is provided, it is patched.
 * If not provided, the version returned by `require('bluebird')` is used.
 *
 * @param {Object} ns - CLS namespace object
 * @param {Function} [Promise] - Bluebird Promise constructor to patch (optional)
 * @returns {Function} - Bluebird Promise constructor
 * @throws {TypeError} - If `ns` or `Promise` are not of correct type
 * @throws {Error} - If `Promise` not provided and cannot require `bluebird` module
 */
module.exports = function patchBluebird(ns, Promise) {
    // Check namespace is valid
    if (!ns || typeof ns.bind !== 'function' || typeof ns.run !== 'function') throw new TypeError('must include namespace to patch bluebird against');

    // Check Promise implementation is some variation of Bluebird
    // If none provided, use default Bluebird
    if (!Promise) {
        Promise = Bluebird;
        if (!Promise) throw new Error('could not require bluebird');
    } else if (!isBluebird.ctor(Promise)) {
        throw new TypeError('promise implementation provided must be bluebird');
    }

    // Patch all methods to carry CLS context
    var v3 = isBluebird.ctor.v3(Promise);

    /*
     * Core
     *
     * Not patched as always run callback synchronously:
     *   new Promise()
     *   Promise.try() / Promise.attempt()
     *
     * Not patched as do not take a callback:
     *   Promise.bind() / .bind()
     *   Promise.resolve() / Promise.fulfilled() / Promise.cast()
     *   Promise.reject() / Promise.rejected()
     *
     * Not patched as call another patched method synchronously
     *   .error() - calls .then()
     *
     * Not patched as are wrappers:
     *   Promise.method()
     */

    shimProto('then', v3 ? [0, 1] : [0, 1, 2]);
    shimProto('spread', v3 ? [0] : [0, 1]);
    shimProto('finally', [0]);
    shimProto('lastly', [0]);
    shimStatic('join', [-1]);

    if (!v3) {
        // Only patched in bluebird v2.
        // In bluebird v3 they call `.then()` immediately which binds callback.
        shimProto('catch', [0]);
        shimProto('caught', [0]);
    }

    /*
     * Synchronous inspection
     *
     * Not patched as do not take a callback:
     *   .isFulfilled()
     *   .isRejected()
     *   .isPending()
     *   .isCancelled()
     *   .isResolved()
     *   .value()
     *   .reason()
     *   .reflect()
     */

    /*
     * Collections
     *
     * Not patched as do not take a callback:
     *   Promise.all() / .all()
     *   Promise.props() / .props()
     *   Promise.any() / .any()
     *   Promise.some() / .some()
     *   Promise.race() / .race()
     */

    if (v3) {
        // In bluebird v3, static methods `Promise.map` and `Promise.filter`
        // sometimes call the callback synchronously so need special shim.
        shimMapBluebird3('map', Promise, ns);
        shimMapBluebird3('filter', Promise, ns);
    } else {
        shimBoth('map', [0]);
        shimBoth('filter', [0]);
    }

    shimBoth('reduce', [0]);
    shimBoth('each', [0]);
    shimBoth('mapSeries', [0]);

    /*
     * Resource management
     *
     * NB disposer callbacks are bound to context at time disposer created, not when utilized in `using()`
     */

    shimStatic('using', [-1]);
    shimProto('disposer', [0]);

    /*
     * Promisification
     *
     * Not patched as always run callback synchronously:
     *   Promise.fromCallback()
     *   Promise.fromNode()
     *
     * Not patched as they are wrappers:
     *   Promise.promisify()
     *   Promise.promisifyAll()
     *
     * TODO make sure promisify/promisfiyAll work properly and always returns base Promise
     * TODO check all aliases are covered e.g. .nodeify()
     */

    shimProto('asCallback', [0]);
    shimProto('nodeify', [0]);

    /*
     * Timers
     *
     * Not patched as do not take a callback:
     *   Promise.delay() / .delay()
     *   .timeout()
     */

    /*
     * Cancellation
     *
     * Not patched as does not take a callback:
     *   .cancel() / .break()
     *   .isCancellable()
     *   .cancellable() (bluebird v2 only)
     *   .uncancellable() (bluebird v2 only)
     *
     * NB cancellation is synchronous in bluebird v3 so `onCancel` handler will be called
     * in CLS context of call to `.cancel()`.
     * TODO make sure this works for bluebird v2 too
     */

    /*
     * Generators
     *
     * Not patched as does not take a callback:
     *   Promise.coroutine.addYieldHandler()
     *
     * TODO Check Promise.coroutine shim works!
     */

    shimCoroutine('coroutine', Promise, ns); // shims `Promise.coroutine()`

    /*
     * Utility
     *
     * Not patched as do not take a callback:
     *   .get()
     *   .return() / .thenReturn()
     *   .throw() / .thenThrow()
     *   .catchReturn()
     *   .catchThrow()
     *   Promise.getNewLibraryCopy()
     *   Promise.noConflict()
     *   Promise.setScheduler()
     *
     * TODO check `.call()` shim works on bluebird v2 especially
     */

    shimProto('tap', [0]);
    shimCall(Promise, ns); // shims `.call()`

    /*
     * Configuration
     *
     * Not patched as do not take a callback:
     *   Promise.config()
     *   .suppressUnhandledRejections()
     *   Promise.longStackTraces()
     *   Promise.hasLongStackTraces()
     *
     * Not patched as meaningless to do so:
     *   Promise.onPossiblyUnhandledRejection()
     *   Promise.onUnhandledRejectionHandled()
     *
     * NB Error handlers will run with unknown CLS context.
     * CLS context should not be relied upon to be the context at the time error was thrown.
     * Catch errors with `.catch()` instead!
     */

    shimProto('done', v3 ? [0, 1] : [0, 1, 2]);

    /*
     * Progression (bluebird v2 only)
     */

    shimProto('progressed', [0]);

    /*
     * Undocumented
     *
     * Not patched as do not take a callback:
     *   Promise.is()
     *   Promise.settle() / .settle()
     *   Promise.defer() / Promise.pending()
     *   .toString()
     *   .toJSON()
     */

    shimProto('fork', v3 ? [0, 1] : [0, 1, 2]);
    shimCoroutine('spawn', Promise, ns); // shims `Promise.spawn()`

    // Return patched Bluebird constructor
    return Promise;

    /*
     * Patching functions
     */
    function shimStatic(methodName, args) {
        shimMethod(Promise, methodName, args, ns);
    }

    function shimProto(methodName, args) {
        shimMethod(Promise.prototype, methodName, args, ns);
    }

    function shimBoth(methodName, args) {
        shimProto(methodName, args);
        shimStatic(methodName, args.map(function(arg) { return arg < 0 ? arg : arg + 1; }));
    }
};
