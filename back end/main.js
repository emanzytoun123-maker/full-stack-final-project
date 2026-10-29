const express = require("express");
require("./models/db");
require("dotenv").config();
const restaurantRouter = require("./routers/restaurantRouter");
const menuItemRouter = require("./routers/menuItemRouter");
const userRouter = require("./routers/userRouter");
const orderRouter = require("./routers/orderRouter");
const surplusOfferRouter = require("./routers/surplusOfferRouter");
const app = express();

app.use(express.json());
app.use("/users", userRouter);
app.use("/restaurants", restaurantRouter);
app.use("/menu-items", menuItemRouter);
app.use("/surplus-offers", surplusOfferRouter);
app.use("/orders", orderRouter);

app.get("/", (req, res) => {
  res.send("Tal3etna API is working");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});