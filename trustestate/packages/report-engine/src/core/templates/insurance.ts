import { MappedReportData, ReportSection } from "../types";

export function compileInsuranceTemplate(data: MappedReportData): ReportSection[] {
  return [
    {
      id: "underwriting_assessment",
      title: "Underwriting Risk Assessment & Profile",
      elements: [
        {
          type: "TEXT",
          content: "Comprehensive property risk profile for title and spatial structural indemnity coverage reviews.",
        },
        {
          type: "KEY_VALUE",
          keyValues: [
            { key: "Asset Address", value: data.address },
            { key: "Survey Plot Reference", value: data.surveyNumber, isMono: true },
            { key: "Property Category", value: data.propertyType },
            { key: "Total Coverage Area", value: data.area },
          ],
        },
      ],
    },
    {
      id: "verification_status",
      title: "Title & Documentation Completeness Score",
      elements: [
        {
          type: "CONFIDENCE_METER",
          confidenceMeter: {
            label: "Risk Rating Score Confidence",
            percentage: data.confidence.percentage,
            level: data.confidence.overall,
            details: "Indicates historical ownership tracing credibility.",
          },
        },
        {
          type: "CONFIDENCE_METER",
          confidenceMeter: {
            label: "Documents Validation Index",
            percentage: data.evidenceCompletenessPercentage,
            level: data.evidenceCompletenessPercentage > 85 ? "HIGH" : data.evidenceCompletenessPercentage > 50 ? "MEDIUM" : "LOW",
          },
        },
      ],
    },
    {
      id: "risk_warnings",
      title: "Title & Legal Policy Risk Exclusions",
      elements: [
        {
          type: "TEXT",
          content: "Active risk checklist warnings which will be excluded from standard coverage or require policy riders:",
        },
        {
          type: "LIST",
          listItems: data.risks.length === 0
            ? [
                {
                  title: "Standard Coverage Approved",
                  description: "Zero title disputes or encumbrances flagged in property history.",
                  badge: { text: "APPROVED", variant: "SUCCESS" },
                },
              ]
            : data.risks.map((r) => ({
                title: r.message,
                description: `Underwriting Exclusion: ${r.type}. Excluded from standard title indemnity.`,
                badge: { text: r.type, variant: r.type === "BLOCKER" ? "BLOCKER" : "WARNING" },
                references: r.supportingEvidence,
              })),
        },
      ],
    },
  ];
}
