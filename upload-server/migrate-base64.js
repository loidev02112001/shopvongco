import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Client } = pg;

const uploadRoot = process.env.UPLOAD_DIR || "/uploads";

const client = new Client({
  host: process.env.POSTGRES_HOST || "db",
  port: Number(process.env.POSTGRES_PORT || 5432),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

const mimeToExt = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

function isDataImage(value) {
  return typeof value === "string" && value.startsWith("data:image/");
}

async function saveDataImage(value, folder) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(value);
  if (!match) return value;

  const [, mime, payload] = match;
  const ext = mimeToExt[mime] || "jpg";
  const dir = path.join(uploadRoot, folder);
  const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), Buffer.from(payload, "base64"));
  return `/uploads/${folder}/${filename}`;
}

async function migrateProducts() {
  const { rows } = await client.query("select slug, img, images, specs from products");
  let count = 0;

  for (const row of rows) {
    const nextImg = isDataImage(row.img) ? await saveDataImage(row.img, "products") : row.img;
    const images = Array.isArray(row.images) ? row.images : [];
    const nextImages = [];
    let changed = nextImg !== row.img;

    for (const image of images) {
      const nextImage = isDataImage(image) ? await saveDataImage(image, "products") : image;
      nextImages.push(nextImage);
      changed = changed || nextImage !== image;
    }

    const specs = row.specs && typeof row.specs === "object" ? { ...row.specs } : row.specs;
    if (specs && isDataImage(specs.arImg)) {
      specs.arImg = await saveDataImage(specs.arImg, "products");
      changed = true;
    }

    if (!changed) continue;

    await client.query(
      "update products set img = $1, images = $2::jsonb, specs = $3::jsonb where slug = $4",
      [nextImg, JSON.stringify(nextImages), JSON.stringify(specs), row.slug],
    );
    count += 1;
  }

  return count;
}

async function migratePairTable(table, idColumn, fields, folder) {
  const { rows } = await client.query(
    `select ${idColumn}, ${fields.join(", ")} from ${table}`,
  );
  let count = 0;

  for (const row of rows) {
    const updates = {};
    for (const field of fields) {
      if (isDataImage(row[field])) {
        updates[field] = await saveDataImage(row[field], folder);
      }
    }

    const entries = Object.entries(updates);
    if (entries.length === 0) continue;

    const setSql = entries.map(([field], index) => `${field} = $${index + 1}`).join(", ");
    const values = entries.map(([, value]) => value);
    values.push(row[idColumn]);

    await client.query(
      `update ${table} set ${setSql} where ${idColumn} = $${values.length}`,
      values,
    );
    count += 1;
  }

  return count;
}

await client.connect();

try {
  const result = {
    products: await migrateProducts(),
    collections: await migratePairTable("collections", "id", ["banner", "thumbnail"], "collections"),
    slides: await migratePairTable("slides", "id", ["image"], "slides"),
    users: await migratePairTable("users", "id", ["avatar_url"], "avatars"),
  };
  console.log(JSON.stringify(result, null, 2));
} finally {
  await client.end();
}
