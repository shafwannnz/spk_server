const express = require("express");
const kriteriaController = require("../controllers/kriteriaController");
const { authenticate, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/", kriteriaController.getAllKriteria);
router.post("/", requireRole("admin"), kriteriaController.createKriteria);
router.put("/:id", requireRole("admin"), kriteriaController.updateKriteria);
router.delete("/:id", requireRole("admin"), kriteriaController.deleteKriteria);

module.exports = router;
