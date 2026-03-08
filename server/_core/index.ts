import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { setupAuth, registerAuthRoutes } from "../replit_integrations/auth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { WebhookHandlers } from "../webhookHandlers";

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
