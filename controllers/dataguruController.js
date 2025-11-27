const guruModel = require("../models/dataguruModel");
const penilaianModel = require("../models/penilaianModel");
const ahpCalculationModel = require("../models/ahpCalculationModel");

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

// Endpoint baru: laporan AHP ranking
exports.getLaporanAhp = async (req, res) => {
  try {
    const { id_siswa } = req.query;
    let laporan;

    if (id_siswa) {
      laporan = await ahpCalculationModel.getAhpBySiswaId(id_siswa);
      laporan = laporan ? [laporan] : [];
    } else {
      laporan = await ahpCalculationModel.calculateAhpRanking();
    }

    res.json(laporan);
  } catch (err) {
    console.error("GET /api/guru/laporan-ahp:", err);
    res.status(500).json({ message: "Gagal memuat laporan AHP", error: err.message });
  }
};

// Endpoint baru: export laporan AHP ke HTML (untuk print/PDF)
exports.exportLaporanAhpHtml = async (req, res) => {
  try {
    const { id_siswa } = req.query;
    const ahpData = await ahpCalculationModel.calculateAhpRanking();

    if (!ahpData || ahpData.length === 0) {
      return res.status(404).json({ message: "Belum ada data perhitungan AHP" });
    }

    let html = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Laporan Hasil Perhitungan AHP</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            padding: 20px;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 28px;
            color: #2c3e50;
            margin-bottom: 5px;
          }
          .header p {
            font-size: 14px;
            color: #666;
          }
          .timestamp {
            text-align: right;
            font-size: 12px;
            color: #999;
            margin-bottom: 20px;
          }
          .ranking-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .ranking-table th {
            background: #2c3e50;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border: 1px solid #34495e;
          }
          .ranking-table td {
            padding: 12px;
            border: 1px solid #ecf0f1;
          }
          .ranking-table tr:nth-child(even) {
            background: #f9f9f9;
          }
          .ranking-table tr:hover {
            background: #f0f0f0;
          }
          .rank-badge {
            display: inline-block;
            min-width: 30px;
            padding: 4px 8px;
            border-radius: 4px;
            text-align: center;
            font-weight: 600;
            color: white;
          }
          .rank-1 { background: #f39c12; }
          .rank-2 { background: #95a5a6; }
          .rank-3 { background: #cd7f32; }
          .rank-other { background: #3498db; }
          .score-bar {
            width: 100%;
            height: 20px;
            background: #ecf0f1;
            border-radius: 4px;
            overflow: hidden;
          }
          .score-fill {
            height: 100%;
            background: linear-gradient(90deg, #27ae60, #2ecc71);
            transition: width 0.3s;
          }
          .detail-section {
            margin-top: 30px;
            padding-top: 30px;
            border-top: 2px solid #ecf0f1;
          }
          .detail-section h2 {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 15px;
          }
          .student-detail {
            margin-bottom: 25px;
            padding: 15px;
            background: #f9f9f9;
            border-left: 4px solid #3498db;
            border-radius: 4px;
          }
          .student-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-weight: 600;
          }
          .student-info {
            font-size: 13px;
            color: #666;
            margin-bottom: 10px;
          }
          .criteria-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 13px;
          }
          .criteria-table th {
            background: #34495e;
            color: white;
            padding: 8px;
            text-align: left;
            font-weight: 600;
          }
          .criteria-table td {
            padding: 8px;
            border: 1px solid #ecf0f1;
          }
          .criteria-table tr:nth-child(even) {
            background: #ffffff;
          }
          @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; padding: 20px; }
            .no-print { display: none; }
          }
          .no-print {
            text-align: center;
            margin: 20px 0;
          }
          .no-print button {
            padding: 10px 20px;
            background: #2c3e50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          }
          .no-print button:hover {
            background: #34495e;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="no-print">
            <button onclick="window.print()">🖨️ Cetak Laporan</button>
          </div>
          
          <div class="header">
            <h1>📊 Laporan Hasil Perhitungan AHP</h1>
            <p>Analytical Hierarchy Process - Sistem Pendukung Keputusan</p>
          </div>
          
          <div class="timestamp">
            Dihasilkan: ${new Date().toLocaleString("id-ID")}
          </div>
    `;

    // Filter berdasarkan id_siswa jika ada
    const displayData = id_siswa
      ? ahpData.filter((s) => s.id_siswa == id_siswa)
      : ahpData;

    // 1. Tabel ranking utama
    html += `
          <table class="ranking-table">
            <thead>
              <tr>
                <th>Ranking</th>
                <th>NIS</th>
                <th>Nama Siswa</th>
                <th>Kelas</th>
                <th>Score AHP</th>
                <th style="width: 150px;">Visualisasi</th>
                <th>Persentase</th>
              </tr>
            </thead>
            <tbody>
    `;

    displayData.forEach((siswa) => {
      const rankClass =
        siswa.ranking === 1
          ? "rank-1"
          : siswa.ranking === 2
          ? "rank-2"
          : siswa.ranking === 3
          ? "rank-3"
          : "rank-other";

      html += `
              <tr>
                <td><span class="rank-badge ${rankClass}">#${siswa.ranking}</span></td>
                <td>${siswa.nis}</td>
                <td><strong>${siswa.nama_siswa}</strong></td>
                <td>${siswa.kelas}</td>
                <td>${siswa.scoreAhp.toFixed(4)}</td>
                <td>
                  <div class="score-bar">
                    <div class="score-fill" style="width: ${siswa.scorePercentage}%"></div>
                  </div>
                </td>
                <td>${siswa.scorePercentage}%</td>
              </tr>
      `;
    });

    html += `
            </tbody>
          </table>
    `;

    // 2. Detail penilaian per siswa
    if (displayData.length > 0) {
      html += `
          <div class="detail-section">
            <h2>Detail Penilaian Per Siswa</h2>
      `;

      displayData.forEach((siswa) => {
        html += `
            <div class="student-detail">
              <div class="student-header">
                <span>👤 ${siswa.nama_siswa} (${siswa.nis})</span>
                <span>🎯 Score: ${siswa.scoreAhp.toFixed(4)}</span>
              </div>
              <div class="student-info">
                <strong>Kelas:</strong> ${siswa.kelas} | 
                <strong>Ranking:</strong> #${siswa.ranking} | 
                <strong>Persentase:</strong> ${siswa.scorePercentage}%
              </div>
              <table class="criteria-table">
                <thead>
                  <tr>
                    <th>Kriteria</th>
                    <th>Nilai</th>
                    <th>Bobot</th>
                    <th>Guru Penilai</th>
                  </tr>
                </thead>
                <tbody>
        `;

        (siswa.details || []).forEach((detail) => {
          html += `
                  <tr>
                    <td>${detail.nama_kriteria}</td>
                    <td>${detail.nilai}</td>
                    <td>${Number(detail.bobot).toFixed(2)}</td>
                    <td>${detail.nama_guru}</td>
                  </tr>
          `;
        });

        html += `
                </tbody>
              </table>
            </div>
        `;
      });

      html += `
          </div>
      `;
    }

    html += `
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ecf0f1; color: #999; font-size: 12px;">
            <p>Laporan ini dihasilkan secara otomatis oleh Sistem Pendukung Keputusan (SPK) AHP</p>
          </div>
        </div>
      </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error("GET /api/guru/laporan-ahp/export:", err);
    res.status(500).json({ message: "Gagal export laporan AHP", error: err.message });
  }
};

// Endpoint baru: keputusan/rekomendasi siswa berdasarkan AHP ranking
exports.getKeputusan = async (req, res) => {
  try {
    const keputusan = await ahpCalculationModel.generateDecisions();
    res.json(keputusan);
  } catch (err) {
    console.error("GET /api/guru/keputusan:", err);
    res.status(500).json({ message: "Gagal memuat keputusan", error: err.message });
  }
};

// Endpoint baru: export keputusan ke HTML (untuk print/PDF)
exports.exportKeputusanHtml = async (req, res) => {
  try {
    const keputusan = await ahpCalculationModel.generateDecisions();

    if (!keputusan || keputusan.length === 0) {
      return res.status(404).json({ message: "Belum ada keputusan yang dihasilkan" });
    }

    // Group keputusan berdasarkan kategori
    const keputusanByCategory = {};
    keputusan.forEach((k) => {
      if (!keputusanByCategory[k.category]) {
        keputusanByCategory[k.category] = [];
      }
      keputusanByCategory[k.category].push(k);
    });

    let html = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Laporan Keputusan Siswa</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            padding: 20px;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 28px;
            color: #2c3e50;
            margin-bottom: 5px;
          }
          .header p {
            font-size: 14px;
            color: #666;
          }
          .timestamp {
            text-align: right;
            font-size: 12px;
            color: #999;
            margin-bottom: 20px;
          }
          .category-section {
            margin-bottom: 35px;
            page-break-inside: avoid;
          }
          .category-title {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 6px 6px 0 0;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
          }
          .category-section:nth-child(1) .category-title {
            background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
          }
          .category-section:nth-child(2) .category-title {
            background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
          }
          .category-section:nth-child(3) .category-title {
            background: linear-gradient(135deg, #cd7f32 0%, #b8860b 100%);
          }
          .decision-card {
            background: #f9f9f9;
            border-left: 5px solid #667eea;
            padding: 15px;
            margin-bottom: 12px;
            border-radius: 4px;
          }
          .category-section:nth-child(1) .decision-card {
            border-left-color: #f39c12;
          }
          .category-section:nth-child(2) .decision-card {
            border-left-color: #95a5a6;
          }
          .category-section:nth-child(3) .decision-card {
            border-left-color: #cd7f32;
          }
          .decision-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }
          .decision-header .rank {
            font-size: 12px;
            font-weight: 600;
            color: #999;
          }
          .decision-header .score {
            background: #667eea;
            color: white;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
          .category-section:nth-child(1) .decision-card .score {
            background: #f39c12;
          }
          .category-section:nth-child(2) .decision-card .score {
            background: #95a5a6;
          }
          .category-section:nth-child(3) .decision-card .score {
            background: #cd7f32;
          }
          .decision-name {
            font-size: 16px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 8px;
          }
          .decision-nis {
            font-size: 12px;
            color: #7f8c8d;
            margin-bottom: 8px;
          }
          .decision-description {
            font-size: 14px;
            color: #34495e;
            line-height: 1.5;
          }
          .decision-kelas {
            font-size: 12px;
            color: #95a5a6;
            margin-top: 8px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
            color: #999;
            font-size: 12px;
          }
          @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; padding: 20px; }
            .no-print { display: none; }
          }
          .no-print {
            text-align: center;
            margin: 20px 0;
          }
          .no-print button {
            padding: 10px 20px;
            background: #2c3e50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          }
          .no-print button:hover {
            background: #34495e;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="no-print">
            <button onclick="window.print()">🖨️ Cetak Laporan Keputusan</button>
          </div>
          
          <div class="header">
            <h1>📋 Laporan Keputusan Siswa</h1>
            <p>Hasil Analisis Sistem Pendukung Keputusan (SPK) AHP</p>
          </div>
          
          <div class="timestamp">
            Dihasilkan: ${new Date().toLocaleString("id-ID")}
          </div>
    `;

    // Render keputusan per kategori
    Object.keys(keputusanByCategory).forEach((category) => {
      const decisions = keputusanByCategory[category];
      html += `
          <div class="category-section">
            <div class="category-title">🏆 ${category}</div>
      `;

      decisions.forEach((decision) => {
        html += `
            <div class="decision-card">
              <div class="decision-header">
                <span class="rank">Ranking #${decision.ranking}</span>
                <span class="score">${decision.scorePercentage}%</span>
              </div>
              <div class="decision-name">${decision.siswa_nama}</div>
              <div class="decision-nis">NIS: ${decision.siswa_nis}</div>
              <div class="decision-description">${decision.description}</div>
              <div class="decision-kelas">Kelas: ${decision.siswa_kelas}</div>
            </div>
        `;
      });

      html += `
          </div>
      `;
    });

    html += `
          <div class="footer">
            <p>Laporan ini merupakan hasil analisis otomatis dari Sistem Pendukung Keputusan (SPK) menggunakan metode Analytical Hierarchy Process (AHP)</p>
          </div>
        </div>
      </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error("GET /api/guru/keputusan/export:", err);
    res.status(500).json({ message: "Gagal export keputusan", error: err.message });
  }
};
