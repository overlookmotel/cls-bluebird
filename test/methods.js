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
		/*
		 * new Promise()
		 */
		describe('new Promise()', function() {
			describe('always returns instance of patched Promise constructor when', function() {
				it('resolved sync', function(done) {
					var p = resolveSync(Promise, 1);
					expect(p).to.be.instanceof(Promise);
					addThen(p, done);
				});

				it('resolved async', function(done) {
					var p = resolveAsync(Promise, 1);
					expect(p).to.be.instanceof(Promise);
					addThen(p, done);
				});

				it('rejected sync', function(done) {
					var err = new Error('foo');
					var p = rejectSync(Promise, err);
					expect(p).to.be.instanceof(Promise);
					addCatch(p, err, done);
				});

				it('rejected async', function(done) {
					var err = new Error('foo');
					var p = rejectAsync(Promise, err);
					expect(p).to.be.instanceof(Promise);
					addCatch(p, err, done);
				});

				it('unresolved', function() {
					var p = new Promise(function() {});
					expect(p).to.be.instanceof(Promise);
				});

				it('throws', function(done) {
					var err = new Error('foo');
					var p = new Promise(function() {
						throw err;
					});
					expect(p).to.be.instanceof(Promise);
					addCatch(p, err, done);
				});
			});

			it('calls callback synchronously', function(done) {
				checkSync(function(handler) {
					new Promise(handler); // jshint ignore:line
				}, done);
			});

			it('patch does not bind callback', function(done) {
				checkNotBound(function(handler) {
					new Promise(handler); // jshint ignore:line
				}, done);
			});
		});

		/*
		 * Promise.resolve()
		 */
		describe('Promise.resolve()', function() {
            describe('always returns instance of patched Promise constructor when passed', function() {
				checkReturnsPromiseValue(function(value) {
					return Promise.resolve(value);
				}, Promise, altPromises);
            });
        });

		/*
		 * Promise.reject()
		 */
		describe('Promise.reject()', function() {
            describe('always returns instance of patched Promise constructor when passed', function() {
                it('literal value', function(done) {
					var err = new Error('foo');
                    var p = Promise.reject(err);
                    expect(p).to.be.instanceof(Promise);
					addCatch(p, err, done);
                });
            });
        });

		/*
		 * Promise.prototype.then()
		 */
		describe('Promise.prototype.then()', function() {
			describe('always returns instance of patched Promise constructor when passed', function() {
				// TODO check for case where attached to async resolved/rejected promise
				describe('resolve handler', function() {
					checkReturnsPromise(function(handler) {
						return resolveSync(Promise, 1).then(handler);
					}, Promise, altPromises);
				});

				describe('reject handler', function() {
					checkReturnsPromise(function(handler, done) {
						return rejectSync(Promise, new Error('foo')).then(makeHandlerBadResolve(done), handler);
					}, Promise, altPromises);
				});
            });

			describe('calls callback asynchronously', function() {
				describe('resolve handler', function() {
					describe('attached sync to', function() {
						it('settled promise', function(done) {
							var p = resolveSync(Promise, 1);
							checkAsync(function(handler) {
								p.then(handler);
							}, done);
						});

						it('pending promise', function(done) {
							var p = resolveAsync(Promise, 1);
							checkAsync(function(handler) {
								p.then(handler);
							}, done);
						});
					});

					describe('attached async to', function() {
						it('settled promise', function(done) {
							var p = resolveSync(Promise, 1);
							setImmediate(function() {
								checkAsync(function(handler) {
									p.then(handler);
								}, done);
							});
						});

						it('pending promise', function(done) {
							var p = resolveAsync(Promise, 1);
							setImmediate(function() {
								checkAsync(function(handler) {
									p.then(handler);
								}, done);
							});
						});
					});
				});

				describe('reject handler', function() {
					// TODO ensure handler receives correct error
					describe('attached sync to', function() {
						it('settled promise', function(done) {
							var p = rejectSync(Promise, new Error('foo'));
							checkAsync(function(handler) {
								p.then(makeHandlerBadResolve(done), handler);
							}, done);
						});

						it('pending promise', function(done) {
							var p = rejectAsync(Promise, new Error('foo'));
							checkAsync(function(handler) {
								p.then(makeHandlerBadResolve(done), handler);
							}, done);
						});
					});

					describe('attached async to', function() {
						it('settled promise', function(done) {
							var p = rejectSync(Promise, new Error('foo'));
							suppressUnhandledRejections(p);
							setImmediate(function() {
								checkAsync(function(handler) {
									p.then(makeHandlerBadResolve(done), handler);
								}, done);
							});
						});

						it('pending promise', function(done) {
							var p = rejectAsync(Promise, new Error('foo'));
							suppressUnhandledRejections(p);
							setImmediate(function() {
								checkAsync(function(handler) {
									p.then(makeHandlerBadResolve(done), handler);
								}, done);
							});
						});
					});
				});
			});

			describe('patch binds callback', function() {
				// TODO add tests for binding to async rejected promise or handler attached async?
				it('resolve handler', function(done) {
					var p = resolveSync(Promise, 1);
					runInContext(function(context) {
						checkBound(function(handler) {
							p.then(handler);
						}, context, done);
					});
				});

				it('reject handler', function(done) {
					var p = rejectSync(Promise, new Error('foo'));
					runInContext(function(context) {
						checkBound(function(handler) {
							p.then(makeHandlerBadResolve(done), handler);
						}, context, done);
					});
				});
			});
		});
    });

	/**
	 * Create a CLS context and run function within it.
	 * Context is created with a unique `_id` attribute within it.
	 * `fn` is called with the CLS context object as argument.
	 *
	 * @param {Function} fn - Function to execute within context
	 * @returns {*} - Return value of `fn()`
	 */
	function runInContext(fn) {
		return _runInContext(ns, fn);
	}
};

