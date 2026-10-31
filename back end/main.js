const express = require("express");
const cors = require('cors')
require("./models/db");
require("dotenv").config();
const restaurantRouter = require("./routers/restaurantRouter");
const menuItemRouter = require("./routers/menuItemRouter");
const userRouter = require("./routers/userRouter");
const orderRouter = require("./routers/orderRouter");
const surplusOfferRouter = require("./routers/surplusOfferRouter");
const tableReservationRouter = require("./routers/tableReservationRouter");
const outingRouter = require("./routers/outingRouter");
const notificationRouter = require("./routers/notificationRouter");
const app = express();
app.use(cors({
  origin: 'http://localhost:5173'
}))
app.use(express.json());

app.use("/users", userRouter);
app.use("/restaurants", restaurantRouter);
app.use("/menu-items", menuItemRouter);
app.use("/surplus-offers", surplusOfferRouter);
app.use("/orders", orderRouter);
app.use("/outings", outingRouter);
app.use("/reservations", tableReservationRouter);
app.use("/notifications", notificationRouter);
app.get("/", (req, res) => {
  res.send("Tal3etna API is working");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});