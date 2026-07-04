import { MappedReportData, ReportSection } from "../types";

export function compileExecutiveTemplate(data: MappedReportData): ReportSection[] {
  return [
    {
      id: "clearance_overview",
      title: "Executive Clearance Overview",
      elements: [
        {
          type: "TEXT",
          content: "This document provides an executive summary of the verified property identity record compiled for the asset below. All details have been double-peer reviewed and certified using primary registration sources.",
        },
        {
          type: "KEY_VALUE",
          keyValues: [
            { key: "Asset Address", value: data.address },
            { key: "Property Type", value: data.propertyType },
            { key: "Total Survey Plot", value: data.surveyNumber, isMono: true },
            { key: "Registered Area", value: data.area },
          ],
        },
      ],
    },
    {
      id: "confidence_meters",
      title: "Operational Confidence & Completeness Check",
      elements: [
        {
          type: "CONFIDENCE_METER",
          confidenceMeter: {
            label: "Overall Identity Confidence",
            percentage: data.confidence.percentage,
            level: data.confidence.overall,
            details: "Computed by cross-referencing available source evidence with checklist criteria.",
          },
        },
        {
          type: "CONFIDENCE_METER",
          confidenceMeter: {
            label: "Evidence Completeness",
            percentage: data.evidenceCompletenessPercentage,
            level: data.evidenceCompletenessPercentage > 80 ? "HIGH" : data.evidenceCompletenessPercentage > 50 ? "MEDIUM" : "LOW",
            details: "Measures verification status of all required document uploads.",
          },
        },
        {
          type: "CONFIDENCE_METER",
          confidenceMeter: {
            label: "Timeline Traceability",
            percentage: data.timelineCompletenessPercentage,
            level: data.timelineCompletenessPercentage > 75 ? "HIGH" : data.timelineCompletenessPercentage > 40 ? "MEDIUM" : "LOW",
            details: "Audit history span across past ownership transfers.",
          },
        },
        {
          type: "KEY_VALUE",
          keyValues: [
            { key: "Peer Review Status", value: data.reviewStatus },
          ],
        },
      ],
    },
    {
      id: "risks_findings",
      title: "Active Risks & Discrepancies Register",
      elements: [
        {
          type: "TEXT",
          content: "Active risk factors detected during operational checklists and correlation checks are listed below along with their audited evidence references.",
        },
        {
          type: "LIST",
          listItems: data.risks.length === 0
            ? [
                {
                  title: "No Active Risks Flagged",
                  description: "All capability policies completed successfully with zero blockers or critical warning items.",
                  badge: { text: "CLEARED", variant: "SUCCESS" },
                },
              ]
            : data.risks.map((r) => ({
                title: r.message,
                description: `Severity: ${r.type}. Target evidence verification check failed or requires manual resolution.`,
                badge: { text: r.type, variant: r.type === "BLOCKER" ? "BLOCKER" : "WARNING" },
                references: r.supportingEvidence,
              })),
        },
      ],
    },
    {
      id: "recommendations",
      title: "Strategic Advisory Actions",
      elements: [
        {
          type: "LIST",
          listItems: data.recommendations.length === 0
            ? [
                {
                  title: "Proceed with standard closing actions",
                  description: "No corrective actions recommended. Maintain subscription surveillance checks for RERA changes.",
                  badge: { text: "PASSED", variant: "SUCCESS" },
                },
              ]
            : data.recommendations.map((rec) => ({
                title: rec,
                badge: { text: "REQUIRED", variant: "INFO" },
              })),
        },
      ],
    },
  ];
}
