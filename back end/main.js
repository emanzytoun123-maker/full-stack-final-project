const db = require("./models/db");
const express = require("express");

require("./models/db");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Tal3etna API is working");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});