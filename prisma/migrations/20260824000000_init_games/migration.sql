CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "games" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "igdb_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cover_url" TEXT,
    "release_date" TIMESTAMPTZ(6),
    "rating" DOUBLE PRECISION,
    "metadata" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "game_mappings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "game_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "game_mappings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "games_igdb_id_key" ON "games"("igdb_id");
CREATE UNIQUE INDEX "games_slug_key" ON "games"("slug");
CREATE UNIQUE INDEX "game_mappings_provider_external_id_key" ON "game_mappings"("provider", "external_id");
CREATE UNIQUE INDEX "game_mappings_game_id_provider_key" ON "game_mappings"("game_id", "provider");
CREATE INDEX "game_mappings_game_id_idx" ON "game_mappings"("game_id");

ALTER TABLE "game_mappings" ADD CONSTRAINT "game_mappings_game_id_fkey"
FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
