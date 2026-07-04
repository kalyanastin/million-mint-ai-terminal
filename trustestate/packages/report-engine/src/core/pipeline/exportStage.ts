import { PipelineContext } from "../types";
import { validatePageModelOrThrow } from "../validator/pageValidator";
import { renderPageModelToHtml } from "../renderer/htmlRenderer";

export function exportReportStage(context: PipelineContext): PipelineContext {
  const { pageModel } = context;

  if (!pageModel) {
    throw new Error("Report Engine Export Error: Missing page model in context.");
  }

  // 1. Run Page Model Validator. Throws error if model is malformed.
  validatePageModelOrThrow(pageModel);

  // 2. Render verified page model to semantic print-first HTML
  const renderedHtml = renderPageModelToHtml(pageModel);

  return {
    ...context,
    outputManifest: pageModel.manifest,
    outputHtml: renderedHtml,
  };
}
