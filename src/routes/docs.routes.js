const express = require("express");

const router = express.Router();

/** Minimal HTML overview — no Swagger/OpenAPI bundle (per project scope). */
const PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CampusRadius API</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
    code { background: #f4f4f4; padding: 0.1rem 0.35rem; border-radius: 4px; }
    li { margin: 0.35rem 0; }
  </style>
</head>
<body>
  <h1>CampusRadius API</h1>
  <p>Express + MySQL. Full specification and samples are in <code>README.md</code> and the Postman collection.</p>
  <h2>Endpoints</h2>
  <ul>
    <li><strong>GET /health</strong> — process and MySQL connectivity</li>
    <li><strong>POST /addSchool</strong> — JSON: <code>name</code>, <code>address</code>, <code>latitude</code>, <code>longitude</code></li>
    <li><strong>GET /listSchools</strong> — query: <code>latitude</code>, <code>longitude</code></li>
    <li><strong>GET /</strong> — JSON discovery</li>
  </ul>
  <p><a href="/">JSON overview</a> · <a href="/health">Health check</a></p>
</body>
</html>`;

function sendDocs(req, res) {
  res.type("html").send(PAGE);
}

router.get("/api/docs", sendDocs);
router.get("/api/docs/", sendDocs);

module.exports = router;
