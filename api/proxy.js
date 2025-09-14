import fetch from "node-fetch";

// Vercel treats this file as a serverless function
export default async function handler(req, res) {
  try {
    const targetUrl = req.query.url;

    if (!targetUrl) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    const response = await fetch(targetUrl);
    const contentType = response.headers.get("content-type");

    res.setHeader("Content-Type", contentType || "application/json");
    const data = await response.text();

    res.status(200).send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
