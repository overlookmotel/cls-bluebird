/*
 * cls-bluebird tests
 * Tests for Promise.method()
 */

// Imports
var runTests = require('../support');

// Run tests

runTests('Promise.method()', function(u, Promise) {
    u.testSetStaticMethodSync(function(handler) {
        return (Promise.method(handler))();
    });
});
