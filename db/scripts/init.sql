CREATE ROLE columns_app WITH LOGIN PASSWORD 'columns_app';

CREATE TABLE users (
  id    SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL
);

CREATE TYPE user_role AS ENUM ('admin', 'user');

CREATE TABLE internal_users (
  user_id       INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'user'
);

CREATE TYPE token_scope AS ENUM ('auth');

CREATE TABLE tokens (
  hash    TEXT PRIMARY KEY,
  scope   token_scope NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE (user_id, scope)
);

CREATE INDEX idx_tokens_user_id ON tokens(user_id);

CREATE TABLE columns (
  id       SERIAL PRIMARY KEY,
  name     TEXT NOT NULL,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_columns_owner_id ON columns(owner_id);

CREATE TABLE cards (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  column_id   INTEGER NOT NULL REFERENCES columns(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_cards_column_id ON cards(column_id);

CREATE TABLE comments (
  id        SERIAL PRIMARY KEY,
  content   TEXT NOT NULL,
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  card_id   INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_comments_author_id ON comments(author_id);

CREATE INDEX idx_comments_card_id ON comments(card_id);

-- CREATE FUNCTION check_owner_id_equality() RETURNS TRIGGER AS $$
-- DECLARE
--   column_owner_id INTEGER;
-- BEGIN
--   SELECT owner_id FROM columns WHERE id = NEW.column_id INTO column_owner_id ;
--   IF NEW.owner_id <> column_owner_id THEN
--    RAISE EXCEPTION 'owner_id mismatch in Card and Column tables';
--   END IF;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER check_owner_id_equality_on_cards
--   BEFORE INSERT OR UPDATE OR DELETE ON cards
--   FOR EACH ROW
--   EXECUTE FUNCTION check_owner_id_equality();

