import type { Prisma } from "@prisma/client";
import { prisma } from "../db";

export async function getSetting<T>(key: string): Promise<T | null> {
    const row = await prisma.setting.findUnique({ where: { key } });
    return (row?.value as T | undefined) ?? null;
}

export async function setSetting(key: string, value: unknown) {
    const v = value as Prisma.InputJsonValue;
    await prisma.setting.upsert({ where: { key }, create: { key, value: v }, update: { value: v } });
}
