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
    test(PatchedBluebird2, ns);
});

describe('Bluebird v3.x', function() {
    test(PatchedBluebird3, ns);
});
