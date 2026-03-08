import puppeteer from "puppeteer-core";

async function getChromiumPath(): Promise<string> {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const fs = await import("fs");
  const candidates = [
    "/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/lib/chromium-browser/chromium-browser",
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return "chromium";
}

export async function renderSpecSheetPdf(html: string): Promise<Buffer> {
  const chromiumPath = await getChromiumPath();

  const browser = await puppeteer.launch({
    executablePath: chromiumPath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--font-render-hinting=none",
    ],
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
    await page.evaluateHandle("document.fonts.ready");

    const pdfUint8 = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: {
        top: "0.75in",
        bottom: "0.75in",
        left: "0.75in",
        right: "0.75in",
      },
    });

    return Buffer.from(pdfUint8);
  } finally {
    await browser.close();
  }
}