/**
 * Runs a function and checks it calls back a handler synchronously.
 * `fn` is called immediately, and passed a handler.
 * If handler is called synchronously, `done` callback is called without error.
 * If handler is called asynchronously, `done` callback is called with an error.
 *
 * @param {Function} fn - Function to run.
 * @param {Function} done - Final callback to call with result
 * @returns {undefined}
 */
function checkSync(fn, done) {
	var sync = true;
	var handler = function() {
		toCallback(function() {
			if (!sync) throw new Error('Called asynchronously');
		}, done);
	};

	fn(handler);
	sync = false;
}

/**
 * Runs a function and checks it calls back a handler asynchronously.
 * `fn` is called immediately, and passed a handler.
 * If handler is called asynchronously, `done` callback is called without error.
 * If handler is called synchronously, `done` callback is called with an error.
 *
 * @param {Function} fn - Function to run.
 * @param {Function} done - Final callback to call with result
 * @returns {undefined}
 */
function checkAsync(fn, done) {
	var sync = true;
	var handler = function() {
		toCallback(function() {
			if (sync) throw new Error('Called synchronously');
		}, done);
	};

	fn(handler);
	sync = false;
}

/**
 * Runs a function and checks that when it calls back a handler, the handler has not been bound to a CLS context.
 * `fn` is called immediately, and passed a handler.
 * If handler is not bound, `done` callback is called without error.
 * If handler is bound, `done` callback is called with an error.
 *
 * @param {Function} fn - Function to run.
 * @param {Function} done - Final callback to call with result
 * @returns {undefined}
 */
function checkNotBound(fn, done) {
	var handler = function() {
		toCallback(function() {
			throwIfBound(handler);
		}, done);
	};

	fn(handler);
}

