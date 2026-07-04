import { PageModel, LayoutElement } from "../types";

export function renderPageModelToHtml(model: PageModel): string {
  const cssStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

    :root {
      --primary: #1e3a8a;
      --primary-light: #eff6ff;
      --text: #1f2937;
      --text-light: #4b5563;
      --border: #e5e7eb;
      --bg-card: #ffffff;
      --bg-body: #f9fafb;
      
      /* Severity colors */
      --color-blocker: #ef4444;
      --bg-blocker: #fef2f2;
      --color-warning: #f59e0b;
      --bg-warning: #fffbeb;
      --color-success: #10b981;
      --bg-success: #ecfdf5;
      --color-info: #3b82f6;
      --bg-info: #eff6ff;
      --color-neutral: #6b7280;
      --bg-neutral: #f3f4f6;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: var(--text);
      background-color: var(--bg-body);
      line-height: 1.5;
      font-size: 14px;
      padding: 20px;
    }

    /* Page model rendering structure */
    .report-container {
      max-width: 900px;
      margin: 0 auto;
      background: var(--bg-card);
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
      border-radius: 8px;
      overflow: hidden;
    }

    .report-page {
      padding: 40px;
      min-height: 297mm; /* Standard A4 height ratio */
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      background: var(--bg-card);
    }

    /* Page divider for visual layout check in browser */
    .report-page:not(:last-child) {
      border-bottom: 2px dashed var(--border);
    }

    /* Print-first CSS styling rules */
    @media print {
      body {
        background-color: #ffffff;
        padding: 0;
      }
      .report-container {
        box-shadow: none;
        max-width: 100%;
        border-radius: 0;
      }
      .report-page {
        padding: 0;
        min-height: auto;
        page-break-after: always;
        break-after: page;
        border-bottom: none !important;
      }
      .page-break {
        page-break-after: always;
        break-after: page;
      }
    }

    @page {
      size: A4;
      margin: 20mm 20mm 20mm 20mm;
    }

    /* Header & Footer presentation nodes */
    .page-header-block {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.5px solid var(--primary);
      padding-bottom: 10px;
      margin-bottom: 30px;
    }

    .page-header-title {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      color: var(--primary);
      text-transform: uppercase;
    }

    .page-header-meta {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-light);
    }

    .page-footer-block {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--border);
      padding-top: 10px;
      margin-top: auto;
      font-size: 9px;
      font-weight: 600;
      color: var(--text-light);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    main.page-content {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 25px;
      margin-bottom: 30px;
    }

    /* Sections */
    .report-section {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .section-title-header {
      font-size: 16px;
      font-weight: 700;
      color: var(--primary);
      border-left: 4px solid var(--primary);
      padding-left: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Element Nodes */
    .element-text {
      font-size: 13.5px;
      color: var(--text-light);
      line-height: 1.6;
      text-align: justify;
    }

    .element-divider {
      height: 1px;
      background-color: var(--border);
      margin: 10px 0;
    }

    /* Key Value Tables */
    .kv-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 5px;
    }

    .kv-table tr {
      border-bottom: 1px solid var(--border);
    }

    .kv-table td {
      padding: 10px 12px;
      font-size: 13px;
    }

    .kv-table td.kv-key {
      font-weight: 600;
      color: var(--text);
      width: 35%;
      background-color: #fafafa;
    }

    .kv-table td.kv-value {
      color: var(--text-light);
    }

    .mono-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
    }

    /* Bullet List with Severity Badges */
    .list-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      list-style: none;
    }

    .list-item-block {
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 12px 15px;
      background-color: #fafafa;
    }

    .list-item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 4px;
    }

    .list-item-title {
      font-weight: 600;
      font-size: 13.5px;
      color: var(--text);
    }

    .badge {
      font-size: 9px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    .badge-info { color: var(--color-info); background-color: var(--bg-info); border: 1px solid #bfdbfe; }
    .badge-warning { color: var(--color-warning); background-color: var(--bg-warning); border: 1px solid #fde68a; }
    .badge-blocker { color: var(--color-blocker); background-color: var(--bg-blocker); border: 1px solid #fecaca; }
    .badge-success { color: var(--color-success); background-color: var(--bg-success); border: 1px solid #a7f3d0; }
    .badge-neutral { color: var(--color-neutral); background-color: var(--bg-neutral); border: 1px solid #e5e7eb; }

    .list-item-desc {
      font-size: 12.5px;
      color: var(--text-light);
      line-height: 1.4;
    }

    .list-item-references {
      margin-top: 8px;
      font-size: 11px;
      color: var(--primary);
      font-weight: 500;
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .list-item-references span {
      background: var(--primary-light);
      padding: 1px 5px;
      border-radius: 3px;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Confidence Meters */
    .meter-block {
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 15px;
      background-color: #fafafa;
      margin-bottom: 10px;
    }

    .meter-label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .meter-label {
      font-weight: 600;
      font-size: 13.5px;
      color: var(--text);
    }

    .meter-value-badge {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .meter-percentage {
      font-weight: 700;
      font-size: 14px;
      color: var(--primary);
    }

    .meter-outer-bar {
      height: 8px;
      background-color: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 6px;
    }

    .meter-inner-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
      background: linear-gradient(90deg, var(--primary) 0%, #3b82f6 100%);
    }

    .meter-desc {
      font-size: 11px;
      color: var(--text-light);
      margin-top: 4px;
    }

    /* ASCII visualization meter (extremely safe fallback) */
    .meter-ascii-fallback {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      letter-spacing: 1px;
      color: var(--text-light);
      background-color: #f3f4f6;
      padding: 3px 6px;
      border-radius: 4px;
      display: inline-block;
      margin-top: 4px;
    }

    /* Verification Block & Stamp */
    .verification-card {
      border: 2px solid var(--primary);
      border-radius: 8px;
      background-color: #fafafa;
      overflow: hidden;
      margin-top: 15px;
    }

    .verification-title-banner {
      background-color: var(--primary);
      color: #ffffff;
      padding: 8px 15px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .verification-grid {
      display: grid;
      grid-template-columns: 1fr 200px;
      border-bottom: 1px solid var(--border);
    }

    @media (max-width: 600px) {
      .verification-grid {
        grid-template-columns: 1fr;
      }
    }

    .verification-info-pane {
      padding: 15px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .verification-row {
      display: flex;
      justify-content: space-between;
      font-size: 11.5px;
      border-bottom: 1px dashed var(--border);
      padding-bottom: 4px;
    }

    .verification-row span:first-child {
      font-weight: 600;
      color: var(--text-light);
    }

    .verification-row span:last-child {
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
    }

    .verification-qr-pane {
      border-left: 1px solid var(--border);
      padding: 15px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #ffffff;
      text-align: center;
    }

    @media (max-width: 600px) {
      .verification-qr-pane {
        border-left: none;
        border-top: 1px solid var(--border);
      }
    }

    .qr-mock-box {
      width: 110px;
      height: 110px;
      border: 2px dashed var(--text-light);
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-light);
      font-size: 9px;
      font-weight: 700;
      padding: 5px;
      background-color: #fafafa;
    }

    .signature-seal-banner {
      background-color: #f3f4f6;
      padding: 12px 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .signature-seal-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-light);
    }

    .signature-mock-stamp {
      font-family: 'JetBrains Mono', monospace;
      border: 2px double var(--color-success);
      color: var(--color-success);
      border-radius: 4px;
      padding: 3px 10px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      transform: rotate(-2deg);
      background-color: #ffffff;
      display: inline-block;
    }
  `;

  // Render elements recursively
  const renderElement = (el: LayoutElement): string => {
    switch (el.type) {
      case "TEXT":
        return `<p class="element-text">${el.content || ""}</p>`;

      case "SECTION_DIVIDER":
        return `<div class="element-divider"></div>`;

      case "KEY_VALUE":
        if (!el.keyValues) return "";
        return `
          <table class="kv-table">
            <tbody>
              ${el.keyValues
                .map(
                  (kv) => `
                <tr>
                  <td class="kv-key">${kv.key}</td>
                  <td class="kv-value ${kv.isMono ? "mono-text" : ""}">${kv.value}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        `;

      case "LIST":
        if (!el.listItems) return "";
        return `
          <ul class="list-container">
            ${el.listItems
              .map(
                (item) => `
              <li class="list-item-block">
                <div class="list-item-header">
                  <span class="list-item-title">${item.title || ""}</span>
                  ${
                    item.badge
                      ? `<span class="badge badge-${item.badge.variant.toLowerCase()}">${item.badge.text}</span>`
                      : ""
                  }
                </div>
                ${item.description ? `<p class="list-item-desc">${item.description}</p>` : ""}
                ${
                  item.references && item.references.length > 0
                    ? `
                  <div class="list-item-references">
                    Evidence: ${item.references
                      .map((ref) => `<span>${ref}</span>`)
                      .join("")}
                  </div>
                `
                    : ""
                }
              </li>
            `
              )
              .join("")}
          </ul>
        `;

      case "CONFIDENCE_METER":
        if (!el.confidenceMeter) return "";
        const m = el.confidenceMeter;
        const fillBlocks = Math.round(m.percentage / 10);
        const emptyBlocks = 10 - fillBlocks;
        const asciiBar = "█".repeat(fillBlocks) + "░".repeat(emptyBlocks);

        return `
          <div class="meter-block">
            <div class="meter-label-row">
              <span class="meter-label">${m.label}</span>
              <div class="meter-value-badge">
                <span class="badge badge-info">${m.level}</span>
                <span class="meter-percentage">${m.percentage}%</span>
              </div>
            </div>
            <div class="meter-outer-bar" aria-label="${m.label} is ${m.percentage}%">
              <div class="meter-inner-fill" style="width: ${m.percentage}%;"></div>
            </div>
            <div>
              <span class="meter-ascii-fallback">${asciiBar}</span>
              ${m.details ? `<p class="meter-desc">${m.details}</p>` : ""}
            </div>
          </div>
        `;

      case "VERIFICATION_BLOCK":
        if (!el.verificationBlock) return "";
        const vb = el.verificationBlock;
        return `
          <div class="verification-card">
            <div class="verification-title-banner">Cryptographic Ledger Attestation</div>
            <div class="verification-grid">
              <div class="verification-info-pane">
                <div class="verification-row">
                  <span>Report Number</span>
                  <span>${vb.reportNumber}</span>
                </div>
                <div class="verification-row">
                  <span>Identity Chain Version</span>
                  <span>V${vb.identityVersion}</span>
                </div>
                <div class="verification-row">
                  <span>Compilation Schema</span>
                  <span>Schema V${vb.schemaVersion}</span>
                </div>
                <div class="verification-row">
                  <span>Engine Export Version</span>
                  <span>Report V${vb.reportVersion}</span>
                </div>
                <div class="verification-row">
                  <span>Generated Date</span>
                  <span>${vb.generatedDate}</span>
                </div>
                <div class="verification-row" style="border-bottom: none;">
                  <span>Deterministic Hash</span>
                  <span style="font-size: 9px; line-height: 1.4; word-break: break-all;">${vb.reportHash}</span>
                </div>
              </div>
              <div class="verification-qr-pane">
                <div class="qr-mock-box">
                  <div style="font-size: 8px; margin-bottom: 4px;">TRUSTESTATE SEAL</div>
                  <div style="font-size: 6px; opacity: 0.7;">QR VERIFICATION RESERVED</div>
                </div>
              </div>
            </div>
            <div class="signature-seal-banner">
              <span class="signature-seal-title">Peer Signatures</span>
              <span class="signature-mock-stamp">Verified Autograph</span>
            </div>
          </div>
        `;

      default:
        return "";
    }
  };

  // Render pages
  const pagesHtml = model.pages
    .map(
      (page) => `
    <section class="report-page">
      ${
        page.header
          ? `
        <header class="page-header-block">
          <span class="page-header-title">${page.header.left}</span>
          <span class="page-header-meta">${page.header.right}</span>
        </header>
      `
          : ""
      }
      
      <main class="page-content">
        ${page.sections
          .map(
            (sec) => `
          <div class="report-section">
            <h3 class="section-title-header">${sec.title}</h3>
            ${sec.elements.map(renderElement).join("")}
          </div>
        `
          )
          .join("")}
      </main>
      
      ${
        page.footer
          ? `
        <footer class="page-footer-block">
          <span>${page.footer.left}</span>
          <span>${page.footer.right}</span>
        </footer>
      `
          : ""
      }
    </section>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${model.title}</title>
      <style>
        ${cssStyles}
      </style>
    </head>
    <body>
      <div class="report-container">
        ${pagesHtml}
      </div>
    </body>
    </html>
  `.trim();
}
