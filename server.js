import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());

// Optional: parse JSON bodies for POST/PUT
app.use(express.json());

app.all("/*", async (req, res) => {
  try {
    // Remove leading slash and decode the target URL
    const targetUrl = decodeURIComponent(req.path.substring(1));

    // Validate URL
    if (!/^https?:\/\//i.test(targetUrl)) {
      return res.status(400).json({ error: "Invalid or missing target URL" });
    }

    // Forward the request to the target URL
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(targetUrl).host // preserve hostname for SSL
      },
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body
    });

    // Copy status and headers
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Send the response body
    const buffer = await response.buffer();
    res.send(buffer);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Proxy running on port ${PORT}`));