/**
 * Runs a function and checks that when it calls back a handler, the handler has been bound to CLS context.
 * `fn` is called immediately, and passed a handler.
 *
 * Checks:
 *   - Handler is bound to correct context
 *   - Handler is bound exactly once, synchronously after handler attached
 *   - Handler is not bound again before handler is executed (asynchronously)
 *
 * If all checks pass, `done` callback is called without error.
 * If any check fails, `done` callback is called with an error.
 *
 * @param {Function} fn - Function to run.
 * @param {Function} done - Final callback to call with result
 * @returns {undefined}
 */
function checkBound(fn, context, done) {
	var err;
	var handler = function() {
		toCallback(function() {
			// throw if was not bound synchronously
			if (err) throw err;

			// throw if not bound at time handler called
			throwIfNotBound(handler, context);
		}, done);
	};

	// run function, passing handler
	fn(handler);

	// check if bound synchronously and set `err` to Error object if not
	err = returnErrIfNotBound(handler, context);
}

/*
 * Executes `fn` several times providing different handlers.
 */
function checkReturnsPromise(fn, Promise, altPromises, noThrow) {
	it('literal value', function(done) {
		var p = fn(literalMethod(), done);
		expect(p).to.be.instanceof(Promise);
		addThen(p, done);
	});

	if (!noThrow) {
		it('thrown error', function(done) {
			var err = new Error();
			var p = fn(throwMethod(err), done);
			expect(p).to.be.instanceof(Promise);
			addCatch(p, err, done);
		});
	}

	altPromises.forEach(function(altPromiseParams) {
		var name = altPromiseParams.name,
			AltPromise = altPromiseParams.Promise;
		if (!AltPromise) return it(name);

		describe(name, function() {
			it('resolved sync', function(done) {
				var p = fn(resolveSyncMethod(AltPromise, 1), done);
				expect(p).to.be.instanceof(Promise);
				addThen(p, done);
			});

			it('resolved async', function(done) {
				var p = fn(resolveAsyncMethod(AltPromise, 1), done);
				expect(p).to.be.instanceof(Promise);
				addThen(p, done);
			});

			it('rejected sync', function(done) {
				var err = new Error('foo');
				var p = fn(rejectSyncMethod(AltPromise, err), done);
				expect(p).to.be.instanceof(Promise);
				addCatch(p, err, done);
			});

			it('rejected async', function(done) {
				var err = new Error('foo');
				var p = fn(rejectAsyncMethod(AltPromise, err), done);
				expect(p).to.be.instanceof(Promise);
				addCatch(p, err, done);
			});
		});
	});
}

/*
 * Executes `fn` several times providing different values.
 */
function checkReturnsPromiseValue(fn, Promise, altPromises) {
	checkReturnsPromise(function(handler) {
		var value = handler();
		return fn(value);
	}, Promise, altPromises, true);
}

/**
 * Create callback function to be passed to a Promise method which should never be called.
 * Calls `done` callback with error if called.
 *
 * @param {Function} done - Final callback to call with result
 * @returns {Function} - Created callback function
 */
function makeHandlerBadResolve(done) {
	return function () {
		done(new Error('Unexpected resolve'));
	};
}

/**
 * Checks provided function has not been bound to a CLS context, and throws if it has.
 *
 * @param {Function} fn - Function to check
 * @returns {undefined}
 * @throws {Error} - If has been bound
 */
function throwIfBound(fn) {
	if (fn._bound) throw new Error('Function bound');
}

/**
 * Checks provided function has been bound to a CLS context exactly once, and throws if not.
 *
 * @param {Function} fn - Function to check
 * @returns {undefined}
 * @throws {Error} - If not been bound correctly
 */
function throwIfNotBound(fn, context) {
	var bound = fn._bound;
	if (!bound || !bound.length) throw new Error('Function not bound');
	if (bound.length > 1) throw new Error('Function bound multiple times (' + bound.length + ')');
	if (bound[0].context !== context) throw new Error('Function bound to wrong context (expected: ' + JSON.stringify(context) + ', got: ' + JSON.stringify(bound[0].context) + ')');
}

