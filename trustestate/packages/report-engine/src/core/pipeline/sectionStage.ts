import { PipelineContext } from "../types";
import { getTemplate } from "../templates";

export function compileSectionsStage(context: PipelineContext): PipelineContext {
  const { mappedData, templateId } = context;

  if (!mappedData) {
    throw new Error("Report Engine Compile Sections Error: Missing mapped data in context.");
  }

  // Retrieve template compiler and execute
  const template = getTemplate(templateId);
  const sections = template.compileSections(mappedData);

  return {
    ...context,
    sections,
  };
}
