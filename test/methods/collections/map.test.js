/*
 * cls-bluebird tests
 * Tests for Promise.map() / .map()
 */

/* global describe */

// Imports
var runTests = require('../../support');

// Run tests

/*
 * NB Due to bug in bluebird v3 https://github.com/petkaantonov/bluebird/issues/1148
 * `Promise.map()` and `.map()` call the callback synchronously if input is
 * only values or resolved promises, but async if any promises are pending.
 * So async calling test is skipped to allow for this.
 * TODO Change test once bug is fixed.
 * TODO Add specific tests for this.
 */

runTests('Promise.map()', function(u, Promise) {
	var noAsyncTest = (u.bluebirdVersion === 3);

	describe('default concurrency', function() {
		u.testGroupStaticAsyncArrayHandler(function(value, handler) {
			return Promise.map(value, handler);
		}, {noUndefinedValue: true, noUndefinedHandler: true, noAsyncTest: noAsyncTest});
	});

	describe('with concurrency option', function() {
		u.testGroupStaticAsyncArrayHandler(function(value, handler) {
			return Promise.map(value, handler, {concurrency: 1});
		}, {noUndefinedValue: true, noUndefinedHandler: true, series: true, noAsyncTest: noAsyncTest});
	});
});

runTests('.map()', function(u) {
	var noAsyncTest = (u.bluebirdVersion === 3);

 	describe('default concurrency', function() {
		u.testGroupProtoAsyncArrayHandler(function(p, handler) {
			return p.map(handler);
		}, {noUndefinedValue: true, noUndefinedHandler: true, noAsyncTest: noAsyncTest});
	});

	describe('with concurrency option', function() {
		u.testGroupProtoAsyncArrayHandler(function(p, handler) {
			return p.map(handler, {concurrency: 1});
		}, {noUndefinedValue: true, noUndefinedHandler: true, series: true, noAsyncTest: noAsyncTest});
	});
});
