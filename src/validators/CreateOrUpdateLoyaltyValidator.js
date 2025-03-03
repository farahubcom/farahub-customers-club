const { Doc } = require('@farahub/framework/facades');
const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;

class CreateOrUpdateLoyaltyValidator {
	/**
	 * The validator rules
	 *
	 * @returns {object}
	 */
	rules() {
		return {
			id: {
				in: ["body"],
				optional: true,
				isMongoId: {
					bail: true,
				},
				custom: {
					options: (value, { req }) => {
						const Loyalty = req.wsConnection.model("Loyalty");
						return Doc.resolve(value, Loyalty).then((loyalty) => {
							if (!loyalty)
								return Promise.reject("برنامه وفاداری یافت نشد.");
							return Promise.resolve(true);
						});
					},
					bail: true,
				},
				customSanitizer: {
					options: (value, { req }) => {
						return ObjectId(value);
					},
				},
			},
			name: {
				in: ["body"],
				isString: true,
				notEmpty: true,
				errorMessage: "ورود عنوان اجباری است.",
			},
			content: {
				in: ["body"],
				isString: true,
				notEmpty: true,
				errorMessage: "ورود متن پیامک اجباری است.",
			},
			startAt: {
				in: ["body"],
				optional: true,
				// notEmpty: true,
			},
			endAt: {
				in: ["body"],
				optional: true,
			},
			targets: {
				in: ["body"],
				optional: true,
				isArray: true,
			},
			"targets.*": {
				in: ["body"],
				custom: {
					options: (value, { req }) => {
						const Category = req.wsConnection.model("Category");
						return Doc.resolve(value, Category).then((category) => {
							if (!category) return Promise.reject(false);
							return Promise.resolve(true);
						});
					},
					bail: true,
				},
				customSanitizer: {
					options: (value, { req }) => {
						const Category = req.wsConnection.model("Category");
						return Doc.resolve(value, Category);
					},
				},
			},
			"options.filters.registerdBetween": {
				in: ["body"],
				optional: true,
				isArray: true,
			},
			"options.filters.registerdBetween.*": {
				in: ["body"],
				notEmpty: true,
				isDate: true,
				toDate: true,
			},
			"options.filters.timesVisited": {
				in: ["body"],
				optional: true,
				isInt: true,
				toInt: true,
			},
			"options.filters.daysNotVisited": {
				in: ["body"],
				optional: true,
				isInt: true,
				toInt: true,
			},
			"options.filters.countRandomly": {
				in: ["body"],
				optional: true,
				isInt: true,
				toInt: true,
			},
			"options.filters.rateBetween": {
				in: ["body"],
				optional: true,
				isArray: true,
			},
			"options.filters.rateBetween.*": {
				in: ["body"],
				notEmpty: true,
				isInt: true,
				toInt: true,
			},
		};
	}
}

module.exports = CreateOrUpdateLoyaltyValidator;
