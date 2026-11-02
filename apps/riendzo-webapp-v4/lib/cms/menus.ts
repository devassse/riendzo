/**
 * "Em breve" flags for the public menus and submenus.
 * Key = section id (e.g. "turismo") or submenu href (e.g. "/turismo/guias").
 */
import path from "node:path";
import { CMS_DIR, locked, readJson, writeJson } from "./store";

const FILE = path.join(CMS_DIR, "_menus.json");

export type MenuFlags = Record<string, boolean>;

export async function getMenuFlags(): Promise<MenuFlags> {
    return (await readJson<MenuFlags>(FILE)) ?? {};
}

export function saveMenuFlags(flags: MenuFlags) {
    return locked(async () => {
        const clean: MenuFlags = {};
        for (const [k, v] of Object.entries(flags)) if (v === true && /^[a-z0-9/_-]{1,80}$/i.test(k)) clean[k] = true;
        await writeJson(FILE, clean);
    });
}
