/**
 * HTTP client for the Riendzo API (server only).
 *
 *   RIENDZO_API_URL   e.g. http://localhost:4000  (empty = keep the local JSON files)
 *   RIENDZO_API_KEY   same value as SERVICE_API_KEY in the API (needed to create/edit content)
 */
export const apiBase = () => (process.env.RIENDZO_API_URL ?? "").trim().replace(/\/+$/, "");
export const apiEnabled = () => apiBase().length > 0;
export const hasApiKey = () => Boolean(process.env.RIENDZO_API_KEY);

export class ApiError extends Error {
    constructor(public status: number, message: string, public code?: string, public details?: unknown) {
        super(message);
        this.name = "ApiError";
    }
}

type Options = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    /** Send the service key (BackOffice operations and drafts). */
    staff?: boolean;
    /** Name shown in the API activity log. */
    actingUser?: string;
};

/** Calls `${RIENDZO_API_URL}/api/v1${path}` and returns the parsed JSON ({ data, meta? }). */
export async function apiFetch<T = unknown>(path: string, opts: Options = {}): Promise<T> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (opts.body !== undefined) headers["Content-Type"] = "application/json";
    if (opts.staff) {
        const key = process.env.RIENDZO_API_KEY;
        if (!key) throw new ApiError(500, "RIENDZO_API_KEY não está definida no frontend.", "no_key");
        headers["x-api-key"] = key;
        if (opts.actingUser) headers["x-acting-user"] = opts.actingUser;
    }

    let res: Response;
    try {
        res = await fetch(`${apiBase()}/api/v1${path}`, {
            method: opts.method ?? "GET",
            headers,
            body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
            cache: "no-store",
        });
    } catch {
        throw new ApiError(503, "Não foi possível contactar a API do Riendzo.", "unreachable");
    }

    if (res.status === 204) return undefined as T;
    const json = (await res.json().catch(() => null)) as
        | { error?: { code?: string; message?: string; details?: unknown } }
        | null;
    if (!res.ok) throw new ApiError(res.status, json?.error?.message ?? res.statusText, json?.error?.code, json?.error?.details);
    return json as T;
}
