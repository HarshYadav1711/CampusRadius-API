const { body } = require("express-validator");

/**
 * Parses and normalizes a coordinate; assigns a finite number back to `req.body[field]`.
 */
function coordinate(field, min, max) {
  return body(field)
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

      req.body[field] = num;
      return true;
    });
}

const addSchoolValidators = [
  body("name")
    .exists({ checkNull: true })
    .withMessage("name is required")
    .bail()
    .isString()
    .withMessage("name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("name cannot be empty")
    .bail()
    .isLength({ max: 255 })
    .withMessage("name must be at most 255 characters"),

  body("address")
    .exists({ checkNull: true })
    .withMessage("address is required")
    .bail()
    .isString()
    .withMessage("address must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("address cannot be empty")
    .bail()
    .isLength({ max: 255 })
    .withMessage("address must be at most 255 characters"),

  coordinate("latitude", -90, 90),
  coordinate("longitude", -180, 180),
];

module.exports = {
  addSchoolValidators,
};
