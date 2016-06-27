/*
 * cls-bluebird tests
 * Function to test all methods retain context
 */

/* global describe, it */

// Modules
var chai = require('chai'),
	expect = chai.expect;

// Init chai
chai.config.includeStack = true;

// Exports

module.exports = function(Promise, altPromises, ns) { // jshint ignore:line
    describe('methods', function() {
		describe('new Promise()', function() {
			describe('always returns instance of patched Promise constructor when', function() {
				it('resolved sync', function() {
					var p = resolveSync(Promise, 1);
					expect(p).to.be.instanceof(Promise);
				});

				it('resolved async', function() {
					var p = resolveAsync(Promise, 1);
					expect(p).to.be.instanceof(Promise);
				});

				it('rejected sync', function() {
					var p = rejectSync(Promise, new Error('foo'));
					expect(p).to.be.instanceof(Promise);
					p.catch(function() {});
				});

				it('rejected async', function() {
					var p = rejectAsync(Promise, new Error('foo'));
					expect(p).to.be.instanceof(Promise);
					p.catch(function() {});
				});
			});

			it('calls callback synchronously', function(done) {
				var sync = true;
				new Promise(function() { // jshint ignore:line
					if (!sync) return done(new Error('Called asynchonously'));
					done();
				});
				sync = false;
			});

			it('patch does not bind callback', function(done) {
				var cb = function() {
					if (cb._bound) return done('Callback bound');
					done();
				};

				new Promise(cb); // jshint ignore:line
			});
		});

		describe('Promise.resolve()', function() {
            describe('always returns instance of patched Promise constructor when passed', function() {
                it('literal value', function() {
                    var p = Promise.resolve(1);
                    expect(p).to.be.instanceof(Promise);
                });

                altPromises.forEach(function(altPromiseParams) {
                    var name = altPromiseParams.name,
                        AltPromise = altPromiseParams.Promise;
                    if (!AltPromise) return it(name);

                    describe(name, function() {
                        it('resolved sync', function() {
                            var p = Promise.resolve(resolveSync(AltPromise, 1));
                            expect(p).to.be.instanceof(Promise);
                        });

                        it('resolved async', function() {
                            var p = Promise.resolve(resolveAsync(AltPromise, 1));
                            expect(p).to.be.instanceof(Promise);
                        });

						it('rejected sync', function() {
                            var p = Promise.resolve(rejectSync(AltPromise, new Error('foo')));
                            expect(p).to.be.instanceof(Promise);
							p.catch(function() {});
                        });

                        it('rejected async', function() {
							var p = Promise.resolve(rejectAsync(AltPromise, new Error('foo')));
							expect(p).to.be.instanceof(Promise);
							p.catch(function() {});
                        });
                    });
                });
            });
        });

		describe('Promise.reject()', function() {
            describe('always returns instance of patched Promise constructor when passed', function() {
                it('literal value', function() {
                    var p = Promise.reject(1);
                    expect(p).to.be.instanceof(Promise);
					p.catch(function() {});
                });
            });
        });
    });
};

/**
 * Set of functions to create promises which resolve or reject either synchronously or asynchonously.
 */
function resolveSync(Promise, value) {
    return new Promise(function(resolve) {
        resolve(value);
    });
}

function resolveAsync(Promise, value) {
    return new Promise(function(resolve) {
        setImmediate(function() {
            resolve(value);
        });
    });
}

function rejectSync(Promise, err) {
    return new Promise(function(resolve, reject) { // jshint ignore:line
        reject(err);
    });
}

function rejectAsync(Promise, err) {
    return new Promise(function(resolve, reject) { // jshint ignore:line
        setImmediate(function() {
            reject(err);
        });
    });
}
