const pool = require("../config/db");

const getAll = async () => {
  const [rows] = await pool.query("SELECT * FROM siswa ORDER BY created_at DESC");
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM siswa WHERE id = ?", [id]);
  return rows[0] ?? null;
};

const getByNis = async (nis) => {
  const [rows] = await pool.query("SELECT * FROM siswa WHERE nis = ?", [nis]);
  return rows[0] ?? null;
};

const create = async ({ nama, nis, kelas, alamat }) => {
  const [result] = await pool.query(
    "INSERT INTO siswa (nama, nis, kelas, alamat) VALUES (?, ?, ?, ?)",
    [nama, nis, kelas, alamat ?? null]
  );
  return getById(result.insertId);
};

const update = async (id, { nama, nis, kelas, alamat }) => {
  await pool.query(
    "UPDATE siswa SET nama = ?, nis = ?, kelas = ?, alamat = ? WHERE id = ?",
    [nama, nis, kelas, alamat ?? null, id]
  );
  return getById(id);
};

const remove = async (id) => {
  const [result] = await pool.query("DELETE FROM siswa WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAll,
  getById,
  getByNis,
  create,
  update,
  remove,
};
