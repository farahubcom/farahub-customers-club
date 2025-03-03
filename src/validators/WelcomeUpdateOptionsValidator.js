class WelcomeUpdateOptionsValidator {
	/**
	 * The validator rules
	 *
	 * @returns {object}
	 */
	rules() {
		return {
			welcome_content: {
				in: ["body"],
				optional: true,
				isString: true,
			},
			welcome_active: {
				in: ["body"],
				optional: true,
				isBoolean: true,
			},
			welcome_delay: {
				in: ["body"],
				optional: true,
				isInt: {
					min: 0, // 08:00
					max: 14 // 08:00 + 14 = 22:00
				},
				toInt: true,
			},

			revisit_content: {
				in: ["body"],
				optional: true,
				isString: true,
			},
			revisit_active: {
				in: ["body"],
				optional: true,
				isBoolean: true,
			},
			revisit_delay: {
				in: ["body"],
				optional: true,
				isInt: {
					min: 0, // 08:00
					max: 14 // 08:00 + 14 = 22:00
				},
				toInt: true,
			},
		};
	}
}

module.exports = WelcomeUpdateOptionsValidator;
