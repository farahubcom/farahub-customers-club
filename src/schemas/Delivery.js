const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;

const DeliverySchema = new Schema(
	{
		/**
		 * The message to deliver
		 * 
		 * @var Message
		 */
		message: { type: ObjectId, ref: "Message", required: true },

		/**
		 * The person to be delivered
		 * 
		 * @var Person
		 */
		to: { type: ObjectId, ref: "Person", required: true },

		/**
		 * The time that should sent the message
		 * 
		 * this time used by jobs and should be valid when store 
		 * (this time should be the times of the day not bothering people. e.g: 08:00-22:00)
		 * 
		 * @var Date
		 */
		shouldSentAt: { type: Date, required: true },

		/**
		 * Time that deliveried
		 * 
		 * @var Date
		 */
		sentAt: Date,
	},
	{
		/**
		 * Name of the collection
		 *
		 * @var string
		 */

		collection: "customers-club:deliveries",

		/**
		 * Enable timestamps for the collection
		 *
		 * @var bool
		 */
		timestamps: true,
	}
);

DeliverySchema.pre('save', function (next) {
    this.wasNew = this.isNew;
    next();
});

DeliverySchema.plugin(mongooseLeanVirtuals);

module.exports = DeliverySchema;
