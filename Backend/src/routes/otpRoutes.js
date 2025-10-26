const express = require("express");
const router = express.Router();
const { requestReset, verifyReset } = require("../controllers/otpController");

router.post("/request-reset", requestReset);
router.post("/verify-reset", verifyReset);

module.exports = router;