/**
 * Checks provided function has been bound to a CLS context exactly once, and returns error object if not.
 *
 * @param {Function} fn - Function to check
 * @returns {Error|undefined} - Error if not bound correctly, undefined if fine
 */
function returnErrIfNotBound(fn, context) {
	try {
		throwIfNotBound(fn, context);
	} catch (err) {
		return err;
	}
}

/**
 * Add a then handler to a promise.
 * Calls `done` with no error if resolve handler calls.
 * If reject handler called, calls `done` with the error.
 */
function addThen(promise, done) {
	promise.then(
		function() {
			done();
		},
		function(err) {
			done(err);
		}
	);
}

/**
 * Add a catch handler to a promise.
 * If error is unexpected, calls `done` with the error.
 * Otherwise, calls `done` with no error.
 */
function addCatch(promise, expectedErr, done) {
	promise.then(
		function() {
			done(new Error('Unexpected resolve'));
		},
		function(err) {
			if (err === expectedErr) {
				done();
			} else {
				done(err);
			}
		}
	);
}

/**
 * Run function and pass return value/thrown error to node-style callback function.
 * If function returns a value, this is passed to callback is 2nd arg.
 * If function throws an error, this is passed to callback as 1st arg.
 *
 * @param {Function} fn - Function to execute
 * @param {Function} cb - Callback function to call with result
 * @returns {undefined}
 */
function toCallback(fn, cb) {
	var result;
	try {
		result = fn();
	} catch (err) {
		cb(err);
		return;
	}
	cb(null, result);
}

/**
 * Create a wrapper function that will run function and pass return
 * value/thrown error to node-style callback function.
 * If function returns a value, this is passed to callback is 2nd arg.
 * If function throws an error, this is passed to callback as 1st arg.
 *
 * @param {Function} fn - Function to execute
 * @param {Function} cb - Callback function to call with result
 * @returns {Function} - Wrapper function
 */
/*
function makeToCallback(fn, cb) {
	return function() {
		toCallback(fn, cb);
	};
}
*/

/**
 * Attach empty catch handler to promise to prevent unhandled rejections
 * @param {Promise} promise - Promise to attach catch handler to
 * @returns {undefined}
 */
function suppressUnhandledRejections(promise) {
	promise.catch(function() {});
}

/**
 * Set of functions to create promises which resolve or reject either synchronously or asynchronously.
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

function resolveSyncMethod(Promise, value) {
    return function() {
		return resolveSync(Promise, value);
	};
}

function resolveAsyncMethod(Promise, value) {
	return function() {
		return resolveAsync(Promise, value);
	};
}

function rejectSyncMethod(Promise, err) {
	return function() {
		return rejectSync(Promise, err);
	};
}

function rejectAsyncMethod(Promise, err) {
	return function() {
		return rejectAsync(Promise, err);
	};
}

function literalMethod() {
	return function() {
		return 1;
	};
}

function throwMethod(err) {
	return function() {
		throw err;
	};
}

/**
 * Create a CLS context and run function within it.
 * Context is created with a unique `_id` attribute within it.
 * `fn` is called with the CLS context object as argument.
 *
 * @param {Object} ns - CLS namespace to run within
 * @param {Function} fn - Function to execute within context
 * @returns {*} - Return value of `fn()`
 */
var nextId = 1;
function _runInContext(ns, fn) {
    return _runAndReturn(ns, function(context) {
        var id = nextId;
        ns.set('_id', id);
        nextId++;

        return fn(context);
    });
}

/**
 * Creates CLS context and runs a function within it.
 * Like `ns.run(fn)` but returns the return value of `fn` rather than the context object.
 * `fn` is called with the CLS context object as argument.
 *
 * @param {Object} ns - CLS namespace to run within
 * @param {Function} fn - Function to execute within context
 * @returns {*} - Return value of `fn()`
 */
function _runAndReturn(ns, fn) {
	var value;
    ns.run(function(context) {
        value = fn(context);
    });
    return value;
}
