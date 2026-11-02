import { prisma } from "../db";
import { HttpError, notFound } from "../lib/errors";
import { COLOR } from "../lib/text";

export type ListItem = { value: string; label: string; color?: string };

const toItem = (e: { value: string; label: string; color: string | null }): ListItem =>
    e.color ? { value: e.value, label: e.label, color: e.color } : { value: e.value, label: e.label };

export async function getAllLists() {
    const lists = await prisma.list.findMany({
        orderBy: [{ groupName: "asc" }, { label: "asc" }],
        include: { entries: { orderBy: { position: "asc" } } },
    });
    return lists.map((l) => ({ id: l.id, label: l.label, group: l.groupName, description: l.description, items: l.entries.map(toItem) }));
}

export async function getList(id: string): Promise<ListItem[]> {
    const l = await prisma.list.findUnique({ where: { id }, include: { entries: { orderBy: { position: "asc" } } } });
    if (!l) throw notFound("Lista desconhecida.");
    return l.entries.map(toItem);
}

/** Replaces the whole list (same rules as the BackOffice: trimmed, unique values, valid colours). */
export async function saveList(id: string, items: ListItem[]) {
    if (!(await prisma.list.findUnique({ where: { id }, select: { id: true } }))) throw notFound("Lista desconhecida.");
    const seen = new Set<string>();
    const clean = items
        .map((i) => ({
            value: i.value.trim().slice(0, 80),
            label: i.label.trim().slice(0, 80),
            color: i.color && COLOR.test(i.color) ? i.color : null,
        }))
        .filter((i) => i.value && i.label && !seen.has(i.value) && seen.add(i.value));
    if (clean.length > 500) throw new HttpError(422, "Lista demasiado grande (máx. 500).", "validation");

    await prisma.$transaction([
        prisma.listEntry.deleteMany({ where: { listId: id } }),
        prisma.listEntry.createMany({ data: clean.map((c, position) => ({ listId: id, position, ...c })) }),
    ]);
    return clean.length;
}

/** Options for the tag and category selects of a menu. */
export async function getCollectionOptions(collectionId: string) {
    const c = await prisma.collection.findUnique({ where: { id: collectionId } });
    if (!c) throw notFound("Menu desconhecido.");
    const safe = (id: string) => getList(id).catch(() => [] as ListItem[]);
    const [tags, categories] = await Promise.all([safe(c.tagList ?? `tags:${c.id}`), safe(c.categoryList ?? `cats:${c.id}`)]);
    return { tags, categories };
}
