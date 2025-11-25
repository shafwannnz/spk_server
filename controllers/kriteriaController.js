const kriteriaModel = require("../models/kriteriaModel");

exports.getAllKriteria = async (_req, res) => {
  try {
    const kriteria = await kriteriaModel.getAll();
    res.json(kriteria);
  } catch (err) {
    console.error("GET /api/kriteria:", err);
    res.status(500).json({ message: "Gagal memuat data kriteria" });
  }
};

// ...existing code...
exports.createKriteria = async (req, res) => {
  try {
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Body:", req.body);

    const { nama_kriteria, bobot, deskripsi } = req.body;

    // validasi nama_kriteria (kosong/spasi dianggap invalid)
    if (nama_kriteria == null || String(nama_kriteria).trim() === "") {
      return res.status(400).json({ message: "Nama kriteria wajib diisi" });
    }

    // konversi bobot jika dikirim sebagai string
    const bobotNum = bobot === undefined ? undefined : Number(bobot);
    if (bobotNum === undefined || Number.isNaN(bobotNum)) {
      return res.status(400).json({ message: "Bobot wajib diisi dan harus angka" });
    }

    const payload = { nama_kriteria: String(nama_kriteria).trim(), bobot: bobotNum };
    if (deskripsi != null) payload.deskripsi = String(deskripsi);

    const created = await kriteriaModel.create(payload);
    res.status(201).json(created);
  } catch (err) {
    console.error("POST /api/kriteria:", err);
    res.status(500).json({ message: "Gagal menyimpan data kriteria" });
  }
};
// ...existing code...

exports.updateKriteria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_kriteria, bobot } = req.body;

    const existing = await kriteriaModel.getById(id);
    if (!existing) {
      return res.status(404).json({ message: "Data kriteria tidak ditemukan" });
    }

    const updated = await kriteriaModel.update(id, {
      nama_kriteria: nama_kriteria ?? existing.nama_kriteria,
      bobot: bobot ?? existing.bobot,
    });

    res.json(updated);
  } catch (err) {
    console.error("PUT /api/kriteria/:id:", err);
    res.status(500).json({ message: "Gagal memperbarui data kriteria" });
  }
};

exports.deleteKriteria = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await kriteriaModel.remove(id);
    if (!deleted) {
      return res.status(404).json({ message: "Data kriteria tidak ditemukan" });
    }

    res.json({ message: "Data kriteria berhasil dihapus" });
  } catch (err) {
    console.error("DELETE /api/kriteria/:id:", err);
    res.status(500).json({ message: "Gagal menghapus data kriteria" });
  }
};
