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
				new Promise(makeHandlerNotBound(done)); // jshint ignore:line
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
				describe('resolve handler', function() {
					checkReturnsPromise(function(handler) {
						return resolve().then(handler);
					}, Promise, altPromises);
				});

				describe('reject handler', function() {
					checkReturnsPromise(function(handler, done) {
						return reject().then(makeHandlerBadResolve(done), handler);
					}, Promise, altPromises);
				});
            });

			describe('calls callback asynchronously', function() {
				it('resolve handler', function(done) {
					checkAsync(function(handler) {
						resolve().then(handler);
					}, done);
				});

				it('reject handler', function(done) {
					checkAsync(function(handler) {
						reject().then(makeHandlerBadResolve(done), handler);
					}, done);
				});
			});

			describe('patch binds callback', function() {
				it('resolve handler', function(done) {
					resolve().then(makeHandlerBound(null, done));
				});

				it('reject handler', function(done) {
					reject().then(makeHandlerBadResolve(done), makeHandlerBound(null, done));
				});
			});
		});
    });

	/**
	 * Returns a resolved promise
	 * @returns {Promise}
	 */
	function resolve() {
		return Promise.resolve(1);
	}

	/**
	 * Returns a rejected promise
	 * @returns {Promise}
	 */
	function reject() {
		return Promise.reject(new Error('error'));
	}
};

/**
 * Runs a function and checks it calls back a handler synchonously.
 * `fn` is called immediately, and passed a handler.
 * If handler is called syncronously, `done` callback is called without error.
 * If handler is called asyncronously, `done` callback is called with an error.
 *
 * @param {Function} fn - Function to run.
 * @param {Function} done - Final callback to call with result
 * @returns {undefined}
 */
function checkSync(fn, done) {
	var sync = true;
	var handler = function() {
		toCallback(function() {
			if (!sync) throw new Error('Called asynchonously');
		}, done);
	};

	fn(handler);
	sync = false;
}

/**
 * Runs a function and checks it calls back a handler asynchonously.
 * `fn` is called immediately, and passed a handler.
 * If handler is called asyncronously, `done` callback is called without error.
 * If handler is called syncronously, `done` callback is called with an error.
 *
 * @param {Function} fn - Function to run.
 * @param {Function} done - Final callback to call with result
 * @returns {undefined}
 */
function checkAsync(fn, done) {
	var sync = true;
	var handler = function() {
		toCallback(function() {
			if (sync) throw new Error('Called synchonously');
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
/*
function checkNotBound(fn, done) {
	var handler = function() {
		toCallback(function() {
			throwIfBound(handler);
		}, done);
	};

	fn(handler);
}
*/

/**
 * Runs a function and checks that when it calls back a handler, the handler has been bound to CLS context.
 * `fn` is called immediately, and passed a handler.
 * If handler is bound exactly once, `done` callback is called without error.
 * If handler is not bound or bound more than once, `done` callback is called with an error.
 *
 * @param {Function} fn - Function to run.
 * @param {Function} done - Final callback to call with result
 * @returns {undefined}
 */
/*
function checkBound(fn, done) {
	var handler = function() {
		toCallback(function() {
			throwIfNotBound(handler, context);
		}, done);
	};

	fn(handler);
}
*/

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
 * Create callback function to be passed to a Promise method which should not be bound to a CLS context.
 * When it is called, it checks it wasn't bound to a CLS context.
 * Calls `done` callback with result (error or no error).
 *
 * @param {Function} done - Final callback to call with result
 * @returns {Function} - Created callback function
 */
function makeHandlerNotBound(done) {
	var fn = function() {
		toCallback(function() {
			throwIfBound(fn);
		}, done);
	};
	return fn;
}

/**
 * Create callback function to be passed to a Promise method which should be bound to a CLS context.
 * When it is called, it checks it was bound exactly once and to correct CLS context.
 * Calls `done` callback with result (error or no error).
 *
 * @param {Object} context - CLS context expect function to have been bound to
 * @param {Function} done - Final callback to call with result
 * @returns {Function} - Created callback function
 */
function makeHandlerBound(context, done) {
	var fn = function() {
		toCallback(function() {
			throwIfNotBound(fn, context);
		}, done);
	};
	return fn;
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
 * @throws {Error} - If has been bound
 */
function throwIfNotBound(fn, context) {
	var bound = fn._bound;
	if (!bound || !bound.length) throw new Error('Function not bound');
	if (bound.length > 1) throw new Error('Function bound multiple times (' + bound.length + ')');
	if (bound[0].context !== context) throw new Error('Function bound to wrong context (expected: ' + JSON.stringify(context) + ' got: ' + JSON.stringify(bound[0].context) + ')');
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
function addCatch(promise, err, done) {
	promise.then(
		function() {
			done(new Error('Unexpected resolve'));
		},
		function(_err) {
			if (_err === err) {
				done();
			} else {
				done(_err);
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
