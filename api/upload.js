import { put } from "@vercel/blob";
import { passwordOk, sleep } from "./_auth.js";

const TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!passwordOk(req.headers["x-edit-password"])) {
    await sleep(800);
    return res.status(401).json({ error: "Incorrect password" });
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const ext = TYPES[body.type];
    if (!ext) return res.status(415).json({ error: "Only JPG, PNG, WebP, GIF or PDF files can be uploaded" });
    const buf = Buffer.from(String(body.data || ""), "base64");
    if (!buf.length) return res.status(400).json({ error: "The file is empty" });
    if (buf.length > 3_200_000) return res.status(413).json({ error: "The file is over 3 MB. Try a smaller image or PDF." });
    const base = String(body.name || "file").replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "-").slice(0, 60) || "file";
    const blob = await put(`uploads/${base}.${ext}`, buf, {
      access: "public",
      contentType: body.type,
      addRandomSuffix: true,
    });
    return res.status(200).json({ url: blob.url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
