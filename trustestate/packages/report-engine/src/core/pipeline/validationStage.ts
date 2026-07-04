import { PipelineContext } from "../types";

export function validateSnapshotStage(context: PipelineContext): PipelineContext {
  const { snapshot, templateId } = context;

  if (!snapshot) {
    throw new Error("Report Engine Validation Error: Missing property identity snapshot.");
  }

  if (!snapshot.propertyId || !snapshot.address) {
    throw new Error(
      `Report Engine Validation Error: Snapshot metadata is corrupted. Missing property ID or address.`
    );
  }

  if (!snapshot.evidence) {
    throw new Error("Report Engine Validation Error: Snapshot missing evidence register.");
  }

  if (!snapshot.history) {
    throw new Error("Report Engine Validation Error: Snapshot missing history timeline.");
  }

  if (!snapshot.capabilities) {
    throw new Error("Report Engine Validation Error: Snapshot missing capability evaluation results.");
  }

  // Validate template ID is supported
  const allowedTemplates = ["executive", "legal", "bank", "insurance", "internal"];
  if (!allowedTemplates.includes(templateId.toLowerCase())) {
    throw new Error(
      `Report Engine Validation Error: Unsupported report template selection: "${templateId}". Supported templates: ${allowedTemplates.join(
        ", "
      )}`
    );
  }

  return context;
}
