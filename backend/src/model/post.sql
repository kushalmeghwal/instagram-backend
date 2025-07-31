CREATE TABLE posts(
  media text[] NOT NULL,
  caption VARCHAR(150) NOT NULL,
  author VARCHAR(150) REFERENCES users(username),
  likes text[],
  comments json,
  id BIGSERIAL PRIMARY KEY NOT NULL
);