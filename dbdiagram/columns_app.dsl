
Enum "token_scope" {
  "auth"
}

Enum "user_role" {
  "admin"
  "user"
}

Table "cards" {
  "id" integer [pk, not null]
  "name" text [not null]
  "description" text [not null]
  "column_id" integer [not null]

  Indexes {
    column_id [type: btree, name: "idx_cards_column_id"]
  }
}

Table "columns" {
  "id" integer [pk, not null]
  "name" text [not null]
  "owner_id" integer [not null]

  Indexes {
    owner_id [type: btree, name: "idx_columns_owner_id"]
  }
}

Table "comments" {
  "id" integer [pk, not null]
  "content" text [not null]
  "author_id" integer [not null]
  "card_id" integer [not null]

  Indexes {
    author_id [type: btree, name: "idx_comments_author_id"]
    card_id [type: btree, name: "idx_comments_card_id"]
  }
}

Table "internal_users" {
  "user_id" integer [pk, not null]
  "password_hash" text [not null]
  "role" user_role [not null, default: `'user'::public.user_role`]
}

Table "tokens" {
  "hash" text [pk, not null]
  "scope" token_scope [not null]
  "user_id" integer [not null]

  Indexes {
    (user_id, scope) [unique, name: "tokens_user_id_scope_key"]
    user_id [type: btree, name: "idx_tokens_user_id"]
  }
}

Table "users" {
  "id" integer [pk, not null]
  "email" text [unique, not null]
}

Ref "cards_column_id_fkey":"columns"."id" < "cards"."column_id" [update: cascade, delete: cascade]

Ref "columns_owner_id_fkey":"users"."id" < "columns"."owner_id" [update: cascade, delete: cascade]

Ref "comments_author_id_fkey":"users"."id" < "comments"."author_id" [update: cascade, delete: cascade]

Ref "comments_card_id_fkey":"cards"."id" < "comments"."card_id" [update: cascade, delete: cascade]

Ref "internal_users_user_id_fkey":"users"."id" < "internal_users"."user_id" [update: cascade, delete: cascade]

Ref "tokens_user_id_fkey":"users"."id" < "tokens"."user_id" [update: cascade, delete: cascade]
