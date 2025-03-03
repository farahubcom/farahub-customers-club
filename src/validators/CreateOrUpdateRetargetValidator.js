const { Doc } = require('@farahub/framework/facades');
const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;

class CreateOrUpdateRetargetValidator {
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
						const Retarget = req.wsConnection.model("Retarget");
						return Doc.resolve(value, Retarget).then((retarget) => {
							if (!retarget)
								return Promise.reject("هدفگیری مجدد یافت نشد.");
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
				errorMessage: "ورود نام اجباری است.",
			},
			"message.id": {
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
			"message.content": {
				in: ["body"],
				isString: true,
				notEmpty: true,
				errorMessage: "ورود متن پیامک اجباری است.",
			},
			consecutiveNonReferralCount: {
				in: ["body"],
				isInt: true,
				toInt: true,
			},
			active: {
				in: ["body"],
				optional: true,
				isBoolean: true,
			}
		};
	}
}

module.exports = CreateOrUpdateRetargetValidator;
