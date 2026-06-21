const pg = require('pg');
const { Pool } = pg;

const pool = new Pool({
  host: process.env.POSTGRES_HOST || "127.0.0.1",
  port: Number(process.env.POSTGRES_PORT || 5432),
  database: process.env.POSTGRES_DB || "luna_jewel",
  user: process.env.POSTGRES_USER || "luna_user",
  password: process.env.POSTGRES_PASSWORD || "doi_mat_khau_manh",
});

async function check() {
  try {
    const res = await pool.query("SELECT * FROM cart");
    console.log("Cart rows in DB:", res.rows);
  } catch (err) {
    console.error("Error reading cart table:", err);
  } finally {
    await pool.end();
  }
}

check();
