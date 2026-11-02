/** Messages sent through the public contact form (read in Administrador > Mensagens). */
import path from "node:path";
import crypto from "node:crypto";
import { CMS_DIR, locked, readJson, writeJson } from "./store";

export type InboxMessage = { id: string; at: string; name: string; contact: string; message: string; read: boolean };
const FILE = path.join(CMS_DIR, "_inbox.json");

export const listMessages = async () => (await readJson<InboxMessage[]>(FILE)) ?? [];

export function addMessage(m: Pick<InboxMessage, "name" | "contact" | "message">) {
    return locked(async () => {
        const all = await listMessages();
        all.unshift({ id: crypto.randomUUID(), at: new Date().toISOString(), read: false, ...m });
        await writeJson(FILE, all.slice(0, 500));
    });
}
export function markMessage(id: string, read: boolean) {
    return locked(async () => writeJson(FILE, (await listMessages()).map((m) => (m.id === id ? { ...m, read } : m))));
}
export function deleteMessage(id: string) {
    return locked(async () => writeJson(FILE, (await listMessages()).filter((m) => m.id !== id)));
}
