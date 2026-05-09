const app = require("./app");

const PORT = Number(process.env.PORT) || 3000;
/** Bind on all interfaces so PaaS and containers can route traffic (Render, Railway, Docker). */
const HOST = process.env.BIND_HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  const mode = process.env.NODE_ENV === "production" ? "production" : "development";
  console.log(`CampusRadius API listening on ${HOST}:${PORT} (${mode})`);
});
