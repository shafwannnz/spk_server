const pool = require("../config/db");

const getAll = async () => {
  const [rows] = await pool.query("SELECT * FROM guru ORDER BY created_at DESC");
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM guru WHERE id = ?", [id]);
  return rows[0] ?? null;
};

const getByNip = async (nip) => {
  const [rows] = await pool.query("SELECT * FROM guru WHERE nip = ?", [nip]);
  return rows[0] ?? null;
};

const getByUserId = async (userId) => {
  const [rows] = await pool.query("SELECT * FROM guru WHERE user_id = ?", [userId]);
  return rows[0] ?? null;
};

const create = async ({ nama, nip, alamat, user_id }) => {
  const [result] = await pool.query(
    "INSERT INTO guru (nama, nip, alamat, user_id) VALUES (?, ?, ?, ?)",
    [nama, nip, alamat ?? null, user_id ?? null]
  );
  return getById(result.insertId);
};

const update = async (id, { nama, nip, alamat, user_id }) => {
  // First, fetch the existing user_id to handle the case where it's not provided in the update payload
  const existing = await getById(id);
  
  await pool.query(
    "UPDATE guru SET nama = ?, nip = ?, alamat = ?, user_id = ? WHERE id = ?",
    [nama, nip, alamat ?? null, user_id ?? existing.user_id, id]
  );
  return getById(id);
};

const remove = async (id) => {
  const [result] = await pool.query("DELETE FROM guru WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAll,
  getById,
  getByNip,
  getByUserId,
  create,
  update,
  remove,
};
