/*
 * cls-bluebird tests
 * Tests for .cancel()
 */

/* global describe */

// Imports
var runTests = require('../../support');

// Run tests

runTests('.cancel()', function(u, Promise) {
	// NB Cancellation semantics differ between bluebird v2 and v3
	var thisDescribe = (u.bluebirdVersion === 2 ? describe : describe.skip);

	thisDescribe('with cancellation disabled', function() {
		u.testSetReturnsPromiseProtoReceivingNothing(function(p) {
			return p.cancel();
		});
	});

	thisDescribe('with cancellation enabled', function() {
		// Bug in bluebird v2 means `.cancel()` does not work on promise resolved/rejected
		// with `setImmediate()`, so `setTimeout` used instead.
		describe('returns instance of patched Promise constructor when attached to promise', function() {
			describe('resolved', function() {
				describe('sync', function() {
					testSet(u.resolveSyncHandler(Promise));
				});

				describe('async', function() {
					testSet(function() {
						return new Promise(function(resolve) {
							setTimeout(function() {
								resolve(u.makeValue());
							}, 10);
						});
					});
				});
			});

			describe('rejected', function() {
				describe('sync', function() {
					testSet(u.rejectSyncHandler(Promise));
				});

				describe('async', function() {
					testSet(function() {
						var p = new Promise(function(resolve, reject) { // jshint ignore:line
							setTimeout(function() {
								reject(u.makeError());
							}, 10);
						});
						u.setRejectStatus(p);
						return p;
					});
				});
			});
		});
	});

	function testSet(makePromise) {
		describe('and method attached', function() {
			u.describeAttach(function(attach) {
				u.testIsPromise(function(cb) {
					var p = makePromise();
					p.cancellable();

					attach(function() {
						var newP = p.cancel(u.makeError());
						u.inheritRejectStatus(newP, p);
						if (p.isPending()) u.setRejectStatus(newP);
						cb(newP);
					}, p);
				});
			});
		});
	}
});
