const express = require("express");
const router = express.Router();

const authMiddleware = require("../authMiddleware");

const {
  addSurplusOffer,
  getAvailableOffers
} = require("../controllers/surplusOfferController");

router.post("/", authMiddleware, addSurplusOffer);

router.get("/", getAvailableOffers);

module.exports = router;