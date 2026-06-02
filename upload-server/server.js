import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import multer from "multer";

const app = express();
const uploadRoot = process.env.UPLOAD_DIR || "/uploads";
const maxFileSize = Number(process.env.MAX_UPLOAD_BYTES || 2 * 1024 * 1024);
const allowedFolders = new Set(["products", "collections", "slides", "avatars", "images"]);

function safeFolder(value) {
  const folder = String(value || "images").toLowerCase().replace(/[^a-z0-9-]/g, "");
  return allowedFolders.has(folder) ? folder : "images";
}

function fileExt(file) {
  const byMime = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
  };
  return byMime[file.mimetype] || path.extname(file.originalname).toLowerCase() || ".jpg";
}

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const folder = safeFolder(req.body.folder);
    const dir = path.join(uploadRoot, folder);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(_req, file, cb) {
    cb(null, `${Date.now()}-${crypto.randomUUID()}${fileExt(file)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter(_req, file, cb) {
    cb(null, file.mimetype.startsWith("image/"));
  },
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Missing image file." });
    return;
  }

  const folder = path.basename(path.dirname(req.file.path));
  res.status(201).json({ url: `/uploads/${folder}/${req.file.filename}` });
});

app.use((err, _req, res, _next) => {
  if (err?.code === "LIMIT_FILE_SIZE") {
    res.status(413).json({ error: "Image must be 2MB or smaller." });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Upload failed." });
});

app.listen(3001, "0.0.0.0", () => {
  console.log(`Upload server listening on :3001, saving files to ${uploadRoot}`);
});
