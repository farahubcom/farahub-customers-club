const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;

class RunCampaignValidator {
	/**
	 * The validator rules
	 *
	 * @returns {object}
	 */
	rules() {
		return {
			campaignId: {
                in: ["params"],
				isMongoId: {
					bail: true,
				},
				custom: {
					options: (value, { req }) => {
						const Campaign = req.wsConnection.model("Campaign");
						return Campaign.findById(value).populate({ path: 'message' }).then((campaign) => {
							if (!campaign)
								return Promise.reject("ارسال گروهی یافت نشد.");

							if(campaign.shouldRunAt) {
								return Promise.reject("ارسال گروهی قبلا ارسال گردیده است.");
							}

							if(campaign.message.latestStatus?.status != 'confirmed') {
								return Promise.reject("پیامک ارسال گروهی تایید نشده است.");
							}

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
		};
	}
}

module.exports = RunCampaignValidator;
