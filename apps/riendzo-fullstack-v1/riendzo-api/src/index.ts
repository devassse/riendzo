import { promises as fs } from "node:fs";
import { createApp } from "./app";
import { config } from "./config";
import { prisma } from "./db";

async function main() {
    await fs.mkdir(config.uploadsDir, { recursive: true });
    await prisma.$connect();

    if (!(await prisma.collection.count())) {
        console.warn('⚠  A base de dados não tem os dados básicos. Corra "npm run setup" (migrations + conteúdo inicial).');
    }
    if (config.isProd && !config.serviceApiKey) {
        console.warn("⚠  SERVICE_API_KEY não definida: o frontend só poderá ler conteúdo público.");
    }

    const server = createApp().listen(config.port, () => {
        console.log(`Riendzo API a correr em http://localhost:${config.port}  (${config.isProd ? "produção" : "desenvolvimento"})`);
    });

    const stop = (signal: string) => {
        console.log(`${signal}: a terminar…`);
        server.close(async () => {
            await prisma.$disconnect();
            process.exit(0);
        });
        setTimeout(() => process.exit(1), 10_000).unref();
    };
    process.on("SIGTERM", () => stop("SIGTERM"));
    process.on("SIGINT", () => stop("SIGINT"));
}

main().catch(async (e) => {
    console.error("Falha ao arrancar:", e);
    await prisma.$disconnect().catch(() => undefined);
    process.exit(1);
});
