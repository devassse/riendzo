-- Divisão administrativa (distritos, municípios, bairros…)
CREATE TABLE "territories" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parent" TEXT NOT NULL,
    "population" INTEGER,
    "area" INTEGER,
    "seat" TEXT,
    "notes" TEXT,

    CONSTRAINT "territories_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "territories_parent_idx" ON "territories"("parent");
