// /api/proxy.js

export default async function handler(req, res) {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: "Missing ?url parameter" });
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: undefined,        // prevent forwarding host
        "x-vercel-deployment-url": undefined,
      },
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    });

    const contentType = response.headers.get("content-type");
    res.setHeader("Content-Type", contentType || "application/json");

    // Allow all origins (CORS)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    const data = await response.text();
    res.status(response.status).send(data);

  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy request failed", details: err.message });
  }
}
