// api/proxy.js
export default async function handler(req, res) {
  // Allow all origins (CORS)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight (OPTIONS request)
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const targetUrl = req.query.url;

  if (!targetUrl) {
    res.status(400).json({ error: "Missing ?url parameter" });
    return;
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(targetUrl).host, // avoid host mismatch
      },
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    });

    // Forward status
    res.status(response.status);

    // Forward headers (except for CORS which we already set)
    response.headers.forEach((value, key) => {
      if (!["access-control-allow-origin", "access-control-allow-methods", "access-control-allow-headers"].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // Forward body
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy request failed", details: err.message });
  }
}


