/*
 * cls-bluebird tests
 * Utilities
 * Function to create constructors for `Test` and `TestError` and add to `utils` object.
 * Mixin to Utils prototype.
 */

// Modules
var util = require('util');

// Exports
module.exports = function(u) {
	var Promise = u.Promise;

	/**
     * TestError constructor.
	 * All promises created in the tests that reject are rejected with a TestError.
	 * NB Inherits from `Promise.OperationalError` rather than plain `Error` so can be caught by `.error()`
	 * @constructor
	 */
	function TestError() {
        Promise.OperationalError.call(this, '<rejection value>');
        this.name = 'ClsBluebirdTestError';
    }
    util.inherits(TestError, Promise.OperationalError);

	// Add TestError to utils object
    u.TestError = TestError;

    /**
     * Test object constructor.
     * @constructor
     * @param {Function} done - Callback to be called when test is complete (i.e. `test.done()` is called)
     */
    function Test(done) {
    	this._done = done;
    }

    Test.prototype = {
    	/**
    	 * Register error.
    	 * If called with a value, it is registered as error for the test.
    	 * (if an error is already registered, it is ignored - 1st error takes precedence)
    	 * @param {Error|undefined}
    	 * @returns {undefined}
    	 */
    	error: function(err) {
    		if (err !== undefined && !this._err) this._err = err;
    	},

    	/**
    	 * Completes test.
    	 * @param {Promise} promise - Test completes when this promise settles
    	 * @param {boolean} [rejects] - true if promise is expected to reject, false if not
    	 * @param {Function} [final] - Function to execute after promise settles but before test completes.
    	 *        Last chance to register an error e.g. an event should have happened before this point but didn't.
    	 * @returns {undefined}
    	 */
    	done: function(promise, rejects, final) {
    		var test = this;
    		promise.then(function() {
    			if (final) final();
    			if (rejects) test.error(new Error('Promise should not be resolved'));
    			test._done(this._err);
    		}, function(err) {
    			if (final) final();
    			if (!rejects || !(err instanceof TestError)) test.error(err || new Error('Empty rejection'));
    			test._done(this._err);
    		});
    	}
    };

	// Add Test to utils object
    u.Test = Test;
};
