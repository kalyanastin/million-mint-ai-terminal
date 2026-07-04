import { MappedReportData, ReportSection } from "../types";

export function compileLegalTemplate(data: MappedReportData): ReportSection[] {
  return [
    {
      id: "spatial_identity",
      title: "Property Registry & Spatial Parameters",
      elements: [
        {
          type: "KEY_VALUE",
          keyValues: [
            { key: "Government Registry ID", value: data.propertyId, isMono: true },
            { key: "Official Address", value: data.address },
            { key: "Survey / Plot Number", value: data.surveyNumber, isMono: true },
            { key: "Registered Area", value: data.area },
            { key: "GPS Coordinates", value: data.coordinates, isMono: true },
            { key: "City & Pincode", value: data.cityPincode },
            { key: "District & State", value: data.districtState },
          ],
        },
      ],
    },
    {
      id: "evidence_register",
      title: "Documentary Evidence Register",
      elements: [
        {
          type: "TEXT",
          content: "All supporting document blocks registered, verified, and audited during this investigation version are listed below.",
        },
        {
          type: "LIST",
          listItems: data.evidence.map((ev) => ({
            title: `${ev.source.replace(/_/g, " ")} (v${ev.version})`,
            description: `File: ${ev.fileName} | Verification: ${ev.verificationStatus} | Source: ${ev.tier}`,
            badge: {
              text: ev.confidence,
              variant: ev.verificationStatus === "VERIFIED" ? "SUCCESS" : "NEUTRAL",
            },
          })),
        },
      ],
    },
    {
      id: "title_chain",
      title: "Chronological Ownership Timeline",
      elements: [
        {
          type: "TEXT",
          content: "Historical registry transfers, partition deeds, court actions, and RERA filing updates tracked and compiled for this property identity version.",
        },
        {
          type: "LIST",
          listItems: data.timeline.length === 0
            ? [
                {
                  title: "No timeline events recorded",
                  description: "This property snapshot contains no historical events.",
                  badge: { text: "EMPTY", variant: "NEUTRAL" },
                },
              ]
            : data.timeline.map((item) => ({
                title: `${item.date} — ${item.title}`,
                description: `${item.description} (Category: ${item.category} | Source: ${item.source})`,
                badge: { text: item.confidence, variant: "NEUTRAL" },
              })),
        },
      ],
    },
    {
      id: "legal_compliance",
      title: "Legal Audit Exceptions & Risks",
      elements: [
        {
          type: "LIST",
          listItems: data.risks.length === 0
            ? [
                {
                  title: "Compliant Legal Chain",
                  description: "Title history and documents satisfy all standard operational clearance guidelines.",
                  badge: { text: "CLEARED", variant: "SUCCESS" },
                },
              ]
            : data.risks.map((r) => ({
                title: r.message,
                description: `Severity: ${r.type}. Risk identified in title verification.`,
                badge: { text: r.type, variant: r.type === "BLOCKER" ? "BLOCKER" : "WARNING" },
                references: r.supportingEvidence,
              })),
        },
      ],
    },
  ];
}
