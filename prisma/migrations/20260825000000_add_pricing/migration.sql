ALTER TABLE "game_mappings" ADD COLUMN "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "stores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "offers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "game_id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_game_id" TEXT NOT NULL,
    "provider_offer_id" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "regular_price" DECIMAL(10,2) NOT NULL,
    "savings" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "purchase_url" TEXT NOT NULL,
    "last_updated" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "stores_provider_external_id_key" ON "stores"("provider", "external_id");
CREATE UNIQUE INDEX "offers_provider_provider_offer_id_key" ON "offers"("provider", "provider_offer_id");
CREATE INDEX "offers_game_id_last_updated_idx" ON "offers"("game_id", "last_updated");
CREATE INDEX "offers_store_id_idx" ON "offers"("store_id");

ALTER TABLE "offers" ADD CONSTRAINT "offers_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "offers" ADD CONSTRAINT "offers_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
