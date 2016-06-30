/*
 * cls-bluebird tests
 * Tests for Promise.reject()
 */

/* global describe, it */

// Modules
var expect = require('chai').expect;

// Imports
var runTests = require('../support');

// Run tests

runTests('Promise.reject()', function(Promise, u) {
    describe('always returns instance of patched Promise constructor when passed', function() {
        it('literal value', function(done) {
            var err = u.makeError();
            var p = Promise.reject(err);
            expect(p).to.be.instanceof(Promise);
            u.addCatch(p, err, done);
        });
    });
});
