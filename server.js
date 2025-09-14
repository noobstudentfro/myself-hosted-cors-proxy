// server.js
import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to allow JSON bodies
app.use(express.json());

// CORS headers (allow everything — you can restrict later if needed)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Proxy endpoint
app.use("/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target) {
    return res.status(400).json({ error: "Missing target URL. Use ?url=..." });
  }

  try {
    const options = {
      method: req.method,
      headers: { ...req.headers },
    };

    if (req.method !== "GET" && req.body) {
      options.body = JSON.stringify(req.body);
    }

    // Forward request
    const response = await fetch(target, options);

    // Pass through status + headers
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const data = await response.text();
    res.send(data);

  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy request failed", details: err.message });
  }
});

// Start server (for local testing, Vercel ignores this but keeps for dev)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Proxy running at http://localhost:${PORT}`));
}

export default app;

