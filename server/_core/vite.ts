import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { getRouteMeta } from "../../shared/routeMeta";

/**
 * Inject route-specific <title>, <meta name="description">, <meta name="keywords">,
 * <meta name="robots">, <link rel="canonical">, Open Graph, and Twitter Card tags
 * into the HTML template. This ensures crawlers and social platforms receive
 * unique, meaningful meta data for every URL without needing full SSR.
 */
function injectRouteMeta(html: string, urlPath: string): string {
  const meta = getRouteMeta(urlPath);

  // Replace <title> tag
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${meta.title}</title>`
  );

  // Replace or inject description
  if (/<meta\s+name="description"/.test(html)) {
    html = html.replace(
      /<meta\s+name="description"[^>]*>/,
      `<meta name="description" content="${meta.description}" />`
    );
  } else {
    html = html.replace(
      "</title>",
      `</title>\n    <meta name="description" content="${meta.description}" />`
    );
  }

  // Replace or inject keywords
  if (/<meta\s+name="keywords"/.test(html)) {
    html = html.replace(
      /<meta\s+name="keywords"[^>]*>/,
      `<meta name="keywords" content="${meta.keywords}" />`
    );
  } else {
    html = html.replace(
      "</title>",
      `</title>\n    <meta name="keywords" content="${meta.keywords}" />`
    );
  }

  // Replace or inject canonical
  if (/<link\s+rel="canonical"/.test(html)) {
    html = html.replace(
      /<link\s+rel="canonical"[^>]*>/,
      `<link rel="canonical" href="${meta.canonical}" />`
    );
  } else {
    html = html.replace(
      "</head>",
      `  <link rel="canonical" href="${meta.canonical}" />\n  </head>`
    );
  }

  // Build Open Graph + Twitter Card block
  const socialTags = [
    `<meta property="og:type" content="${meta.ogType}" />`,
    `<meta property="og:site_name" content="${meta.siteName}" />`,
    `<meta property="og:title" content="${meta.title}" />`,
    `<meta property="og:description" content="${meta.description}" />`,
    `<meta property="og:url" content="${meta.canonical}" />`,
    `<meta property="og:image" content="${meta.ogImage}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${meta.siteName} — Self-Publishing Platform" />`,
    `<meta name="twitter:card" content="${meta.twitterCard}" />`,
    `<meta name="twitter:title" content="${meta.title}" />`,
    `<meta name="twitter:description" content="${meta.description}" />`,
    `<meta name="twitter:image" content="${meta.ogImage}" />`,
    `<meta name="twitter:image:alt" content="${meta.siteName} — Self-Publishing Platform" />`,
  ].join("\n    ");

  // Remove any previously injected OG/Twitter block to avoid duplicates on re-injection
  // Use [\s\S]*? instead of the /s flag for broader TS target compatibility
  html = html.replace(/\s*<!-- og:start -->[\s\S]*?<!-- og:end -->/, "");

  // Inject the social tags block just before </head>
  html = html.replace(
    "</head>",
    `    <!-- og:start -->\n    ${socialTags}\n    <!-- og:end -->\n  </head>`
  );

  // Inject JSON-LD structured data if present
  if (meta.jsonLd) {
    html = html.replace(/\s*<!-- jsonld:start -->[\s\S]*?<!-- jsonld:end -->/, "");
    const jsonLdScript = `<!-- jsonld:start -->\n    <script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>\n    <!-- jsonld:end -->`;
    html = html.replace("</head>", `    ${jsonLdScript}\n  </head>`);
  }

  return html;
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      // Inject route-specific meta tags before Vite transforms the HTML
      template = injectRouteMeta(template, req.originalUrl);
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use("/assets", express.static(path.resolve(distPath, "assets"), {
    maxAge: "1y",
    immutable: true,
  }));
  app.use(express.static(distPath, {
    maxAge: 0,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache, must-revalidate");
      }
    },
  }));

  // fall through to index.html if the file doesn't exist, injecting route meta
  app.use("*", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    try {
      let html = fs.readFileSync(indexPath, "utf-8");
      html = injectRouteMeta(html, req.originalUrl);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch {
      res.sendFile(indexPath);
    }
  });
}
