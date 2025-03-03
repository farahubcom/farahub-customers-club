class WinnerUpdateOptionsValidator {
	/**
	 * The validator rules
	 *
	 * @returns {object}
	 */
	rules() {
		return {
			message: {
				in: ["body"],
				isString: true,
			},
			count: {
				in: ["body"],
				isInt: true,
				toInt: true,
			},
			interval: {
				in: ["body"],
				notEmpty: true,
				isIn: {
					options: ["daily", "weekly", "monthly", "3 months", "6 months"]
				}
			},
			active: {
				in: ["body"],
				optional: true,
				isBoolean: true,
			},
		};
	}
}

module.exports = WinnerUpdateOptionsValidator;
