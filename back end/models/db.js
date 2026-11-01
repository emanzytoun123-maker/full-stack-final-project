const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Database is ready to use");
    })
    .catch((err) => {
        console.log("Database connection error:", err);
    });