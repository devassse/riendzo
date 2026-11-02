-- Contactos e fotografia dos utilizadores do BackOffice
ALTER TABLE "admin_users" ADD COLUMN "email" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "avatar" TEXT;

CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- Notificações: a atividade passa a guardar o endereço do registo
ALTER TABLE "activity" ADD COLUMN "slug" TEXT;

-- Definições (Home, cores da Cronologia, perfil da conta principal)
CREATE TABLE "settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

-- Recuperação de palavra-passe
CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "password_resets_token_hash_key" ON "password_resets"("token_hash");

CREATE INDEX "password_resets_kind_account_id_idx" ON "password_resets"("kind", "account_id");

-- Novo menu: Gastronomia > Frutos do Mar (logo a seguir às receitas)
UPDATE "collections" SET "position" = "position" + 1 WHERE "position" > 6 AND NOT EXISTS (SELECT 1 FROM "collections" WHERE "id" = 'gastronomy-seafood');
INSERT INTO "collections" ("id","kind","group_id","label","singular","description","public_path","color","tag_list","category_list","tag_label","contact","featured","directory","offers","position")
VALUES ('gastronomy-seafood','recipe'::"CollectionKind",'gastronomy','Frutos do Mar','prato','Camarão, caranguejo, lagosta e peixe: receitas da costa.','/gastronomia/mariscos','#00aefb',NULL,NULL,NULL,false,false,false,NULL,7)
ON CONFLICT ("id") DO NOTHING;
