/*
 * cls-bluebird tests
 * Tests for .error()
 */

// Imports
var runTests = require('../support');

// Run tests

runTests('.error()', function(u) {
    // NB In bluebird v3 handler is not bound.
    // `.error()` calls `.catch()` synchronously which calls `.then()` synchronously but with proxy handler.
    // No way to test for binding.
    // TODO Add more tests that handler runs in correct CLS context
    u.testSetProtoMethodAsync(function(p, handler) {
        return p.error(handler);
    }, {catches: true, noUndefined: true, noBind: (u.bluebirdVersion === 3)});
});
