import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());

app.get("/*", async (req, res) => {
  try {
    const targetUrl = decodeURIComponent(req.path.substring(1));
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: { ...req.headers, host: undefined }
    });

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const body = await response.buffer();
    res.send(body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 CORS proxy running on port ${PORT}`));
