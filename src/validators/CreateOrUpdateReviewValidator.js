const { Doc } = require('@farahub/framework/facades');
const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;

class CreateOrUpdateReviewValidator {
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
						const Review = req.wsConnection.model("Review");
						return Doc.resolve(value, Review).then((review) => {
							if (!review)
								return Promise.reject("نظرسنجی یافت نشد.");
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
			"options.filters.delayHour": {
				in: ["body"],
				optional: true,
				isInt: true,
				toInt: true,
			},
		};
	}
}

module.exports = CreateOrUpdateReviewValidator;
