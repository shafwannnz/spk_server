const express = require("express");
const router = express.Router();
const perhitunganController = require("../controllers/perhitunganController");

router.post("/apk", perhitunganController.runApk);
router.get("/apk/status", perhitunganController.getStatus);

module.exports = router;
