/*
 * cls-bluebird tests
 * Tests entry point
 */

/* global describe */

// Modules
var Bluebird2 = require('bluebird2'),
    Bluebird3 = require('bluebird3'),
    clsBluebird = require('../lib');

// Imports
var ns = require('./ns'),
    test = require('./all');

// Patch bluebird2 + bluebird3
var PatchedBluebird2 = Bluebird2.getNewLibraryCopy();
clsBluebird(ns, PatchedBluebird2);
var PatchedBluebird3 = Bluebird3.getNewLibraryCopy();
clsBluebird(ns, PatchedBluebird3);

// Run tests for bluebird v2 and v3
describe('Bluebird v2.x', function() {
    var altPromises = [
        {name: 'self', Promise: PatchedBluebird2},
        {name: 'bluebird v2 unpatched', Promise: Bluebird2},
        //{name: 'bluebird v3 patched', Promise: PatchedBluebird3},
        {name: 'bluebird v3 unpatched', Promise: Bluebird3},
        {name: 'native promise', Promise: global.Promise}
    ];

    test(PatchedBluebird2, altPromises, ns);
});

describe('Bluebird v3.x', function() {
    var altPromises = [
        {name: 'self', Promise: PatchedBluebird3},
        {name: 'bluebird v3 unpatched', Promise: Bluebird3},
        //{name: 'bluebird v2 patched', Promise: PatchedBluebird2},
        {name: 'bluebird v2 unpatched', Promise: Bluebird2},
        {name: 'native promise', Promise: global.Promise}
    ];

    test(PatchedBluebird3, altPromises, ns);
});
