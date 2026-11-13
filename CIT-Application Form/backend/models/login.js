const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    loginTime: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model(
    "LoginHistory",
    loginHistorySchema,
    "LoginHistory"
);
