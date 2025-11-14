const express = require("express");
const siswaController = require("../controllers/siswaController");
const { authenticate, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate); // semua rute siswa butuh token

router.get("/", siswaController.getAllSiswa);
router.post("/", requireRole("admin"), siswaController.createSiswa);
router.put("/:id", requireRole("admin"), siswaController.updateSiswa);
router.delete("/:id", requireRole("admin"), siswaController.deleteSiswa);

module.exports = router;
