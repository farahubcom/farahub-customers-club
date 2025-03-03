const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;

const RetargetSchema = new Schema(
	{
		/**
		 * Name of the retarget plan
		 * 
		 * @var String
		 */
		name: { type: String, required: true },

		/**
		 * Content of the retarget plan
		 * 
		 * @var Message
		 */
		message: { type: ObjectId, ref: 'Message', required: true },

		/**
		 * Retarget constraints
		 * 
		 * @var int
		 */
		consecutiveNonReferralCount: { type: Number, required: true },

		/**
		 * Determine if plan is active
		 * 
		 * @var Boolean
		 */
		active: { type: Boolean, default: false },
	},
	{
		/**
		 * Name of the collection
		 *
		 * @var string
		 */

		collection: "customers-club:retargets",

		/**
		 * Enable timestamps for the collection
		 *
		 * @var bool
		 */
		timestamps: true,
	}
);

RetargetSchema.plugin(mongooseLeanVirtuals);

module.exports = RetargetSchema;
