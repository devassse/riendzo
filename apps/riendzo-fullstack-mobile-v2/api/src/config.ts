import "dotenv/config";
import path from "node:path";
import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

// Variáveis vazias (FOO=) contam como "não definidas"
const raw: Record<string, string | undefined> = { ...process.env };
for (const k of Object.keys(raw)) if (raw[k] === "") delete raw[k];
if (!isProd) {
    raw.JWT_SECRET ??= "dev-only-secret-change-me-0123456789abcdef";
    raw.ADMIN_PASSWORD ??= "riendzo-admin";
}

const schema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatório"),
    JWT_SECRET: z.string().min(32, "JWT_SECRET precisa de 32+ caracteres (openssl rand -base64 48)"),
    CORS_ORIGINS: z.string().default("http://localhost:3000"),
    TRUST_PROXY: z.coerce.number().int().min(0).default(0),
    SERVICE_API_KEY: z.string().min(24, "SERVICE_API_KEY precisa de 24+ caracteres").optional(),
    ADMIN_USERNAME: z.string().min(3).default("admin"),
    ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD precisa de 8+ caracteres"),
    SITE_URL: z.string().default("http://localhost:3000"),
    RESEND_API_KEY: z.string().optional(),
    MAIL_FROM: z.string().optional(),
    UPLOADS_DIR: z.string().default("./uploads"),
    MAX_UPLOAD_MB: z.coerce.number().min(1).max(100).default(15),
});

const parsed = schema.safeParse(raw);
if (!parsed.success) {
    console.error("Configuração inválida:");
    for (const i of parsed.error.issues) console.error(`  - ${i.path.join(".")}: ${i.message}`);
    process.exit(1);
}
const env = parsed.data;

export const config = {
    isProd,
    port: env.PORT,
    jwtSecret: env.JWT_SECRET,
    corsOrigins: env.CORS_ORIGINS.split(",").map((s) => s.trim().replace(/\/+$/, "")).filter(Boolean),
    trustProxy: env.TRUST_PROXY,
    serviceApiKey: env.SERVICE_API_KEY,
    adminUsername: env.ADMIN_USERNAME.toLowerCase(),
    adminPassword: env.ADMIN_PASSWORD,
    siteUrl: env.SITE_URL.replace(/\/+$/, ""),
    resendApiKey: env.RESEND_API_KEY,
    mailFrom: env.MAIL_FROM,
    uploadsDir: path.resolve(env.UPLOADS_DIR),
    maxUploadBytes: env.MAX_UPLOAD_MB * 1024 * 1024,
};
