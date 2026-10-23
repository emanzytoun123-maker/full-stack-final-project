const mongoose = require("mongoose");

const rolesSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        unique: true
    },
    permissions: [{ type: String }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }
});

module.exports = mongoose.model("Role", rolesSchema);