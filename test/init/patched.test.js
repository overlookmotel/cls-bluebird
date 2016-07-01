/*
 * cls-bluebird tests
 * Test all methods are patched
 */

/* global describe, it */

// Modules
var expect = require('chai').expect,
    _ = require('lodash');

// Imports
var runTests = require('../support');

// Run tests

runTests('Patch', function(Promise, u) {
    // TODO tests to make sure methods which == eachother before patching, still do after patching
    // e.g. Promise.prototype.catch == Promise.prototype.caught

    describe('patches', function() {
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
                'catch', // TODO only ignore on bluebird v3
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

    describe('maintains method equality', function() {
        it('static methods', function() {
            checkEqual(Promise, u.UnpatchedPromise);
        });

        it('prototype methods', function() {
            checkEqual(Promise.prototype, u.UnpatchedPromise.prototype);
        });
    });
});

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

function checkEqual(obj, unpatchedObj) {
    var matchesUnpatched = getEqual(unpatchedObj);
    var matchesPatched = getEqual(obj);

    expect(matchesPatched).to.deep.equal(matchesUnpatched);
}

function getEqual(obj) {
    var keys = Object.keys(obj).sort();

    var matches = [],
        matched = [];
    keys.forEach(function(key) {
        var method = obj[key];
        if (typeof method !== 'function') return;
        if (matches.indexOf(key) !== -1) return;

        var thisMatches = [];
        keys.forEach(function(otherKey) {
            if (otherKey <= key) return;

            var otherMethod = obj[otherKey];
            if (method === otherMethod) {
                thisMatches.push(otherKey);
                matched.push(otherKey);
            }
        });

        if (thisMatches.length) {
            thisMatches.unshift(key);
            matches.push(thisMatches);
        }
    });

    return matches;
}
