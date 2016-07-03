/*
 * cls-bluebird tests
 * Tests for .error()
 */

// Imports
var runTests = require('../support');

// Run tests

// TODO make this work in bluebird v3 - .error() only catches operational errors
runTests('.error()', function(u) {
    u = u;
    /*
    u.testSetProtoMethodAsync(function(p, handler) {
        return p.error(handler);
    }, {catches: true, noUndefined: true, noBind: (u.bluebirdVersion === 3)});
    */
});
