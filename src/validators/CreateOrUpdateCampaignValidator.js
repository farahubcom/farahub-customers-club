const { Doc } = require('@farahub/framework/facades');
const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;

class CreateOrUpdateCampaignValidator {
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
						const Campaign = req.wsConnection.model("Campaign");
						return Doc.resolve(value, Campaign).then((campaign) => {
							if (!campaign)
								return Promise.reject("ارسال گروهی یافت نشد.");
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
			"constraints.registerdBetween": {
				in: ["body"],
				optional: true,
				isArray: true,
			},
			"constraints.registerdBetween.*": {
				in: ["body"],
				notEmpty: true,
				isDate: true,
				toDate: true,
			},
			"constraints.timesVisited": {
				in: ["body"],
				optional: true,
				isInt: true,
				toInt: true,
			},
			"constraints.daysNotVisited": {
				in: ["body"],
				optional: true,
				isInt: true,
				toInt: true,
			},
			"constraints.countRandomly": {
				in: ["body"],
				optional: true,
				isInt: true,
				toInt: true,
			},
			"constraints.rateBetween": {
				in: ["body"],
				optional: true,
				isArray: true,
			},
			"constraints.rateBetween.*": {
				in: ["body"],
				notEmpty: true,
				isInt: true,
				toInt: true,
			},
		};
	}
}

module.exports = CreateOrUpdateCampaignValidator;
