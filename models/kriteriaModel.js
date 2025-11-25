const pool = require("../config/db");

const getAll = async () => {
  const [rows] = await pool.query("SELECT * FROM kriteria ORDER BY created_at DESC");
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM kriteria WHERE id = ?", [id]);
  return rows[0] ?? null;
};

const create = async ({ nama_kriteria, bobot, deskripsi }) => {
  // Try to insert with deskripsi column; fall back if column not present
  try {
    const [result] = await pool.query(
      "INSERT INTO kriteria (nama_kriteria, bobot, deskripsi) VALUES (?, ?, ?)",
      [nama_kriteria, bobot, deskripsi ?? null]
    );
    return getById(result.insertId);
  } catch (err) {
    if (err && err.code === "ER_BAD_FIELD_ERROR") {
      const [result] = await pool.query(
        "INSERT INTO kriteria (nama_kriteria, bobot) VALUES (?, ?)",
        [nama_kriteria, bobot]
      );
      return getById(result.insertId);
    }
    throw err;
  }
};

const update = async (id, { nama_kriteria, bobot, deskripsi }) => {
  // Try update including deskripsi; fallback if column not present
  try {
    await pool.query(
      "UPDATE kriteria SET nama_kriteria = ?, bobot = ?, deskripsi = ? WHERE id = ?",
      [nama_kriteria, bobot, deskripsi ?? null, id]
    );
  } catch (err) {
    if (err && err.code === "ER_BAD_FIELD_ERROR") {
      await pool.query(
        "UPDATE kriteria SET nama_kriteria = ?, bobot = ? WHERE id = ?",
        [nama_kriteria, bobot, id]
      );
    } else {
      throw err;
    }
  }
  return getById(id);
};

const remove = async (id) => {
  const [result] = await pool.query("DELETE FROM kriteria WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
