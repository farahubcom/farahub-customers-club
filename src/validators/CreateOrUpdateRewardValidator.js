const { Doc } = require('@farahub/framework/facades');
const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;

class CreateOrUpdateRewardValidator {
	/**
	 * The validator rules
	 *
	 * @returns {object}
	 */
	rules() {
		return {
			rewards: {
				in: ["body"],
				optional: true,
				isArray: true,
			},
			"rewards.*.possiblity": {
				in: ["body"],
				isInt: true,
				toInt: true,
			},
			"rewards.*.message.id": {
				in: ["body"],
				optional: true,
				isMongoId: {
					bail: true,
				},
				custom: {
					options: (value, { req }) => {
						const Message = req.wsConnection.model("Message");
						return Doc.resolve(value, Message).then((message) => {
							if (!message)
								return Promise.reject("پیام یافت نشده");
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
			"rewards.*.message.content": {
				in: ["body"],
				isString: true,
				notEmpty: true,
				errorMessage: "ورود متن پیامک اجباری است.",
			},
			active: {
				in: ["body"],
				optional: true,
				isBoolean: true,
			},
		};
	}
}

module.exports = CreateOrUpdateRewardValidator;
