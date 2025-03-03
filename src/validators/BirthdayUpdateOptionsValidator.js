class BirthdayUpdateOptionsValidator {

    /**
     * The validator rules
     * 
     * @returns {object}
     */
    rules() {
        return {
			receive_birthday_content: {
				in: ["body"],
				optional: true,
				isString: true,
			},
			receive_birthday_active: {
				in: ["body"],
				optional: true,
				isBoolean: true,
			},
			receive_birthday_delay: {
				in: ["body"],
				optional: true,
				isInt: {
					min: 0, // 08:00
					max: 14 // 08:00 + 14 = 22:00
				},
				toInt: true,
			},

			birthday_content: {
				in: ["body"],
				optional: true,
				isString: true,
			},
			birthday_active: {
				in: ["body"],
				optional: true,
				isBoolean: true,
			},
			birthday_delay: {
				in: ["body"],
				optional: true,
				isInt: {
					min: 0, // 08:00
					max: 14 // 08:00 + 14 = 22:00
				},
				toInt: true,
			},
        }
    }
}

module.exports = BirthdayUpdateOptionsValidator;