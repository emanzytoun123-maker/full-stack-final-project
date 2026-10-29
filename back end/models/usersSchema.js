const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
    name: { type: String, required: true },
   email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
},
    password: { type: String, required: true },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        required: true
    }
});

module.exports = mongoose.model("Users", usersSchema);