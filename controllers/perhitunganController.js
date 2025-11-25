const kriteriaModel = require("../models/kriteriaModel");

// Simple in-memory status/history (persisting to DB can ditambahkan nanti)
let lastStatus = { running: false, result: null, history: [] };

const nowIso = () => new Date().toISOString();

exports.getStatus = async (_req, res) => {
  try {
    res.json({
      running: lastStatus.running,
      result: lastStatus.result,
      history: lastStatus.history,
    });
  } catch (err) {
    console.error("GET /api/perhitungan/apk/status:", err);
    res.status(500).json({ message: "Gagal mengambil status perhitungan", error: err.message });
  }
};

// Run AHP calculation based on current kriteria bobot stored in DB
exports.runApk = async (req, res) => {
  try {
    console.log("POST /api/perhitungan/apk - Content-Type:", req.headers["content-type"]);
    console.log("POST /api/perhitungan/apk - Body:", req.body);

    lastStatus.running = true;

    // Get all criteria and use their `bobot` as weights (fallback to equal weighting)
    const kriteria = await kriteriaModel.getAll();
    if (!Array.isArray(kriteria) || kriteria.length === 0) {
      lastStatus.running = false;
      return res.status(400).json({ message: "Tidak ada kriteria untuk dihitung" });
    }

    const rawWeights = kriteria.map((k) => Number(k.bobot ?? 0));
    const sum = rawWeights.reduce((a, b) => a + b, 0);
    const normalized = rawWeights.map((w) => (sum === 0 ? 1 / rawWeights.length : w / sum));

    // Simple APK metric: convert normalized weights to percentage coverage (sum should be 1 => 100)
    const apk = Math.round((normalized.reduce((a, b) => a + b, 0) * 100) * 100) / 100;

    const result = {
      n: normalized.length,
      weights: normalized,
      apk,
      lastUpdated: nowIso(),
    };

    // push to history (keep latest 20)
    lastStatus.history.unshift({ ...result, timestamp: nowIso() });
    if (lastStatus.history.length > 20) lastStatus.history.length = 20;
    lastStatus.result = result;
    lastStatus.running = false;

    return res.json({ message: "Perhitungan AHP selesai", result });
  } catch (err) {
    lastStatus.running = false;
    console.error("POST /api/perhitungan/apk:", err);
    res.status(500).json({ message: "Gagal menjalankan perhitungan AHP", error: err.message });
  }
};

// export internal for tests if needed
exports._internal = { lastStatus };
