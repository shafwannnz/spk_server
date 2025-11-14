const mysql = require("mysql2/promise");

const readEnv = (value, fallback) => {
  if (value === undefined || value === null) return fallback;
  const cleaned = String(value).trim().replace(/^['"]|['"]$/g, "");
  return cleaned.length ? cleaned : fallback;
};

const pool = mysql.createPool({
  host: readEnv(process.env.DB_HOST, "localhost"),
  port: (() => {
    const parsed = Number(readEnv(process.env.DB_PORT, 3306));
    return Number.isFinite(parsed) ? parsed : 3306;
  })(),
  user: readEnv(process.env.DB_USER, "root"),
  password: readEnv(process.env.DB_PASSWORD, ""),
  database: readEnv(process.env.DB_NAME, "spk_insantama_ahp"),
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});

pool
  .getConnection()
  .then((connection) => {
    console.log("Database connected");
    connection.release();
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });

module.exports = pool;
