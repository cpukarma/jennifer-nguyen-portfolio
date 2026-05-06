const SITE_ID = "moonlit-valkyrie-f0b50b";
const TOKEN   = "nfp_7FxLTELHHfKjBwy4ktEokkUDmGXAVWvK6452";
const BASE    = `https://api.netlify.com/api/v1/blobs/${SITE_ID}/portfolio-data`;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const authHeader = { "Authorization": `Bearer ${TOKEN}` };

  try {
    if (event.httpMethod === "GET") {
      const r = await fetch(`${BASE}/main`, { headers: authHeader });
      if (r.status === 404) {
        return { statusCode: 200, headers, body: JSON.stringify(null) };
      }
      if (!r.ok) {
        const txt = await r.text();
        throw new Error(`Blob GET failed (${r.status}): ${txt}`);
      }
      const data = await r.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (event.httpMethod === "PUT") {
      const body = event.body;
      const r = await fetch(`${BASE}/main`, {
        method: "PUT",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: body,
      });
      if (!r.ok) {
        const txt = await r.text();
        throw new Error(`Blob PUT failed (${r.status}): ${txt}`);
      }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
