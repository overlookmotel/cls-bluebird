/*
 * cls-bluebird tests
 * Function to run all tests on provided Bluebird version
 */

// Imports
var patched = require('./patched'),
    methods = require('./methods');

// Exports
module.exports = function(Promise, AltPromises, ns) {
    patched(Promise);
    methods(Promise, AltPromises, ns);
};
