/**
 * Conteúdo inicial (os mesmos 217 conteúdos do frontend, em 35 menus).
 * Seguro de repetir: só acrescenta o que ainda não existe, nunca altera o que já foi editado.
 *
 *   npx prisma db seed
 */
import { Prisma, PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { columnsOf } from "../src/lib/columns";

const prisma = new PrismaClient();
type Raw = Record<string, unknown> & { slug: string };

const uniq = (v: string[]) => [...new Set(v.filter(Boolean))];

async function main() {
    const content = JSON.parse(fs.readFileSync(path.join(__dirname, "seed-data", "content.json"), "utf8")) as Record<string, Raw[]>;

    const collections = await prisma.collection.findMany();
    if (!collections.length) throw new Error('Sem menus na base de dados. Corra primeiro "npx prisma migrate deploy".');
    const byId = new Map(collections.map((c) => [c.id, c]));

    let created = 0;
    for (const [collectionId, raws] of Object.entries(content)) {
        const col = byId.get(collectionId);
        if (!col) {
            console.warn(`  - menu "${collectionId}" não existe: ignorado`);
            continue;
        }
        const data = raws.map((raw, position) => {
            const { slug, status, featured, featuredWeek, updatedAt: _u, ...rest } = raw;
            return {
                collectionId, slug, position,
                status: status === "draft" ? ("draft" as const) : ("published" as const),
                featured: featured === true,
                featuredWeek: featuredWeek === true,
                ...columnsOf(col.kind, slug, rest),
                data: rest as Prisma.InputJsonValue,
            };
        });
        const r = await prisma.item.createMany({ data, skipDuplicates: true });
        created += r.count;
    }

    // Etiquetas e categorias por menu (listas geradas a partir do conteúdo, editáveis no BackOffice)
    let lists = 0;
    for (const col of collections) {
        if (col.kind !== "catalog") continue;
        const items = (content[col.id] ?? []) as { tag?: string; categories?: string[] }[];
        const specs = [
            !col.tagList && { id: `tags:${col.id}`, label: `Etiquetas · ${col.label}`, group: "Etiquetas por menu", description: `Valores do campo “Etiqueta” em ${col.label}.`, values: uniq(items.map((i) => i.tag ?? "")) },
            !col.categoryList && { id: `cats:${col.id}`, label: `Categorias · ${col.label}`, group: "Categorias por menu", description: `Categorias disponíveis em ${col.label}.`, values: uniq(items.flatMap((i) => i.categories ?? [])) },
        ].filter(Boolean) as { id: string; label: string; group: string; description: string; values: string[] }[];

        for (const l of specs) {
            const made = await prisma.list.createMany({ data: [{ id: l.id, label: l.label, description: l.description, groupName: l.group }], skipDuplicates: true });
            if (made.count) {
                await prisma.listEntry.createMany({
                    data: l.values.map((v, position) => ({ listId: l.id, value: v, label: v, position })),
                    skipDuplicates: true,
                });
                lists++;
            }
        }
    }

    console.log(`Seed concluído: ${created} conteúdos novos, ${lists} listas novas.`);
    console.log(`Total: ${await prisma.item.count()} conteúdos em ${await prisma.collection.count()} menus.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
