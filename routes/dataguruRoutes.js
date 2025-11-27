const express = require("express");
const guruController = require("../controllers/dataguruController");
const { authenticate, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// Semua rute di bawah ini memerlukan otentikasi
router.use(authenticate);

// Rute CRUD dasar untuk guru (hanya admin yang bisa akses)
router.get("/", requireRole("admin"), guruController.getAllGuru);
router.post("/", requireRole("admin"), guruController.createGuru);
router.put("/:id", requireRole("admin"), guruController.updateGuru);
router.delete("/:id", requireRole("admin"), guruController.deleteGuru);

// Rute untuk fitur penilaian dan laporan (bisa diakses guru dan admin)
router.post("/nilai", requireRole("guru", "admin"), guruController.tambahNilaiSiswa);
router.get("/laporan", requireRole("guru", "admin"), guruController.lihatLaporan);
router.get("/laporan/cetak", requireRole("guru", "admin"), guruController.cetakLaporan);

// Rute untuk laporan AHP dan keputusan
router.get("/laporan-ahp", requireRole("guru", "admin"), guruController.getLaporanAhp);
router.get("/laporan-ahp/export", requireRole("guru", "admin"), guruController.exportLaporanAhpHtml);
router.get("/keputusan", requireRole("guru", "admin"), guruController.getKeputusan);
router.get("/keputusan/export", requireRole("guru", "admin"), guruController.exportKeputusanHtml);
router.get("/laporan-ahp", requireRole("guru", "admin"), guruController.getLaporanAhp);
router.get("/laporan-ahp/export", requireRole("guru", "admin"), guruController.exportLaporanAhpHtml);

module.exports = router;

