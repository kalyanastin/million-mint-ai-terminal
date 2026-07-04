import { PipelineContext } from "../types";

export function exportReportStage(context: PipelineContext): PipelineContext {
  const { pageModel } = context;

  if (!pageModel) {
    throw new Error("Report Engine Export Error: Missing page model in context.");
  }

  // Placeholder HTML structure for Milestone 1
  // This will be replaced by the print-first layout HTML renderer in Milestone 4
  const placeholderHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${pageModel.title}</title>
      <style>
        body { font-family: sans-serif; padding: 40px; color: #333; }
        h1 { color: #1e3a8a; }
      </style>
    </head>
    <body>
      <h1>${pageModel.title}</h1>
      <h2>${pageModel.subtitle || ""}</h2>
      <p>Report Number: ${pageModel.reportNumber}</p>
      <p>Report Hash: ${pageModel.manifest.reportHash}</p>
      <p>Generated At: ${pageModel.manifest.generatedAt}</p>
    </body>
    </html>
  `.trim();

  return {
    ...context,
    outputManifest: pageModel.manifest,
    outputHtml: placeholderHtml,
  };
}
