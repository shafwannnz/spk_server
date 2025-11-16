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

exports.createKriteria = async (req, res) => {
  try {
    const { nama_kriteria, bobot } = req.body;
    if (!nama_kriteria || bobot === undefined) {
      return res.status(400).json({ message: "Nama kriteria dan bobot wajib diisi" });
    }

    const created = await kriteriaModel.create({ nama_kriteria, bobot });
    res.status(201).json(created);
  } catch (err) {
    console.error("POST /api/kriteria:", err);
    res.status(500).json({ message: "Gagal menyimpan data kriteria" });
  }
};

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
