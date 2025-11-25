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

const create = async ({ nama, nip, alamat, user_id, mata_pelajaran, status }) => {
  // Try to insert with new columns; if the DB doesn't have them, fallback to the old query
  try {
    const [result] = await pool.query(
      "INSERT INTO guru (nama, nip, alamat, user_id, mata_pelajaran, status) VALUES (?, ?, ?, ?, ?, ?)",
      [nama, nip, alamat ?? null, user_id ?? null, mata_pelajaran ?? null, status ?? null]
    );
    return getById(result.insertId);
  } catch (err) {
    // ER_BAD_FIELD_ERROR means column doesn't exist — fallback to older schema
    if (err && err.code === "ER_BAD_FIELD_ERROR") {
      const [result] = await pool.query(
        "INSERT INTO guru (nama, nip, alamat, user_id) VALUES (?, ?, ?, ?)",
        [nama, nip, alamat ?? null, user_id ?? null]
      );
      return getById(result.insertId);
    }
    throw err;
  }
};

const update = async (id, { nama, nip, alamat, user_id, mata_pelajaran, status }) => {
  // First, fetch the existing record to handle defaulting unspecified fields
  const existing = await getById(id);

  // Try update including new columns; fallback if columns don't exist
  try {
    await pool.query(
      "UPDATE guru SET nama = ?, nip = ?, alamat = ?, user_id = ?, mata_pelajaran = ?, status = ? WHERE id = ?",
      [
        nama,
        nip,
        alamat ?? null,
        user_id ?? existing.user_id,
        mata_pelajaran ?? existing.mata_pelajaran ?? null,
        status ?? existing.status ?? null,
        id,
      ]
    );
  } catch (err) {
    if (err && err.code === "ER_BAD_FIELD_ERROR") {
      await pool.query(
        "UPDATE guru SET nama = ?, nip = ?, alamat = ?, user_id = ? WHERE id = ?",
        [nama, nip, alamat ?? null, user_id ?? existing.user_id, id]
      );
    } else {
      throw err;
    }
  }

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
