import { PipelineContext, PageModel, ReportPage } from "../types";

export function assembleLayoutStage(context: PipelineContext): PipelineContext {
  const { mappedData, sections, reportNumber, reportHash, identityVersion, schemaVersion } = context;

  if (!mappedData || !sections) {
    throw new Error(
      "Report Engine Layout Assembly Error: Missing mapped data or sections in context."
    );
  }

  const activeReportNum = reportNumber || `REP-${Math.floor(100000 + Math.random() * 900000)}`;
  const activeReportHash = reportHash || "SHA-256-PENDING-VERIFICATION";
  const activeVersion = identityVersion || 1;
  const activeSchemaVersion = schemaVersion || 1;

  // Create neutral pages list
  const pages: ReportPage[] = [];

  // Page 1: Title Page and Summary
  // Let's group spatial identity or overview on Page 1
  pages.push({
    pageNumber: 1,
    header: {
      left: "TRUSTESTATE PROPERTY CLEARANCE PROFILE",
      right: `V${activeVersion}`,
    },
    footer: {
      left: "CONFIDENTIAL PROPERTY IDENTITY RECORD",
      right: "Page 1",
    },
    sections: [sections[0]!], // Executive overview / Spatial parameters
  });

  // Pages 2+: Follow with remaining sections (each on its own page to prevent printing overflows)
  for (let i = 1; i < sections.length; i++) {
    const sec = sections[i]!;
    pages.push({
      pageNumber: i + 1,
      header: {
        left: "TRUSTESTATE PROPERTY CLEARANCE PROFILE",
        right: `V${activeVersion}`,
      },
      footer: {
        left: "CONFIDENTIAL PROPERTY IDENTITY RECORD",
        right: `Page ${i + 1}`,
      },
      sections: [sec],
    });
  }

  // Define Report Manifest
  const manifest = {
    identityVersion: activeVersion,
    schemaVersion: activeSchemaVersion,
    reportVersion: "1.0",
    generatedAt: new Date().toISOString(),
    generatedBy: context.generatedBy || "TrustEstate Operations",
    reportNumber: activeReportNum,
    reportHash: activeReportHash,
    sections: sections.map((s) => s.title),
  };

  const pageModel: PageModel = {
    reportNumber: activeReportNum,
    title: `Property Clearance Identity Report`,
    subtitle: mappedData.address,
    manifest,
    pages,
  };

  return {
    ...context,
    reportNumber: activeReportNum,
    reportHash: activeReportHash,
    pageModel,
  };
}
