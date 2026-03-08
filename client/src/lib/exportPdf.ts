type SpecRow = { label: string; value: string; bold?: boolean };
type SpecSection = { title: string; rows: SpecRow[] };

interface ExportPdfOptions {
  title: string;
  subtitle?: string;
  sections: SpecSection[];
  footerNote?: string;
  filename: string;
}

function buildSpecSheetHtml(opts: ExportPdfOptions): string {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sectionHtml = opts.sections
    .map(
      (section) => `
      <div class="section">
        <div class="section-title">${esc(section.title)}</div>
        ${section.rows
          .map(
            (r) => `
          <div class="spec-row">
            <span class="spec-label">${esc(r.label)}</span>
            <span class="spec-value${r.bold ? " bold" : ""}">${esc(r.value)}</span>
          </div>`
          )
          .join("")}
      </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${esc(opts.title)} — Easy Book Publishers</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: letter; margin: 0.75in; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      background: #fff;
      color: #1a1008;
      padding: 48px;
      max-width: 720px;
      margin: 0 auto;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 2px solid #c9a96e;
    }
    .brand {
      font-size: 11px;
      color: #8b7b6b;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    h1 {
      font-size: 22px;
      font-weight: bold;
      color: #2a1a0a;
      margin-bottom: 4px;
    }
    .subtitle {
      font-size: 12px;
      color: #8b7b6b;
      margin-bottom: 4px;
    }
    .date {
      font-size: 11px;
      color: #a89880;
    }
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #8b5e3c;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e8dfd0;
    }
    .spec-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      border-bottom: 1px solid #f5f0e8;
      font-size: 13px;
    }
    .spec-label { color: #8b7b6b; }
    .spec-value { font-weight: 500; text-align: right; color: #3a2a1a; }
    .spec-value.bold { font-weight: 700; font-size: 14px; color: #8b5e3c; }
    .footer {
      margin-top: 36px;
      padding-top: 16px;
      border-top: 2px solid #c9a96e;
      text-align: center;
    }
    .footer-brand {
      font-family: Georgia, serif;
      font-size: 13px;
      color: #c9a96e;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .footer-note {
      font-size: 10px;
      color: #a89880;
      font-style: italic;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">Easy Book Publishers</div>
    <h1>${esc(opts.title)}</h1>
    ${opts.subtitle ? `<div class="subtitle">${esc(opts.subtitle)}</div>` : ""}
    <div class="date">${date}</div>
  </div>

  ${sectionHtml}

  ${opts.footerNote ? `<div style="margin-top:16px;font-size:12px;color:#7a6050;line-height:1.6;">${esc(opts.footerNote)}</div>` : ""}

  <div class="footer">
    <div class="footer-brand">Easy Book Publishers</div>
    <div class="footer-note">Manuscript to Masterpiece</div>
  </div>
</body>
</html>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function exportSpecSheetAsPdf(opts: ExportPdfOptions) {
  const html = buildSpecSheetHtml(opts);

  const response = await fetch("/api/render-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html, filename: opts.filename }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || "PDF rendering failed");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = opts.filename.endsWith(".pdf") ? opts.filename : `${opts.filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
