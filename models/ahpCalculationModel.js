const pool = require("../config/db");

/**
 * Hitung AHP ranking untuk semua siswa berdasarkan nilai dan bobot kriteria.
 * Mengembalikan array siswa dengan skor AHP dan ranking.
 */
const calculateAhpRanking = async () => {
  try {
    // 1. Ambil semua kriteria dengan bobot
    const [kriteria] = await pool.query(
      "SELECT id, nama_kriteria, bobot FROM kriteria ORDER BY id"
    );
    if (!kriteria || kriteria.length === 0) {
      return [];
    }

    // 2. Hitung normalisasi bobot
    const totalBobot = kriteria.reduce((sum, k) => sum + Number(k.bobot || 0), 0);
    const normalizedWeights = kriteria.map(
      (k) => Number(k.bobot || 0) / (totalBobot || 1)
    );

    // 3. Ambil semua penilaian siswa
    const [penilaian] = await pool.query(`
      SELECT
        p.id_siswa,
        s.nama AS nama_siswa,
        s.nis,
        s.kelas,
        p.id_kriteria,
        p.nilai
      FROM penilaian p
      JOIN siswa s ON p.id_siswa = s.id
      ORDER BY s.id, p.id_kriteria
    `);

    if (!penilaian || penilaian.length === 0) {
      return [];
    }

    // 4. Grouping per siswa dan hitung skor
    const siswaBySiswaId = {};
    penilaian.forEach((row) => {
      if (!siswaBySiswaId[row.id_siswa]) {
        siswaBySiswaId[row.id_siswa] = {
          id_siswa: row.id_siswa,
          nama_siswa: row.nama_siswa,
          nis: row.nis,
          kelas: row.kelas,
          nilaiPerKriteria: [],
        };
      }
      siswaBySiswaId[row.id_siswa].nilaiPerKriteria.push({
        id_kriteria: row.id_kriteria,
        nilai: Number(row.nilai || 0),
      });
    });

    // 5. Hitung skor AHP per siswa
    const siswaList = Object.values(siswaBySiswaId).map((siswa) => {
      let scoreAhp = 0;
      siswa.nilaiPerKriteria.forEach((nk, idx) => {
        // Asumsikan nilai = 0-100, normalisasi ke 0-1
        const normalizedNilai = nk.nilai / 100;
        const weight = normalizedWeights[idx] || 0;
        scoreAhp += normalizedNilai * weight;
      });
      return {
        ...siswa,
        scoreAhp: Math.round(scoreAhp * 10000) / 10000, // round to 4 decimals
        scorePercentage: Math.round(scoreAhp * 100),
      };
    });

    // 6. Sort by scoreAhp descending dan assign ranking
    siswaList.sort((a, b) => b.scoreAhp - a.scoreAhp);
    siswaList.forEach((siswa, idx) => {
      siswa.ranking = idx + 1;
    });

    // 7. Ambil detail penilaian (untuk laporan detail)
    const siswaWithDetails = await Promise.all(
      siswaList.map(async (siswa) => {
        const [details] = await pool.query(`
          SELECT
            k.nama_kriteria,
            k.bobot,
            p.nilai,
            g.nama AS nama_guru
          FROM penilaian p
          JOIN kriteria k ON p.id_kriteria = k.id
          JOIN guru g ON p.id_guru = g.id
          WHERE p.id_siswa = ?
          ORDER BY k.id
        `, [siswa.id_siswa]);

        return {
          ...siswa,
          details: details || [],
        };
      })
    );

    return siswaWithDetails;
  } catch (err) {
    console.error("calculateAhpRanking error:", err);
    throw err;
  }
};

/**
 * Ambil AHP ranking untuk satu siswa spesifik
 */
const getAhpBySiswaId = async (id_siswa) => {
  try {
    const allAhp = await calculateAhpRanking();
    return allAhp.find((s) => s.id_siswa == id_siswa) || null;
  } catch (err) {
    console.error("getAhpBySiswaId error:", err);
    throw err;
  }
};

/**
 * Generate keputusan/rekomendasi berdasarkan AHP ranking.
 * Contoh: Rank 1 = "Siswa Berprestasi", Rank 2-3 = "Siswa Berprestasi", dll
 */
const generateDecisions = async () => {
  try {
    const ranking = await calculateAhpRanking();
    
    // Define decision categories berdasarkan ranking
    const decisions = [];
    
    ranking.forEach((siswa, idx) => {
      let category = "";
      let description = "";
      
      if (idx === 0) {
        // Rank 1: Siswa Berprestasi Terbaik
        category = "Siswa Berprestasi Terbaik";
        description = `Atas nama ${siswa.nama_siswa}, siswa dengan perolehan skor tertinggi dan menunjukkan prestasi akademik terbaik.`;
      } else if (idx < 3) {
        // Rank 2-3: Siswa Berprestasi
        category = "Siswa Berprestasi";
        description = `Atas nama ${siswa.nama_siswa}, siswa dengan perolehan skor tinggi dan menunjukkan prestasi akademik yang baik.`;
      } else if (idx < 5) {
        // Rank 4-5: Siswa Berkompeten
        category = "Siswa Berkompeten";
        description = `Atas nama ${siswa.nama_siswa}, siswa dengan perolehan skor menengah dan menunjukkan kompetensi yang cukup.`;
      } else {
        // Rank 6+: Siswa Potensial Dikembangkan
        category = "Siswa Potensial Dikembangkan";
        description = `Atas nama ${siswa.nama_siswa}, siswa dengan potensi untuk dikembangkan lebih lanjut.`;
      }
      
      decisions.push({
        ranking: siswa.ranking,
        category,
        description,
        siswa_id: siswa.id_siswa,
        siswa_nama: siswa.nama_siswa,
        siswa_nis: siswa.nis,
        siswa_kelas: siswa.kelas,
        score: siswa.scoreAhp,
        scorePercentage: siswa.scorePercentage,
      });
    });
    
    return decisions;
  } catch (err) {
    console.error("generateDecisions error:", err);
    throw err;
  }
};

module.exports = {
  calculateAhpRanking,
  getAhpBySiswaId,
  generateDecisions,
};
