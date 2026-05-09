const { query } = require("express-validator");

/**
 * Query-string coordinate: required, finite number in range; normalized onto `req.query`.
 */
function queryCoordinate(field, min, max) {
  return query(field)
    .exists({ checkNull: true })
    .withMessage(`${field} is required`)
    .bail()
    .custom((value, { req }) => {
      if (typeof value === "boolean") {
        throw new Error(`${field} must be a number`);
      }
      if (value !== null && typeof value === "object") {
        throw new Error(`${field} must be a number`);
      }

      let raw = value;
      if (typeof raw === "string") {
        raw = raw.trim();
        if (raw === "") {
          throw new Error(`${field} cannot be empty`);
        }
      }

      const num = typeof raw === "number" ? raw : Number(String(raw));

      if (!Number.isFinite(num)) {
        throw new Error(`${field} must be a valid number`);
      }
      if (num < min || num > max) {
        throw new Error(`${field} must be between ${min} and ${max}`);
      }

      req.query[field] = num;
      return true;
    });
}

const listSchoolsValidators = [
  queryCoordinate("latitude", -90, 90),
  queryCoordinate("longitude", -180, 180),
];

module.exports = {
  listSchoolsValidators,
};
