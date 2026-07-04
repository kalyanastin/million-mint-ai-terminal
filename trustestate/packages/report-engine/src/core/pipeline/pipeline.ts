import { PipelineContext } from "../types";
import { validateSnapshotStage } from "./validationStage";
import { mapSnapshotStage } from "./mappingStage";
import { compileSectionsStage } from "./sectionStage";
import { assembleLayoutStage } from "./layoutStage";
import { verifyReportStage } from "./verificationStage";
import { exportReportStage } from "./exportStage";

export function executeReportPipeline(context: PipelineContext): PipelineContext {
  // Execute stages sequentially
  let currentContext = { ...context };

  currentContext = validateSnapshotStage(currentContext);
  currentContext = mapSnapshotStage(currentContext);
  currentContext = compileSectionsStage(currentContext);
  currentContext = assembleLayoutStage(currentContext);
  currentContext = verifyReportStage(currentContext);
  currentContext = exportReportStage(currentContext);

  return currentContext;
}
