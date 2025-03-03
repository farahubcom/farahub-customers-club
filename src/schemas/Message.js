const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const { Schema } = mongoose;

const MessageSchema = new Schema(
	{
		content: { type: String, required: true },
		type: { 
			type: String, 
			enum: ["welcome", "revisit", "receive_birthday", "birthday", "campaign", "reward"], 
			required: true,
		},
		statuses: [
			{
				status: {
					type: String,
					enum: ["pending", "rejected", "confirmed"],
					required: true,
				},
				description: String,
				createdAt: { type: Date, required: true },
			},
		],
	},
	{
		/**
		 * Name of the collection
		 *
		 * @var string
		 */

		collection: "customers-club:messages",

		/**
		 * Enable timestamps for the collection
		 *
		 * @var bool
		 */
		timestamps: true,
	}
);

MessageSchema.pre('save', function (next) {
    this.wasNew = this.isNew;

	if (this.isModified('content')) {
		this.statuses = [...this.statuses, {
			status: 'pending',
			createdAt: new Date
		}]
	}

    next();
});

MessageSchema.plugin(mongooseLeanVirtuals);

module.exports = MessageSchema;
