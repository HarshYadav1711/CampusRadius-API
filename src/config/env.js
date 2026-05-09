/**
 * Environment helpers — keeps parsing logic out of configuration modules.
 */

function envInt(name, defaultValue) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return defaultValue;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : defaultValue;
}

module.exports = {
  envInt,
};
