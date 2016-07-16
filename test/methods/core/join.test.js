/*
 * cls-bluebird tests
 * Tests for .join()
 */

// Imports
var runTests = require('../../support');

// Run tests
runTests('Promise.join()', function(u, Promise) {
	/*
	 * NB Due to bug in both bluebird v2 and v3
	 * `Promise.join()` calls the callback synchronously if input is
	 * only values or resolved promises, but async if any promises are pending.
	 * So async calling test is skipped to allow for this.
	 * TODO Raise issue on bluebird for this.
	 * TODO Change test once bug is fixed.
	 * TODO Add specific tests for this.
	 */
	u.testGroupStaticAsyncArrayHandler(function(array, handler) {
		array = array.concat([handler]);
		return Promise.join.apply(Promise, array);
	}, {noUndefinedValue: true, literal: true, oneCallback: true, noAsyncTest: true});
});
