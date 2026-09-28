import { timingSafeEqual } from "node:crypto";

// The edit password lives only in Vercel: Settings → Environment Variables → EDIT_PASSWORD.
export function passwordOk(given) {
  const expected = process.env.EDIT_PASSWORD || "";
  if (!expected) return false;
  const a = Buffer.from(String(given || ""));
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
