-- CampusRadius API — run once against your MySQL database (e.g. campus_radius).

CREATE TABLE IF NOT EXISTS schools (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(512) NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  PRIMARY KEY (id)
);
