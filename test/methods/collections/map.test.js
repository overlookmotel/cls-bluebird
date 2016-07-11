/*
 * cls-bluebird tests
 * Tests for Promise.map() / .map()
 */

// Imports
var runTests = require('../../support');

// Run tests
// TODO Add tests with `concurrency` option

runTests('Promise.map()', function(u, Promise) {
	// TODO tests for binding, sync/async and CLS context
	u.testSetReturnsPromiseStaticReceivingArrayAndHandler(function(value, handler) {
		return Promise.map(value, handler);
	}, {continues: true, noUndefinedValue: true, noUndefinedHandler: true});
});

runTests('.map()', function(u) {
	// TODO tests for binding, sync/async and CLS context
	u.testSetReturnsPromiseProtoOnArrayReceivingHandler(function(p, handler) {
		return p.map(handler);
	}, {continues: true, noUndefinedValue: true, noUndefinedHandler: true});
});
