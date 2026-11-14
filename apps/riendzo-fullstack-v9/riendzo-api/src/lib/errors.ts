import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from "express";
import { Prisma } from "@prisma/client";
import multer from "multer";
import { ZodError } from "zod";

/** Zod messages are in English by default: say the same in Portuguese (our own messages are kept). */
function ptMessage(i: ZodError["issues"][number]): string {
    if (i.code === "invalid_type") return i.received === "undefined" ? "campo obrigatório" : "valor com formato inválido";
    if (i.code === "too_small") return "valor demasiado curto ou em falta";
    if (i.code === "too_big") return "valor demasiado longo";
    if (i.code === "invalid_enum_value") return "valor não permitido";
    if (i.code === "invalid_string") return "formato inválido";
    return i.message;
}

export class HttpError extends Error {
    constructor(public status: number, message: string, public code = "error", public details?: unknown) {
        super(message);
    }
}

export const badRequest = (m: string, details?: unknown) => new HttpError(400, m, "bad_request", details);
export const unauthorized = (m = "Sessão inválida ou expirada.") => new HttpError(401, m, "unauthorized");
export const forbidden = (m = "Sem permissão para esta ação.") => new HttpError(403, m, "forbidden");
export const notFound = (m = "Não encontrado.") => new HttpError(404, m, "not_found");
export const conflict = (m: string) => new HttpError(409, m, "conflict");

/** Express 4 does not catch rejected promises by itself. */
export const ah =
    (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
    (req, res, next) => {
        fn(req, res, next).catch(next);
    };

export const notFoundHandler: RequestHandler = (_req, res) => {
    res.status(404).json({ error: { code: "not_found", message: "Rota não encontrada." } });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof HttpError) {
        return res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
    }
    if (err instanceof ZodError) {
        const details = err.issues.map((i) => ({ path: i.path.join("."), message: ptMessage(i) }));
        const first = details[0];
        const message = first ? (first.path ? `${first.path}: ${first.message}` : first.message) : "Dados inválidos.";
        return res.status(422).json({ error: { code: "validation", message, details } });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return res.status(409).json({ error: { code: "conflict", message: "Já existe um registo com estes dados." } });
    }
    if (err instanceof multer.MulterError) {
        const tooBig = err.code === "LIMIT_FILE_SIZE";
        return res.status(tooBig ? 413 : 400).json({ error: { code: "upload", message: tooBig ? "Ficheiro demasiado grande." : "Upload inválido." } });
    }
    if ((err as { type?: string })?.type === "entity.parse.failed") {
        return res.status(400).json({ error: { code: "bad_json", message: "JSON inválido." } });
    }
    if ((err as { type?: string })?.type === "entity.too.large") {
        return res.status(413).json({ error: { code: "too_large", message: "Pedido demasiado grande." } });
    }
    console.error(err);
    res.status(500).json({ error: { code: "internal", message: "Erro interno do servidor." } });
};
