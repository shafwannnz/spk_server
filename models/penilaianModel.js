const pool = require("../config/db");

/**
 * Membuat atau memperbarui nilai siswa untuk kriteria tertentu.
 * Menggunakan ON DUPLICATE KEY UPDATE untuk efisiensi.
 */
const upsert = async ({ id_siswa, id_kriteria, id_guru, nilai }) => {
  const query = `
    INSERT INTO penilaian (id_siswa, id_kriteria, id_guru, nilai)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE id_guru = VALUES(id_guru), nilai = VALUES(nilai)
  `;
  await pool.query(query, [id_siswa, id_kriteria, id_guru, nilai]);

  // Mengambil data yang baru saja di-insert/update untuk konfirmasi
  const [rows] = await pool.query(
    "SELECT * FROM penilaian WHERE id_siswa = ? AND id_kriteria = ?",
    [id_siswa, id_kriteria]
  );
  return rows[0];
};

/**
 * Mengambil laporan lengkap dengan join ke tabel siswa, kriteria, dan guru.
 */
const getLaporan = async () => {
  const query = `
    SELECT
      s.nama AS nama_siswa,
      s.nis,
      s.kelas,
      k.nama_kriteria,
      k.bobot,
      p.nilai,
      g.nama AS nama_guru
    FROM penilaian p
    JOIN siswa s ON p.id_siswa = s.id
    JOIN kriteria k ON p.id_kriteria = k.id
    JOIN guru g ON p.id_guru = g.id
    ORDER BY s.nama, k.nama_kriteria
  `;
  const [rows] = await pool.query(query);
  return rows;
};

/**
 * Mengambil laporan untuk satu siswa spesifik.
 */
const getLaporanBySiswaId = async (id_siswa) => {
  const query = `
    SELECT
      s.nama AS nama_siswa,
      s.nis,
      s.kelas,
      k.nama_kriteria,
      k.bobot,
      p.nilai,
      g.nama AS nama_guru
    FROM penilaian p
    JOIN siswa s ON p.id_siswa = s.id
    JOIN kriteria k ON p.id_kriteria = k.id
    JOIN guru g ON p.id_guru = g.id
    WHERE p.id_siswa = ?
    ORDER BY k.nama_kriteria
  `;
  const [rows] = await pool.query(query, [id_siswa]);
  return rows;
};


module.exports = {
  upsert,
  getLaporan,
  getLaporanBySiswaId,
};
