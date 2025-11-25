const guruModel = require("../models/dataguruModel");
const penilaianModel = require("../models/penilaianModel");

exports.getAllGuru = async (_req, res) => {
  try {
    const guru = await guruModel.getAll();
    // Map DB column names to client-friendly names
    const mapped = guru.map((g) => ({
      id: g.id,
      nama: g.nama,
      nip: g.nip,
      alamat: g.alamat,
      user_id: g.user_id,
      mataPelajaran: g.mata_pelajaran ?? g.mataPelajaran ?? "",
      status: g.status ?? "",
      created_at: g.created_at,
    }));
    res.json(mapped);
  } catch (err) {
    console.error("GET /api/guru:", err);
    res.status(500).json({ message: "Gagal memuat data guru" });
  }
};

exports.createGuru = async (req, res) => {
  try {
    console.log("POST /api/guru - Content-Type:", req.headers["content-type"]);
    console.log("POST /api/guru - Body:", req.body);
    const { nama, nip, alamat, user_id, mataPelajaran, status } = req.body;
    if (!nama || !nip) {
      return res.status(400).json({ message: "Nama dan NIP wajib diisi" });
    }

    const existing = await guruModel.getByNip(nip);
    if (existing) {
      return res.status(409).json({ message: "NIP sudah terdaftar" });
    }

    if (user_id) {
      const userGuru = await guruModel.getByUserId(user_id);
      if (userGuru) {
        return res.status(409).json({ message: "User ID sudah terhubung dengan guru lain" });
      }
    }

    const created = await guruModel.create({
      nama,
      nip,
      alamat,
      user_id,
      mata_pelajaran: mataPelajaran ?? null,
      status: status ?? null,
    });
    res.status(201).json(created);
  } catch (err) {
    console.error("POST /api/guru:", err);
    res.status(500).json({ message: "Gagal menyimpan data guru" });
  }
};

exports.updateGuru = async (req, res) => {
  try {
    console.log("PUT /api/guru/:id - Content-Type:", req.headers["content-type"]);
    console.log("PUT /api/guru/:id - Body:", req.body);
    const { id } = req.params;
    const { nama, nip, alamat, user_id, mataPelajaran, status } = req.body;

    const existing = await guruModel.getById(id);
    if (!existing) {
      return res.status(404).json({ message: "Data guru tidak ditemukan" });
    }

    if (nip && nip !== existing.nip) {
      const duplicate = await guruModel.getByNip(nip);
      if (duplicate) {
        return res.status(409).json({ message: "NIP sudah terdaftar" });
      }
    }
    
    if (user_id && user_id !== existing.user_id) {
      const userGuru = await guruModel.getByUserId(user_id);
      if (userGuru) {
        return res.status(409).json({ message: "User ID sudah terhubung dengan guru lain" });
      }
    }

    const updated = await guruModel.update(id, {
      nama: nama ?? existing.nama,
      nip: nip ?? existing.nip,
      alamat: alamat ?? existing.alamat,
      user_id: user_id ?? existing.user_id,
      mata_pelajaran: mataPelajaran ?? existing.mata_pelajaran ?? existing.mataPelajaran ?? null,
      status: status ?? existing.status ?? null,
    });

    // Map to client-friendly shape
    const mapped = {
      id: updated.id,
      nama: updated.nama,
      nip: updated.nip,
      alamat: updated.alamat,
      user_id: updated.user_id,
      mataPelajaran: updated.mata_pelajaran ?? updated.mataPelajaran ?? "",
      status: updated.status ?? "",
      created_at: updated.created_at,
    };

    res.json(mapped);
  } catch (err) {
    console.error("PUT /api/guru/:id:", err);
    res.status(500).json({ message: "Gagal memperbarui data guru" });
  }
};

exports.deleteGuru = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await guruModel.remove(id);
    if (!deleted) {
      return res.status(404).json({ message: "Data guru tidak ditemukan" });
    }

    res.json({ message: "Data guru berhasil dihapus" });
  } catch (err) {
    console.error("DELETE /api/guru/:id:", err);
    res.status(500).json({ message: "Gagal menghapus data guru" });
  }
};

// Fitur Penilaian dan Laporan

exports.tambahNilaiSiswa = async (req, res) => {
  try {
    const { id_siswa, id_kriteria, nilai } = req.body;
    if (!id_siswa || !id_kriteria || nilai === undefined) {
      return res.status(400).json({ message: "Siswa, kriteria, dan nilai wajib diisi" });
    }

    // Dapatkan id_guru dari user yang login
    const guru = await guruModel.getByUserId(req.user.id);
    if (!guru) {
      return res.status(403).json({ message: "Akses ditolak. Akun Anda tidak terhubung dengan data guru." });
    }

    const result = await penilaianModel.upsert({
      id_siswa,
      id_kriteria,
      id_guru: guru.id,
      nilai,
    });

    res.status(201).json(result);
  } catch (err) {
    console.error("POST /api/guru/nilai:", err);
    res.status(500).json({ message: "Gagal menyimpan nilai siswa" });
  }
};

exports.lihatLaporan = async (req, res) => {
  try {
    const { id_siswa } = req.query;
    let laporan;

    if (id_siswa) {
      laporan = await penilaianModel.getLaporanBySiswaId(id_siswa);
    } else {
      laporan = await penilaianModel.getLaporan();
    }

    res.json(laporan);
  } catch (err) {
    console.error("GET /api/guru/laporan:", err);
    res.status(500).json({ message: "Gagal memuat laporan" });
  }
};

exports.cetakLaporan = async (_req, res) => {
  try {
    const laporan = await penilaianModel.getLaporan();

    // Group by student
    const laporanBySiswa = laporan.reduce((acc, curr) => {
      const { nama_siswa, nis, kelas } = curr;
      if (!acc[nama_siswa]) {
        acc[nama_siswa] = {
          nis,
          kelas,
          nilai: [],
        };
      }
      acc[nama_siswa].nilai.push(curr);
      return acc;
    }, {});

    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Laporan Penilaian Siswa</title>
        <style>
          body { font-family: sans-serif; margin: 2em; }
          h1, h2 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 2em; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .student-info { margin-bottom: 1em; }
        </style>
      </head>
      <body>
        <h1>Laporan Penilaian Siswa</h1>
    `;

    for (const nama_siswa in laporanBySiswa) {
      const siswa = laporanBySiswa[nama_siswa];
      html += `
        <div class="student-report">
          <h2>${nama_siswa}</h2>
          <div class="student-info">
            <strong>NIS:</strong> ${siswa.nis}<br>
            <strong>Kelas:</strong> ${siswa.kelas}
          </div>
          <table>
            <thead>
              <tr>
                <th>Kriteria Penilaian</th>
                <th>Nilai</th>
                <th>Bobot</th>
                <th>Guru Penilai</th>
              </tr>
            </thead>
            <tbody>
      `;
      siswa.nilai.forEach(item => {
        html += `
          <tr>
            <td>${item.nama_kriteria}</td>
            <td>${item.nilai}</td>
            <td>${item.bobot}</td>
            <td>${item.nama_guru}</td>
          </tr>
        `;
      });
      html += `
            </tbody>
          </table>
        </div>
      `;
    }

    html += `
      </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error("GET /api/guru/laporan/cetak:", err);
    res.status(500).json({ message: "Gagal mencetak laporan" });
  }
};
