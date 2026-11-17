import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { config } from "./config";
import { prisma } from "./db";
import { errorHandler, notFoundHandler } from "./lib/errors";
import { adminAuthRouter } from "./routes/admin/auth";
import { adminContentRouter } from "./routes/admin/content";
import { adminMediaRouter } from "./routes/admin/media";
import { adminSystemRouter } from "./routes/admin/system";
import { membersRouter } from "./routes/members";
import { publicRouter } from "./routes/public";

export function createApp() {
    const app = express();
    app.disable("x-powered-by");
    if (config.trustProxy) app.set("trust proxy", config.trustProxy);

    // Images are loaded by the site from another origin
    app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
    app.use(
        cors({
            origin: (origin, cb) => cb(null, !origin || config.corsOrigins.includes(origin.replace(/\/+$/, ""))),
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization", "x-api-key", "x-acting-user"],
            maxAge: 86_400,
        })
    );

    app.get("/health", async (_req, res) => {
        try {
            await prisma.$queryRaw`SELECT 1`;
            res.json({ status: "ok", db: "up", time: new Date().toISOString() });
        } catch {
            res.status(503).json({ status: "error", db: "down" });
        }
    });

    // Uploaded files (same path the frontend already uses: /api/media/<year>/<file>)
    app.use(
        ["/media", "/api/media"],
        express.static(config.uploadsDir, {
            index: false, dotfiles: "ignore", maxAge: "365d", immutable: true,
            setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
        })
    );

    app.use(
        rateLimit({
            windowMs: 60_000, limit: 300, standardHeaders: "draft-7", legacyHeaders: false,
            message: { error: { code: "rate_limited", message: "Demasiados pedidos. Tente de novo dentro de instantes." } },
            // the Next.js server makes many requests from one IP
            skip: (req) => Boolean(config.serviceApiKey && req.header("x-api-key") === config.serviceApiKey),
        })
    );
    app.use(express.json({ limit: "1mb" }));

    const v1 = express.Router();
    v1.use(publicRouter);
    v1.use("/members", membersRouter);

    const admin = express.Router();
    admin.use("/auth", adminAuthRouter);
    admin.use(adminContentRouter);
    admin.use(adminSystemRouter);
    admin.use(adminMediaRouter);
    v1.use("/admin", admin);

    app.use("/api/v1", v1);

    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
}
