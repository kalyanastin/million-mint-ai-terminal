import { MappedReportData, ReportSection } from "../types";

export function compileBankTemplate(data: MappedReportData): ReportSection[] {
  return [
    {
      id: "collateral_summary",
      title: "Mortgage Collateral & Asset Details",
      elements: [
        {
          type: "TEXT",
          content: "Asset verification summary prepared specifically for credit underwriting and collateral validation guidelines.",
        },
        {
          type: "KEY_VALUE",
          keyValues: [
            { key: "Underwriting Reference", value: data.propertyId, isMono: true },
            { key: "Physical Address", value: data.address },
            { key: "Survey / Plot", value: data.surveyNumber, isMono: true },
            { key: "Super Built-up Area", value: data.area },
            { key: "District / City", value: `${data.districtState} (${data.cityPincode})` },
          ],
        },
      ],
    },
    {
      id: "compliance_checks",
      title: "Operational Compliance Checks",
      elements: [
        {
          type: "CONFIDENCE_METER",
          confidenceMeter: {
            label: "Credit Risk Confidence",
            percentage: data.confidence.percentage,
            level: data.confidence.overall,
            details: "Measures overall audit confidence. Values below HIGH require credit committee escalation.",
          },
        },
        {
          type: "CONFIDENCE_METER",
          confidenceMeter: {
            label: "Collateral Document Completeness",
            percentage: data.evidenceCompletenessPercentage,
            level: data.evidenceCompletenessPercentage > 80 ? "HIGH" : data.evidenceCompletenessPercentage > 50 ? "MEDIUM" : "LOW",
          },
        },
        {
          type: "KEY_VALUE",
          keyValues: [
            { key: "Dual peer signature review check", value: data.reviewStatus },
          ],
        },
      ],
    },
    {
      id: "underwriting_risks",
      title: "Collateral Risk Audit Register",
      elements: [
        {
          type: "TEXT",
          content: "Active legal, regulatory, or spatial blockers detected during verification audit checklist run:",
        },
        {
          type: "LIST",
          listItems: data.risks.length === 0
            ? [
                {
                  title: "Standard Collateral Clearance Approved",
                  description: "No RERA litigations or title encumbrances flagged. Asset clear for lending consideration.",
                  badge: { text: "APPROVED", variant: "SUCCESS" },
                },
              ]
            : data.risks.map((r) => ({
                title: r.message,
                description: `Underwriting Warning: ${r.type}. Mitigations required before loan approval.`,
                badge: { text: r.type, variant: r.type === "BLOCKER" ? "BLOCKER" : "WARNING" },
                references: r.supportingEvidence,
              })),
        },
      ],
    },
    {
      id: "underwriting_rec",
      title: "Underwriting Conditions & Recommendations",
      elements: [
        {
          type: "LIST",
          listItems: data.recommendations.length === 0
            ? [
                {
                  title: "Proceed with mortgage registration",
                  description: "Standard title deed documentation required.",
                  badge: { text: "RECOMMENDED", variant: "SUCCESS" },
                },
              ]
            : data.recommendations.map((rec) => ({
                title: rec,
                badge: { text: "CONDITION", variant: "INFO" },
              })),
        },
      ],
    },
  ];
}
