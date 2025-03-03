const mongoose = require("mongoose");
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;


const LoyaltySchema = new Schema({

    /**
     * Name of the loyalty program
     * 
     * @var string
     */
    name: { type: String, required: true },

    /**
     * Step message
     * 
     * @var Message
     */
    message: { type: ObjectId, ref: 'Message', required: true },

    /**
     * Send message at the nth consecutive visit
     * 
     * @var int
     */
    consecutiveVisitNumber: { type: Number, required: true },

    /**
     * Determine whether active
     * 
     * @var bool
     */
    active: { type: Boolean, default: true },
}, {

    /**
     * Name of the collection
     * 
     * @var string
     */

    collection: "customers-club:loyalties",

    /**
     * Enable timestamps for the collection
     * 
     * @var bool
     */
    timestamps: true,
});

LoyaltySchema.plugin(mongooseLeanVirtuals);

module.exports = LoyaltySchema;