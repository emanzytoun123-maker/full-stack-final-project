const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/tal3etna")
    .then(() => {
        console.log("Database is ready to use");
    })
    .catch((err) => {
        console.log(err);
    })