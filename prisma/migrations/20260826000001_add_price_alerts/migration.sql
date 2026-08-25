CREATE TABLE "price_alerts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "game_slug" TEXT NOT NULL,
    "game_name" TEXT NOT NULL,
    "threshold_price" DECIMAL(10,2),
    "reference_price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verify_token" TEXT NOT NULL,
    "unsubscribe_token" TEXT NOT NULL,
    "verified_at" TIMESTAMPTZ(6),
    "last_notified_at" TIMESTAMPTZ(6),
    "last_notified_price" DECIMAL(10,2),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "price_alerts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "price_alerts_verify_token_key" ON "price_alerts"("verify_token");
CREATE UNIQUE INDEX "price_alerts_unsubscribe_token_key" ON "price_alerts"("unsubscribe_token");
CREATE INDEX "price_alerts_status_game_slug_idx" ON "price_alerts"("status", "game_slug");
CREATE INDEX "price_alerts_email_idx" ON "price_alerts"("email");
