const pool = require("../config/db");

const create = async ({ name, email, password }) => {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, password]
  );

  return { id: result.insertId, name, email };
};

const findByEmail = async (email) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0] ?? null;
};

const findAll = async () => {
  const [rows] = await pool.query("SELECT id, name, email FROM users ORDER BY id DESC");
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query("SELECT id, name, email FROM users WHERE id = ?", [id]);
  return rows[0] ?? null;
};

const update = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.name !== undefined) {
    fields.push("name = ?");
    values.push(data.name);
  }
  if (data.email !== undefined) {
    fields.push("email = ?");
    values.push(data.email);
  }
  if (data.password !== undefined) {
    fields.push("password = ?");
    values.push(data.password);
  }

  if (!fields.length) {
    return findById(id);
  }

  values.push(id);
  await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
  return findById(id);
};

const remove = async (id) => {
  const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

module.exports = {
  create,
  findByEmail,
  findAll,
  findById,
  update,
  remove,
};
