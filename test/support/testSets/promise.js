/*
 * cls-bluebird tests
 * Utilities
 * Functions to run a set of tests relating to testing that methods return a promise of correct type.
 * Mixin to Utils prototype.
 */

/* global describe */

// Exports

// TODO check handler is called in all cases

module.exports = {
    /**
     * Run set of tests on a prototype method to ensure always returns a promise
     * inherited from correct Promise constructor.
     *
     * Function `fn` should take provided `promise` and call the method being tested on it.
     * `fn` is called with a `promise` and a `handler` function which should be attached as the callback to the method under test.
     * e.g. `return promise.then(handler)`
     *
     * A different `handler` is provided in each test.
     * Handlers returns a literal value, throw, or return or a promise that resolves/rejects.
     * Promises returned from handlers are instances of various different Promise constructors.
     *
     * @param {Function} fn - Test function
     * @param {Object} options - Options object
     * @param {boolean} options.continues - true if handler fires on resolved promise
     * @param {boolean} options.catches - true if handler fires rejected promise
     * @param {boolean} options.passThrough - true if method passes through errors even if handler fires
     * @returns {undefined}
     */
    testSetProtoMethodReturnsPromise: function(fn, options) {
        var u = this;

        describe('attached synchronously to promise', function() {
            testSet(false);
        });

        describe('attached asynchronously to promise', function() {
            testSet(true);
        });

        function testSet(attachAsync) {
            describe('resolved sync', function() {
                var makePromise = u.resolveSyncMethod();
                tests(makePromise, options.continues, attachAsync);
            });

            describe('resolved async', function() {
                var makePromise = u.resolveAsyncMethod();
                tests(makePromise, options.continues, attachAsync);
            });

            describe('rejected sync', function() {
                var makePromise = u.rejectSyncMethod();
                tests(makePromise, options.catches, attachAsync);
            });

            describe('rejected async', function() {
                var makePromise = u.rejectAsyncMethod();
                tests(makePromise, options.catches, attachAsync);
            });
        }

        function tests(makePromise, handlerShouldBeCalled, attachAsync) {
            if (!options.noUndefined) {
                u.test('is undefined', function(t) {
                    var p = makePromise();

                    u.execAsyncIf(function() {
                        p = u.inheritRejectStatus(fn(p, undefined), p);
                        t.error(u.returnErrIfNotPromise(p));
                        t.done(p);
                    }, attachAsync, p);
                });
            }

            if (handlerShouldBeCalled) {
                // Handler should be called
                describe('returns', function() {
                    u.testSetMethodReturnsPromise(function(handler, cb) {
                        var p = makePromise();

                        u.execAsyncIf(function() {
                            var newP = fn(p, handler);
                            if (options.passThrough) u.inheritRejectStatus(newP, p);
                            cb(newP);
                        }, attachAsync, p);
                    });
                });

                return;
            }

            // Handler should not be called
            u.test('is ignored', function(t) {
                var p = makePromise();

                u.execAsyncIf(function() {
                    var newP = fn(p, function() {
                        t.error(new Error('Handler should not be called'));
                    });
                    u.inheritRejectStatus(newP, p);

                    t.error(u.returnErrIfNotPromise(newP));
                    t.done(newP);
                }, attachAsync, p);
            });
        }
    },

    /**
     * Run set of tests on a static method to ensure always returns a promise
     * inherited from correct Promise constructor.
     *
     * Test function `fn` is called with a `handler` function.
     * `fn` should call the method being tested with `handler` as the callback, and return resulting promise.
     * e.g. `return Promise.try(handler)`
     *
     * A different `handler` is provided in each test.
     * Handlers return a literal value, throw, or return or a promise that resolves/rejects.
     * Promises returned from handlers are instances of various different Promise constructors.
     *
     * @param {Function} fn - Test function
     * @returns {undefined}
     */
    testSetStaticMethodReturnsPromise: function(fn) {
        var u = this;
    	describe('returns instance of patched Promise constructor when handler returns', function() {
            u.testSetMethodReturnsPromise(function(handler, cb) {
                var p = fn(handler);
                cb(p);
            });
        });
    },

    /**
     * Run set of tests on a value-taking method to ensure always returns a promise
     * inherited from correct Promise constructor.
     *
     * Function `fn` should call the static promise method being tested.
     * `fn` is called with a value `value` which should be the parameter of the method under test.
     * `fn` returns the resulting promise.
     * e.g. `return Promise.resolve(value)`
     *
     * A different `value` is provided in each test.
     * Values are a literal, or a promise that resolves/rejects.
     * Promises provided as values are instances of various different Promise constructors.
     *
     * @param {Function} fn - Test function
     * @returns {undefined}
     */
    testSetValueReturnsPromise: function(fn) {
        var u = this;
        u.testSetMethodValueReturnsPromise(function(handler, cb) {
    		var value = handler();
    		var p = fn(value);
            cb(p);
    	});
    },

    /**
     * Run set of tests on a method to ensure always returns a promise
     * inherited from correct Promise constructor.
     *
     * Test function `fn` is called with `handler` and `callback` functions.
     * `fn` should call the method being tested with `handler` as the callback,
     * and call `callback` with resulting promise.
     * e.g. `callback(Promise.try(handler))`
     *
     * A different `handler` is provided in each test.
     * Handlers return a literal value, or a promise that resolves/rejects, or throw an error.
     * Promises returned from handlers are instances of various different Promise constructors.
     *
     * @param {Function} fn - Test function
     * @returns {undefined}
     */
    testSetMethodReturnsPromise: function(fn) {
        var u = this;

        u.testSetMethodValueReturnsPromise(fn);

        u.test('thrown error', function(t) {
            fn(u.throwMethod(), function(p) {
                u.setRejectStatus(p);
                t.error(u.returnErrIfNotPromise(p));
                t.done(p);
            });
		});
    },

    /**
     * Run set of tests on a method to ensure always returns a promise
     * inherited from correct Promise constructor.
     *
     * Test function `fn` is called with `handler` and `callback` functions.
     * `fn` should call the method being tested with `handler` as the callback,
     * and call `callback` with resulting promise.
     * e.g. `callback(Promise.try(handler))`
     *
     * A different `handler` is provided in each test.
     * Handlers return a literal value, or a promise that resolves/rejects.
     * Promises returned from handlers are instances of various different Promise constructors.
     *
     * @param {Function} fn - Test function
     * @returns {undefined}
     */
    testSetMethodValueReturnsPromise: function(fn) {
        var u = this;

        u.test('literal value', function(t) {
            fn(u.literalMethod(), function(p) {
                t.error(u.returnErrIfNotPromise(p));
                t.done(p);
            });
        });

        u.altPromises.forEach(function(altPromiseParams) {
            var AltPromise = altPromiseParams.Promise;

            var _describe = (AltPromise ? describe : describe.skip);
            _describe('promise (' + altPromiseParams.name + ')', function() {
                u.test('resolved sync', function(t) {
                    fn(u.resolveSyncMethodAlt(AltPromise), function(p) {
                        t.error(u.returnErrIfNotPromise(p));
                        t.done(p);
                    });
                });

                u.test('resolved async', function(t) {
                    fn(u.resolveAsyncMethodAlt(AltPromise), function(p) {
                        t.error(u.returnErrIfNotPromise(p));
                        t.done(p);
                    });
                });

                u.test('rejected sync', function(t) {
                    fn(u.rejectSyncMethodAlt(AltPromise), function(p) {
                        t.error(u.returnErrIfNotPromise(p));
                        t.done(p);
                    });
                });

                u.test('rejected async', function(t) {
                    fn(u.rejectSyncMethodAlt(AltPromise), function(p) {
                        t.error(u.returnErrIfNotPromise(p));
                        t.done(p);
                    });
                });
            });
        });
    }
};
