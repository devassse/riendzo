export const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export const slugify = (text: string) =>
    fold(text).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const COLOR = /^#[0-9a-fA-F]{6}$/;
