const { Doc } = require('@farahub/framework/facades');
const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;


class CampaignDeleteValidator {

    /**
     * The validator rules
     * 
     * @returns {object}
     */
    rules() {
        return {
            personId: {
                in: ["params"],
                isMongoId: {
                    bail: true
                },
                custom: {
                    options: (value, { req }) => {
                        const Campaign = req.wsConnection.model('Campaign');
                        return Doc.resolve(value, Campaign).then(campaign => {
                            if (!campaign)
                                return Promise.reject(false);
                            return Promise.resolve(true);
                        })
                    },
                    bail: true
                },
                customSanitizer: {
                    options: (value, { req }) => {
                        return ObjectId(value);
                    }
                }
            }
        }
    }

    /**
     * Custom validation formatter
     * 
     * @returns {func}
     */
    toResponse(res, { errors }) {
        return res.status(404).json({
            ok: false,
            message: 'Campaign not found'
        })
    }
}

module.exports = CampaignDeleteValidator;