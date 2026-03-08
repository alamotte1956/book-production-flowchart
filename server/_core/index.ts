import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { setupAuth, registerAuthRoutes } from "../replit_integrations/auth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { WebhookHandlers } from "../webhookHandlers";
import { getLocalStorageDir } from "../storage";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn('[Stripe] DATABASE_URL not set, skipping Stripe init');
    return;
  }

  try {
    const { runMigrations } = await import('stripe-replit-sync');
    const { getStripeSync } = await import('../stripeClient');

    console.log('[Stripe] Running schema migrations...');
    await runMigrations({ databaseUrl, schema: 'stripe' });
    console.log('[Stripe] Schema ready');

    const stripeSync = await getStripeSync();

    console.log('[Stripe] Setting up managed webhook...');
    const domains = process.env.REPLIT_DOMAINS?.split(',');
    if (domains?.[0]) {
      const webhookUrl = `https://${domains[0]}/api/stripe/webhook`;
      try {
        const result = await stripeSync.findOrCreateManagedWebhook(webhookUrl);
        console.log(`[Stripe] Webhook configured: ${webhookUrl}`, result ? 'OK' : 'result empty');
      } catch (webhookError: any) {
        console.warn(`[Stripe] Webhook setup warning: ${webhookError.message}`);
      }
    }

    stripeSync.syncBackfill()
      .then(() => console.log('[Stripe] Data synced'))
      .catch((err: any) => console.error('[Stripe] Sync error:', err));
  } catch (error) {
    console.error('[Stripe] Init failed:', error);
  }
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      const signature = req.headers['stripe-signature'];
      if (!signature) {
        return res.status(400).json({ error: 'Missing stripe-signature' });
      }
      try {
        const sig = Array.isArray(signature) ? signature[0] : signature;
        await WebhookHandlers.processWebhook(req.body as Buffer, sig);
        res.status(200).json({ received: true });
      } catch (error: any) {
        console.error('[Stripe] Webhook error:', error.message);
        res.status(400).json({ error: 'Webhook processing error' });
      }
    }
  );

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  const CONTENT_TYPE_MAP: Record<string, string> = {
    ".pdf": "application/pdf",
    ".epub": "application/epub+zip",
    ".idml": "application/vnd.adobe.indesign-idml-package",
    ".zip": "application/zip",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
  };
  app.post("/api/render-pdf", express.json({ limit: "2mb" }), async (req, res) => {
    try {
      const { html, filename } = req.body;
      if (!html || typeof html !== "string") {
        return res.status(400).json({ error: "Missing html field" });
      }
      const { renderSpecSheetPdf } = await import("../specSheetRenderer.js");
      const pdfBuffer = await renderSpecSheetPdf(html);
      const safeName = (filename || "spec-sheet").replace(/[^a-zA-Z0-9_-]/g, "_") + ".pdf";
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
      res.setHeader("Content-Length", pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[render-pdf] Error:", msg);
      res.status(500).json({ error: "PDF rendering failed", details: msg });
    }
  });

  app.get("/api/files/*", async (req, res) => {
    const rawPath = (req.params[0] || "").replace(/^\/+/, "");
    if (!rawPath || rawPath.includes("..") || path.isAbsolute(rawPath)) {
      return res.status(400).json({ error: "Invalid path" });
    }
    const storageDir = getLocalStorageDir();
    const filePath = path.resolve(storageDir, rawPath);
    if (!filePath.startsWith(storageDir)) {
      return res.status(400).json({ error: "Invalid path" });
    }
    const { existsSync, createReadStream } = await import("fs");
    if (!existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPE_MAP[ext] || "application/octet-stream";
    const fileName = path.basename(filePath);
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    const stream = createReadStream(filePath);
    stream.pipe(res);
  });

  await setupAuth(app);
  registerAuthRoutes(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "5000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  await initStripe();
}

startServer().catch(console.error);
