CREATE TYPE "token_scope" AS ENUM (
  'auth'
);

CREATE TYPE "user_role" AS ENUM (
  'admin',
  'user'
);

CREATE TABLE "cards" (
  "id" integer PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "column_id" integer NOT NULL
);

CREATE TABLE "columns" (
  "id" integer PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "owner_id" integer NOT NULL
);

CREATE TABLE "comments" (
  "id" integer PRIMARY KEY NOT NULL,
  "content" text NOT NULL,
  "author_id" integer NOT NULL,
  "card_id" integer NOT NULL
);

CREATE TABLE "internal_users" (
  "user_id" integer PRIMARY KEY NOT NULL,
  "password_hash" text NOT NULL,
  "role" user_role NOT NULL DEFAULT ('user'::public.user_role)
);

CREATE TABLE "tokens" (
  "hash" text PRIMARY KEY NOT NULL,
  "scope" token_scope NOT NULL,
  "user_id" integer NOT NULL
);

CREATE TABLE "users" (
  "id" integer PRIMARY KEY NOT NULL,
  "email" text UNIQUE NOT NULL
);

CREATE INDEX "idx_cards_column_id" ON "cards" USING BTREE ("column_id");

CREATE INDEX "idx_columns_owner_id" ON "columns" USING BTREE ("owner_id");

CREATE INDEX "idx_comments_author_id" ON "comments" USING BTREE ("author_id");

CREATE INDEX "idx_comments_card_id" ON "comments" USING BTREE ("card_id");

CREATE UNIQUE INDEX "tokens_user_id_scope_key" ON "tokens" ("user_id", "scope");

CREATE INDEX "idx_tokens_user_id" ON "tokens" USING BTREE ("user_id");

ALTER TABLE "cards" ADD CONSTRAINT "cards_column_id_fkey" FOREIGN KEY ("column_id") REFERENCES "columns" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "columns" ADD CONSTRAINT "columns_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "comments" ADD CONSTRAINT "comments_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "internal_users" ADD CONSTRAINT "internal_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
