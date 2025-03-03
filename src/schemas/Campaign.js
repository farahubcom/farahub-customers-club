const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;

const CampaignSchema = new Schema(
	{
		/**
		 * Content of the campaign
		 * 
		 * @var Message
		 */
		message: { type: ObjectId, ref: 'Message', required: true },

		/**
		 * Campaign constraints
		 * 
		 * @var Object
		 */
		constraints: Object,

		/**
		 * Campaign targets
		 * 
		 * @var array
		 */
		targets: [
			{
				target: { type: ObjectId, refPath: "targets.onModel" },
				includes: [{ type: ObjectId, ref: "Person" }],
				excludes: [{ type: ObjectId, refPath: "Person" }],
				onModel: { type: String, enum: ["Person", "Category", "Tag"] },
			},
		],

		/**
		 * The time that should run the campaign
		 * 
		 * @var Date
		 */
		shouldRunAt: Date,

		/**
		 * The time that campaign has been finished
		 * 
		 * @var Date
		 */
		finishedAt: Date,
	},
	{
		/**
		 * Name of the collection
		 *
		 * @var string
		 */

		collection: "customers-club:campaigns",

		/**
		 * Enable timestamps for the collection
		 *
		 * @var bool
		 */
		timestamps: true,
	}
);

CampaignSchema.plugin(mongooseLeanVirtuals);

module.exports = CampaignSchema;
