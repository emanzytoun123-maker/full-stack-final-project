const express = require("express");
const router = express.Router();

const authMiddleware = require("../authMiddleware");
const {
  addSurplusOffer,
  getAvailableOffers,
  getMyRestaurantOffers,
  deleteSurplusOffer,
  updateSurplusOffer
} = require("../controllers/surplusOfferController");
router.post("/", authMiddleware, addSurplusOffer);

router.get("/", getAvailableOffers);
router.get("/my", authMiddleware, getMyRestaurantOffers);
router.delete("/:offerId", authMiddleware, deleteSurplusOffer);
router.patch("/:offerId", authMiddleware, updateSurplusOffer);
module.exports = router;