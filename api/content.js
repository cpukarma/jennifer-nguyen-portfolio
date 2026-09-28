import { put, list, del } from "@vercel/blob";
import { passwordOk, sleep } from "./_auth.js";

// Every save is stored as a new file, so the last 30 versions stay as backups.
const PREFIX = "content/version-";
const KEEP = 30;

async function versions() {
  const { blobs } = await list({ prefix: PREFIX, limit: 1000 });
  return blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") {
      const all = await versions();
      if (!all.length) return res.status(200).json(null);
      const r = await fetch(all[0].url, { cache: "no-store" });
      if (!r.ok) throw new Error(`Could not read content (${r.status})`);
      return res.status(200).json(await r.json());
    }

    if (req.method === "PUT") {
      if (!passwordOk(req.headers["x-edit-password"])) {
        await sleep(800);
        return res.status(401).json({ error: "Incorrect password" });
      }
      const text = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      if (!text || text.length > 3_000_000) return res.status(413).json({ error: "Content is too large" });
      const data = JSON.parse(text);
      if (!data || typeof data !== "object" || data.v !== 1) return res.status(400).json({ error: "Content is not in the expected format" });

      await put(`${PREFIX}${Date.now()}.json`, text, {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: true,
      });

      const all = await versions();
      if (all.length > KEEP) await del(all.slice(KEEP).map(b => b.url));
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
