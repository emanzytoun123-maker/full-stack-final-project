const mongoose = require("mongoose");

const outingOptionSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    },
    votes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }]
});

const outingSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    title: { type: String, required: true },
    city: { type: String, required: true },
    date: { type: Date },
    inviteCode: { type: String, required: true },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }],
    options: [outingOptionSchema],
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant"
    },
    status: {
        type: String,
        enum: ["open", "closed"],
        default: "open"
    }
});

module.exports = mongoose.model("Outing", outingSchema);