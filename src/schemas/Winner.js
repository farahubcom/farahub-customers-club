const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;

const WinnerSchema = new Schema(
	{
		/**
		 * The person who wins
		 * 
		 * @var Person
		 */
		person: { type: ObjectId, ref: "Person", required: true },
		
		/**
		 * The time that winner received the price
		 * 
		 * @var Date
		 */
		receivedAt: Date,
	},
	{
		/**
		 * Name of the collection
		 *
		 * @var string
		 */

		collection: "customers-club:reviews",

		/**
		 * Enable timestamps for the collection
		 *
		 * @var bool
		 */
		timestamps: true,
	}
);

WinnerSchema.plugin(mongooseLeanVirtuals);

module.exports = WinnerSchema;
