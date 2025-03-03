const mongoose = require("mongoose");
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;


const PersonSchema = new Schema({

    /**
     * Person references array
     * 
     * @var array
     */
    references: [Date],
}, { timestamps: true });

PersonSchema.plugin(mongooseLeanVirtuals);

module.exports = PersonSchema;