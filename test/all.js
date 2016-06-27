/*
 * cls-bluebird tests
 * Function to run all tests on provided Bluebird version
 */

// Imports
var patched = require('./patched');

// Exports
module.exports = function(Promise, ns) { // jshint ignore:line
    patched(Promise);
};
