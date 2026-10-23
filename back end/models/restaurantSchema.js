const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    name: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String },
    address: { type: String },
    phone: { type: String },
    description: { type: String },
    crowdLevel: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "low"
    },
    waitTimeMinutes: { type: Number, default: 0 }
});

module.exports = mongoose.model("Restaurant", restaurantSchema);