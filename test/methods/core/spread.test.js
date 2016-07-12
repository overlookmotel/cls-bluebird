/*
 * cls-bluebird tests
 * Tests for .spread()
 */

// Imports
var runTests = require('../../support');

// Run tests

// TODO Tests for reject handler in bluebird v2
runTests('.spread()', function(u) {
	u.testGroupProtoAsyncArrayHandler(function(p, handler) {
		return p.spread(handler);
	}, {noUndefinedValue: true, noUndefinedHandler: true, oneCallback: true});
});
