import express from "express";
import pg from "pg";

const { Pool } = pg;

const app = express();
app.use(express.json({ limit: "10mb" }));

const port = Number(process.env.REST_PORT || 3000);
const allowedTables = new Set([
  "users",
  "addresses",
  "products",
  "orders",
  "wishlist",
  "reviews",
  "collections",
  "slides",
]);
const primaryKeys = {
  users: "id",
  addresses: "id",
  products: "slug",
  orders: "id",
  wishlist: "id",
  reviews: "id",
  collections: "id",
  slides: "id",
};

const pool = new Pool({
  host: process.env.POSTGRES_HOST || "127.0.0.1",
  port: Number(process.env.POSTGRES_PORT || 5432),
  database: process.env.POSTGRES_DB || "luna_jewel",
  user: process.env.POSTGRES_USER || "luna_user",
  password: process.env.POSTGRES_PASSWORD || "doi_mat_khau_manh",
});

function ident(value) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    throw new Error(`Invalid identifier: ${value}`);
  }
  return `"${value}"`;
}

function columnsFromSelect(select) {
  if (!select || select === "*") return "*";
  const columns = String(select)
    .split(",")
    .map((column) => column.trim())
    .filter(Boolean)
    .map(ident);
  return columns.length ? columns.join(", ") : "*";
}

function addFilters(query, values, params) {
  const clauses = [];
  for (const [key, raw] of Object.entries(query)) {
    if (["select", "order", "limit", "offset", "on_conflict"].includes(key)) continue;
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (typeof value !== "string") continue;
    const [op, ...rest] = value.split(".");
    if (op !== "eq") continue;
    values.push(rest.join("."));
    clauses.push(`${ident(key)} = $${values.length}`);
  }
  if (clauses.length) params.where = ` WHERE ${clauses.join(" AND ")}`;
}

function orderClause(order) {
  if (!order) return "";
  const [column, direction] = String(order).split(".");
  const dir = direction === "asc" ? "ASC" : "DESC";
  return ` ORDER BY ${ident(column)} ${dir}`;
}

function limitClause(query, values) {
  const clauses = [];
  if (query.limit) {
    values.push(Number(query.limit));
    clauses.push(`LIMIT $${values.length}`);
  }
  if (query.offset) {
    values.push(Number(query.offset));
    clauses.push(`OFFSET $${values.length}`);
  }
  return clauses.length ? ` ${clauses.join(" ")}` : "";
}

function wantsSingle(req) {
  return String(req.get("accept") || "").includes("application/vnd.pgrst.object+json");
}

function sendRows(req, res, rows) {
  if (wantsSingle(req)) {
    res.json(rows[0] || null);
    return;
  }
  res.json(rows);
}

function normalizeRows(body) {
  if (Array.isArray(body)) return body;
  if (body && typeof body === "object") return [body];
  return [];
}

app.get("/health", async (_req, res) => {
  const result = await pool.query("select 1 as ok");
  res.json({ ok: result.rows[0]?.ok === 1 });
});

app.get("/rest/v1/:table", async (req, res, next) => {
  try {
    const { table } = req.params;
    if (!allowedTables.has(table)) return res.status(404).json({ message: "Unknown table" });

    const values = [];
    const params = { where: "" };
    addFilters(req.query, values, params);
    const sql =
      `SELECT ${columnsFromSelect(req.query.select)} FROM ${ident(table)}` +
      params.where +
      orderClause(req.query.order) +
      limitClause(req.query, values);
    const result = await pool.query(sql, values);
    sendRows(req, res, result.rows);
  } catch (error) {
    next(error);
  }
});

app.post("/rest/v1/:table", async (req, res, next) => {
  try {
    const { table } = req.params;
    if (!allowedTables.has(table)) return res.status(404).json({ message: "Unknown table" });
    const rows = normalizeRows(req.body);
    if (!rows.length) return res.status(400).json({ message: "Missing JSON body" });

    const isUpsert = String(req.get("prefer") || "").includes("resolution=merge-duplicates");
    const pk = String(req.query.on_conflict || primaryKeys[table]);
    const output = [];

    for (const row of rows) {
      const keys = Object.keys(row);
      const values = keys.map((key) => row[key]);
      const placeholders = keys.map((_, index) => `$${index + 1}`);
      const updates = keys
        .filter((key) => key !== pk)
        .map((key) => `${ident(key)} = EXCLUDED.${ident(key)}`);
      const sql =
        `INSERT INTO ${ident(table)} (${keys.map(ident).join(", ")}) VALUES (${placeholders.join(", ")})` +
        (isUpsert
          ? ` ON CONFLICT (${ident(pk)}) DO UPDATE SET ${updates.join(", ") || `${ident(pk)} = EXCLUDED.${ident(pk)}`}`
          : "") +
        " RETURNING *";
      const result = await pool.query(sql, values);
      output.push(...result.rows);
    }

    sendRows(req, res.status(201), output);
  } catch (error) {
    next(error);
  }
});

app.patch("/rest/v1/:table", async (req, res, next) => {
  try {
    const { table } = req.params;
    if (!allowedTables.has(table)) return res.status(404).json({ message: "Unknown table" });
    const keys = Object.keys(req.body || {});
    if (!keys.length) return res.status(400).json({ message: "Missing JSON body" });

    const values = keys.map((key) => req.body[key]);
    const set = keys.map((key, index) => `${ident(key)} = $${index + 1}`).join(", ");
    const params = { where: "" };
    addFilters(req.query, values, params);
    const result = await pool.query(`UPDATE ${ident(table)} SET ${set}${params.where} RETURNING *`, values);
    sendRows(req, res, result.rows);
  } catch (error) {
    next(error);
  }
});

app.delete("/rest/v1/:table", async (req, res, next) => {
  try {
    const { table } = req.params;
    if (!allowedTables.has(table)) return res.status(404).json({ message: "Unknown table" });
    const values = [];
    const params = { where: "" };
    addFilters(req.query, values, params);
    const result = await pool.query(`DELETE FROM ${ident(table)}${params.where} RETURNING *`, values);
    sendRows(req, res, result.rows);
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: error.message || "REST backend error" });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Local REST backend listening on http://127.0.0.1:${port}`);
});
