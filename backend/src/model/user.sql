CREATE TABLE users(
  username VARCHAR(150) NOT NULL PRIMARY KEY UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(150) NOT NULL,
  fullname VARCHAR(150) NOT NULL,
  bio VARCHAR(500) NOT NULL,
  following text[],
  followers text[]
  -- profile VARCHAR(500) NOT NULL
);