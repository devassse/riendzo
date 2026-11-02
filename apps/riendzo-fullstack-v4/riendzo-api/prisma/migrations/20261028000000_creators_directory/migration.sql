-- Criadores de Conteúdo passam a ter página própria (como os restaurantes, alojamentos…)
UPDATE "collections" SET "directory" = true, "featured" = true WHERE "id" = 'blog-creators';
