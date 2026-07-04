import { MappedReportData, ReportSection } from "../types";

export function compileInternalTemplate(data: MappedReportData): ReportSection[] {
  return [
    {
      id: "operational_audit",
      title: "Audit & Task Checklist Checklist",
      elements: [
        {
          type: "TEXT",
          content: "Internal operational report tracking task completions, evidence checks, and verification workflow.",
        },
        {
          type: "KEY_VALUE",
          keyValues: [
            { key: "Property Record ID", value: data.propertyId, isMono: true },
            { key: "Target Address", value: data.address },
            { key: "Confidence Score", value: `${data.confidence.percentage}% (${data.confidence.overall})` },
            { key: "Evidence Score", value: `${data.evidenceCompletenessPercentage}%` },
            { key: "Timeline Score", value: `${data.timelineCompletenessPercentage}%` },
          ],
        },
      ],
    },
    {
      id: "verification_pipeline",
      title: "Evidence & Verification Pipeline Details",
      elements: [
        {
          type: "LIST",
          listItems: data.evidence.map((ev) => ({
            title: `${ev.source} (File: ${ev.fileName})`,
            description: `Tier: ${ev.tier} | Version: ${ev.version} | Status: ${ev.verificationStatus}`,
            badge: { text: ev.confidence, variant: "NEUTRAL" },
          })),
        },
      ],
    },
    {
      id: "peer_reviews",
      title: "Double-Peer Review Logs",
      elements: [
        {
          type: "TEXT",
          content: "Audit trail of reviewer signatures and peer notes compiled during review approval steps:",
        },
        {
          type: "LIST",
          listItems: data.reviews.length === 0
            ? [
                {
                  title: "No peer review signatures registered",
                  description: "This version was compiled without review logs.",
                  badge: { text: "NO SIGNATURES", variant: "WARNING" },
                },
              ]
            : data.reviews.map((r) => ({
                title: `Reviewer: ${r.reviewerName}`,
                description: `Date: ${r.completedAt} | Notes: ${r.notes || "No notes provided."}`,
                badge: { text: r.status, variant: r.status === "APPROVED" ? "SUCCESS" : "NEUTRAL" },
              })),
        },
      ],
    },
  ];
}
