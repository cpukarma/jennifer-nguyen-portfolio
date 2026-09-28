import { passwordOk, sleep } from "./_auth.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  if (!process.env.EDIT_PASSWORD) return res.status(500).json({ error: "EDIT_PASSWORD is not set in Vercel" });
  if (!passwordOk(body.password)) {
    await sleep(800); // slows down guessing
    return res.status(401).json({ error: "Incorrect password" });
  }
  return res.status(200).json({ ok: true });
}
