/*
 * cls-bluebird tests
 * Utilities
 * Helper functions.
 * Mixin to Utils prototype.
 */

// Exports

module.exports = {
	/**
	 * Calculate number of times handler callback should be called for a static method
	 * that received array and handler.
	 *
	 * Worked out based on rejection status of value & handler, and options describing the method.
	 * It works around various kinks in bluebird's behavior.
	 *
	 * @param {Function} makeValue - Function to call to make the value method acts upon
	 * @param {Function} handler - Handler function
	 * @param {Object} options - Options object
	 * @param {boolean} [options.series=false] - true if method iterates through array in series
	 * @param {boolean} [options.oneCallback=false] - true if callback should only be called once (e.g. `Promise.join()`)
	 * @returns {number} - Number of times handler should be run.
	 */
	helperStaticArrayNumHandlerCalls: function(makeValue, handler, options) {
		var u = this;

		// TODO raise issue on bluebird about inconsistent behavior between node v0.10 and v0.12+
		var oneCall = handler._throws || options.oneCallback || (
			u.getRejectStatus(handler)
			&& (
				options.series
				|| (
					!handler._async
					&& (
						handler._constructor === u.Promise
						|| (u.nodeVersion === '0.10' && makeValue._asyncArray)
					)
				)
			)
		);

		return oneCall ? 1 : 3;
	},

	/**
	 * Calculate number of times handler callback should be called for a prototype method
	 * that chains onto promise of an array.
	 *
	 * Worked out based on rejection status of value & handler, sync/async of attach function,
	 * and options describing the method.
	 * It works around various kinks in bluebird's behavior.
	 *
	 * @param {Function} makePromise - Function to call to make the promise method chain on to
	 * @param {Function} attach - Function to either execute callback now or in next tick
	 * @param {Function} handler - Handler function
	 * @param {Object} options - Options object
	 * @param {boolean} [options.series=false] - true if method iterates through array in series
	 * @param {boolean} [options.oneCallback=false] - true if callback should only be called once (e.g. `Promise.join()`)
	 * @returns {number} - Number of times handler should be run.
	 */
	helperProtoArrayNumHandlerCalls: function(makePromise, attach, handler, options) {
		var u = this;

		// TODO raise issue on bluebird about inconsistent behavior between node v0.10 and v0.12+
		var oneCall = handler._throws || options.oneCallback || (
			u.getRejectStatus(handler)
			&& (
				options.series
				|| (
					!handler._async
					&& (
						handler._constructor === u.Promise
						|| (
							u.nodeVersion === '0.10'
							&& makePromise._asyncArray
							&& (makePromise._async || !attach._async)
						)
					)
				)
			)
		);

		return oneCall ? 1 : 3;
	}
};
