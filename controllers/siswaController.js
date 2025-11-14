const siswaModel = require("../models/siswaModel");

exports.getAllSiswa = async (_req, res) => {
  try {
    const siswa = await siswaModel.getAll();
    res.json(siswa);
  } catch (err) {
    console.error("GET /api/siswa:", err);
    res.status(500).json({ message: "Gagal memuat data siswa" });
  }
};

exports.createSiswa = async (req, res) => {
  try {
    const { nama, nis, kelas, alamat } = req.body;
    if (!nama || !nis || !kelas) {
      return res.status(400).json({ message: "Nama, NIS, dan kelas wajib diisi" });
    }

    const existing = await siswaModel.getByNis(nis);
    if (existing) {
      return res.status(409).json({ message: "NIS sudah terdaftar" });
    }

    const created = await siswaModel.create({ nama, nis, kelas, alamat });
    res.status(201).json(created);
  } catch (err) {
    console.error("POST /api/siswa:", err);
    res.status(500).json({ message: "Gagal menyimpan data siswa" });
  }
};

exports.updateSiswa = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, nis, kelas, alamat } = req.body;

    const existing = await siswaModel.getById(id);
    if (!existing) {
      return res.status(404).json({ message: "Data siswa tidak ditemukan" });
    }

    if (nis && nis !== existing.nis) {
      const duplicate = await siswaModel.getByNis(nis);
      if (duplicate) {
        return res.status(409).json({ message: "NIS sudah terdaftar" });
      }
    }

    const updated = await siswaModel.update(id, {
      nama: nama ?? existing.nama,
      nis: nis ?? existing.nis,
      kelas: kelas ?? existing.kelas,
      alamat: alamat ?? existing.alamat,
    });

    res.json(updated);
  } catch (err) {
    console.error("PUT /api/siswa/:id:", err);
    res.status(500).json({ message: "Gagal memperbarui data siswa" });
  }
};

exports.deleteSiswa = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await siswaModel.remove(id);
    if (!deleted) {
      return res.status(404).json({ message: "Data siswa tidak ditemukan" });
    }

    res.json({ message: "Data siswa berhasil dihapus" });
  } catch (err) {
    console.error("DELETE /api/siswa/:id:", err);
    res.status(500).json({ message: "Gagal menghapus data siswa" });
  }
};
