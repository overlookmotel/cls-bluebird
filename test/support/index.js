/*
 * cls-bluebird tests
 * Tests setup
 */

/* global describe */

// Modules
var Bluebird2 = require('bluebird2'),
    Bluebird3 = require('bluebird3'),
    clsBluebird = require('../../lib');

// Imports
var ns = require('./ns'),
    Utils = require('./utils');

// Exports

/*
 * Run tests.
 * Expects to be provided function that runs group of tests.
 * Tests function is called with arguments (Promise, ns, utils).
 *
 * @param {string} name - Name of test group
 * @param {Function} testFn - Function that runs tests
 * @returns {undefined}
 */
module.exports = function(name, testFn) {
    // Get bluebird version to test from environment vars
    var bluebirdVersion = process.env.BLUEBIRD_VERSION * 1;

    // Patch bluebird2 + bluebird3
    var PatchedBluebird2 = patch(Bluebird2);
    var PatchedBluebird3 = patch(Bluebird3);

    // Get bluebird version to use for these tests
    var Promise, UnpatchedPromise, versionName, altPromises;
    if (bluebirdVersion === 2) {
        Promise = PatchedBluebird2;
        UnpatchedPromise = Bluebird2;
        versionName = 'Bluebird v2.x';
        altPromises = [
            {name: 'this', Promise: PatchedBluebird2},
            {name: 'bluebird v2 unpatched', Promise: Bluebird2},
            //{name: 'bluebird v3 patched', Promise: PatchedBluebird3},
            {name: 'bluebird v3 unpatched', Promise: Bluebird3},
            {name: 'native', Promise: global.Promise}
        ];
    } else if (bluebirdVersion === 3) {
        Promise = PatchedBluebird3;
        UnpatchedPromise = Bluebird3;
        versionName = 'Bluebird v3.x';
        altPromises = [
            {name: 'this', Promise: PatchedBluebird3},
            {name: 'bluebird v3 unpatched', Promise: Bluebird3},
            //{name: 'bluebird v2 patched', Promise: PatchedBluebird2},
            {name: 'bluebird v2 unpatched', Promise: Bluebird2},
            {name: 'native', Promise: global.Promise}
        ];
    } else {
        throw new Error('BLUEBIRD_VERSION environment variable not set');
    }

    // Create utils object based on Promise, UnpatchedPromise, ns and altPromises
    var utils = new Utils(Promise, UnpatchedPromise, ns, altPromises);

    // Run tests
    describe(name + ' (' + versionName + ')', function() {
        testFn(Promise, utils);
    });
};

/*
 * Patch bluebird constructor with cls-bluebird.
 * Also registers `onPossiblyUnhandledRejection` to exit immediately with error if unhandled promise rejection.
 *
 * @param {Function} Promise - bluebird constructor
 * @returns {Function} - Input bluebird constructor
 */
function patch(Promise) {
    // Get independent instance of bluebird library
    Promise = Promise.getNewLibraryCopy();

    // Patch bluebird with cls-bluebird
    clsBluebird(ns, Promise);

    // Register `onPossiblyUnhandledRejection` handler to exit with error
    // if there is an unhandled promise rejection.
    Promise.onPossiblyUnhandledRejection(function(err) {
        console.log('Unhandled rejection:', err);
        process.exit(1);
    });

    // Return bluebird constructor
    return Promise;
}
