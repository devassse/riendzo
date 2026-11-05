-- Estilos de viagem: passa a poder escolher-se mais de um
ALTER TABLE "members" ADD COLUMN "travel_styles" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- o estilo único que já existia passa para a lista
UPDATE "members" SET "travel_styles" = ARRAY["travel_style"] WHERE "travel_style" IS NOT NULL AND "travel_style" <> '';
