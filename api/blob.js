const SITE_ID = "d38b942b-79e4-46b0-bdee-4d62f67323da";
const TOKEN   = "nfp_7FxLTELHHfKjBwy4ktEokkUDmGXAVWvK6452";
const BASE    = `https://api.netlify.com/api/v1/blobs/${SITE_ID}/portfolio-data`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const authHeader = { 'Authorization': `Bearer ${TOKEN}` };

  try {
    if (req.method === 'GET') {
      const r = await fetch(`${BASE}/main`, { headers: authHeader });
      if (r.status === 404) { res.status(200).json(null); return; }
      if (!r.ok) { const t = await r.text(); throw new Error(`GET failed (${r.status}): ${t}`); }
      const data = await r.json();
      res.status(200).json(data);
      return;
    }

    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const r = await fetch(`${BASE}/main`, {
        method: 'PUT',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body,
      });
      if (!r.ok) { const t = await r.text(); throw new Error(`PUT failed (${r.status}): ${t}`); }
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

