const pool = require("../config/db");

const getAll = async () => {
  const [rows] = await pool.query("SELECT * FROM kriteria ORDER BY created_at DESC");
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM kriteria WHERE id = ?", [id]);
  return rows[0] ?? null;
};

const create = async ({ nama_kriteria, bobot }) => {
  const [result] = await pool.query(
    "INSERT INTO kriteria (nama_kriteria, bobot) VALUES (?, ?)",
    [nama_kriteria, bobot]
  );
  return getById(result.insertId);
};

const update = async (id, { nama_kriteria, bobot }) => {
  await pool.query(
    "UPDATE kriteria SET nama_kriteria = ?, bobot = ? WHERE id = ?",
    [nama_kriteria, bobot, id]
  );
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
