-- Novo menu: Serviços > Serviços Gerais (logo a seguir a "Telefonia, TV & Rádio")
UPDATE "collections" SET "position" = "position" + 1
 WHERE "position" > (SELECT "position" FROM "collections" WHERE "id" = 'services-comms')
   AND NOT EXISTS (SELECT 1 FROM "collections" WHERE "id" = 'services-general');

INSERT INTO "collections" ("id","kind","group_id","label","singular","description","public_path","color","tag_list","category_list","tag_label","contact","featured","directory","offers","position")
SELECT 'services-general','catalog'::"CollectionKind",'services','Serviços Gerais','serviço','Canalizadores, eletricistas, mecânicos, limpeza, construção e outros profissionais do dia a dia.','/servicos/gerais','#5b7fa6','provinces','general-service-types','Província',true,true,true,
       '{"group":"Tipo de serviço","item":"Serviço","title":"Serviços e preços"}'::jsonb,
       (SELECT "position" FROM "collections" WHERE "id" = 'services-comms') + 1
ON CONFLICT ("id") DO NOTHING;

-- Lista dos tipos de serviço geral
INSERT INTO "lists" ("id","label","description","group_name") VALUES ('general-service-types','Tipos de serviço geral','Canalização, eletricidade, limpeza, mecânica…','Serviços') ON CONFLICT ("id") DO NOTHING;
INSERT INTO "list_entries" ("list_id","value","label","color","position") VALUES ('general-service-types','Canalização','Canalização',NULL,0) ON CONFLICT ("list_id","value") DO NOTHING;
INSERT INTO "list_entries" ("list_id","value","label","color","position") VALUES ('general-service-types','Eletricidade','Eletricidade',NULL,1) ON CONFLICT ("list_id","value") DO NOTHING;
INSERT INTO "list_entries" ("list_id","value","label","color","position") VALUES ('general-service-types','Limpeza','Limpeza',NULL,2) ON CONFLICT ("list_id","value") DO NOTHING;
INSERT INTO "list_entries" ("list_id","value","label","color","position") VALUES ('general-service-types','Mecânica auto','Mecânica auto',NULL,3) ON CONFLICT ("list_id","value") DO NOTHING;
INSERT INTO "list_entries" ("list_id","value","label","color","position") VALUES ('general-service-types','Construção e obras','Construção e obras',NULL,4) ON CONFLICT ("list_id","value") DO NOTHING;
INSERT INTO "list_entries" ("list_id","value","label","color","position") VALUES ('general-service-types','Carpintaria','Carpintaria',NULL,5) ON CONFLICT ("list_id","value") DO NOTHING;
INSERT INTO "list_entries" ("list_id","value","label","color","position") VALUES ('general-service-types','Serralharia','Serralharia',NULL,6) ON CONFLICT ("list_id","value") DO NOTHING;
INSERT INTO "list_entries" ("list_id","value","label","color","position") VALUES ('general-service-types','Pintura','Pintura',NULL,7) ON CONFLICT ("list_id","value") DO NOTHING;
INSERT INTO "list_entries" ("list_id","value","label","color","position") VALUES ('general-service-types','Jardinagem','Jardinagem',NULL,8) ON CONFLICT ("list_id","value") DO NOTHING;
INSERT INTO "list_entries" ("list_id","value","label","color","position") VALUES ('general-service-types','Informática e telecomunicações','Informática e telecomunicações',NULL,9) ON CONFLICT ("list_id","value") DO NOTHING;
INSERT INTO "list_entries" ("list_id","value","label","color","position") VALUES ('general-service-types','Mudanças e transportes','Mudanças e transportes',NULL,10) ON CONFLICT ("list_id","value") DO NOTHING;
INSERT INTO "list_entries" ("list_id","value","label","color","position") VALUES ('general-service-types','Lavandaria','Lavandaria',NULL,11) ON CONFLICT ("list_id","value") DO NOTHING;
INSERT INTO "list_entries" ("list_id","value","label","color","position") VALUES ('general-service-types','Costura e alfaiataria','Costura e alfaiataria',NULL,12) ON CONFLICT ("list_id","value") DO NOTHING;
INSERT INTO "list_entries" ("list_id","value","label","color","position") VALUES ('general-service-types','Beleza e bem-estar','Beleza e bem-estar',NULL,13) ON CONFLICT ("list_id","value") DO NOTHING;
INSERT INTO "list_entries" ("list_id","value","label","color","position") VALUES ('general-service-types','Outros','Outros',NULL,14) ON CONFLICT ("list_id","value") DO NOTHING;
