import { PipelineContext, MappedReportData } from "../types";

export function mapSnapshotStage(context: PipelineContext): PipelineContext {
  const { snapshot } = context;

  // 1. Calculate Confidence Percentage
  let confidencePct = 0;
  const rawConfidence = snapshot.confidence || "NONE";
  if (rawConfidence === "HIGH") confidencePct = 92;
  else if (rawConfidence === "MEDIUM") confidencePct = 74;
  else if (rawConfidence === "LOW") confidencePct = 45;
  else confidencePct = 15;

  // 2. Calculate Evidence Completeness
  // Check validation capabilities
  let evidenceCompleteness = 100;
  const capability = snapshot.capabilities[0];
  if (capability) {
    const blockersCount = capability.blockers?.length || 0;
    const warningsCount = capability.warnings?.length || 0;
    evidenceCompleteness = Math.max(
      20,
      100 - blockersCount * 25 - warningsCount * 10
    );
  }

  // 3. Calculate Timeline Completeness
  // Standard title history should ideally span multiple events (e.g. at least 3 events for high completeness)
  const eventCount = snapshot.history?.length || 0;
  const timelineCompleteness = Math.min(100, Math.max(30, eventCount * 25));

  // 4. Map Review Status
  const activeReviews = snapshot.reviews || [];
  const approvedCount = activeReviews.filter((r) => r.status === "APPROVED").length;
  const reviewStatus =
    approvedCount > 0
      ? `APPROVED (${approvedCount} peer signatures)`
      : activeReviews.length > 0
      ? "UNDER_REVIEW"
      : "PENDING_REVIEW";

  // 5. Heuristic Risk-to-Evidence Association
  const mappedRisks = (snapshot.risks || []).map((risk) => {
    const matchedEvidenceIds: string[] = [];
    const msgLower = risk.message.toLowerCase();

    // Map evidence sources
    snapshot.evidence.forEach((ev) => {
      const srcName = ev.source.toLowerCase().replace(/_/g, " ");
      const fileName = ev.originalFileName.toLowerCase();

      // Check keywords
      if (
        msgLower.includes(srcName) ||
        (msgLower.includes("deed") && srcName.includes("title deed")) ||
        (msgLower.includes("tax") && srcName.includes("tax")) ||
        (msgLower.includes("survey") && srcName.includes("survey")) ||
        (msgLower.includes("encumbrance") && srcName.includes("encumbrance")) ||
        (msgLower.includes("rera") && srcName.includes("rera")) ||
        fileName.includes(srcName.split(" ")[0] || "---")
      ) {
        matchedEvidenceIds.push(ev.source); // Source identifier (e.g. TITLE_DEED)
      }
    });

    // Fallback: If no specific document mapped, map to the primary verified documents as a general reference
    if (matchedEvidenceIds.length === 0 && snapshot.evidence.length > 0) {
      const primaryEvs = snapshot.evidence
        .filter((e) => e.tier === "PRIMARY")
        .map((e) => e.source);
      matchedEvidenceIds.push(...primaryEvs);
    }

    return {
      type: risk.type,
      message: risk.message,
      supportingEvidence: Array.from(new Set(matchedEvidenceIds)),
    };
  });

  const mappedData: MappedReportData = {
    propertyId: snapshot.propertyId,
    address: snapshot.address,
    surveyNumber: snapshot.surveyNumber || "NOT_PROVIDED",
    propertyType: snapshot.propertyType || "UNDEFINED",
    area: snapshot.areaInSqFt ? `${snapshot.areaInSqFt.toLocaleString()} sq ft` : "N/A",
    coordinates:
      snapshot.latitude && snapshot.longitude
        ? `${snapshot.latitude.toFixed(6)}, ${snapshot.longitude.toFixed(6)}`
        : "N/A",
    districtState: [snapshot.district, snapshot.state].filter(Boolean).join(", ") || "N/A",
    cityPincode: [snapshot.city, snapshot.pincode].filter(Boolean).join(" — ") || "N/A",
    confidence: {
      overall: rawConfidence as any,
      percentage: confidencePct,
    },
    evidenceCompletenessPercentage: evidenceCompleteness,
    timelineCompletenessPercentage: timelineCompleteness,
    reviewStatus,
    evidence: (snapshot.evidence || []).map((ev) => ({
      id: ev.id,
      source: ev.source,
      tier: ev.tier,
      verificationStatus: ev.verificationStatus,
      confidence: ev.confidence,
      fileName: ev.originalFileName,
      version: ev.version,
    })),
    timeline: (snapshot.history || []).map((h) => ({
      id: h.id,
      date: new Date(h.occurredOn).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      title: h.title,
      description: h.description || "",
      category: h.category,
      source: h.source,
      confidence: h.confidence,
    })),
    risks: mappedRisks,
    recommendations: (snapshot.recommendations || []).map((r) => r.message),
    reviews: (snapshot.reviews || []).map((r) => ({
      id: r.id,
      reviewerName: r.reviewerName,
      status: r.status,
      notes: r.notes || "",
      completedAt: r.completedAt
        ? new Date(r.completedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "Pending",
    })),
  };

  return {
    ...context,
    mappedData,
  };
}
