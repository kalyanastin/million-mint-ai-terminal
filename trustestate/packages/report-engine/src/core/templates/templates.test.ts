import { describe, it, expect } from "vitest";
import { compileExecutiveTemplate } from "./executive";
import { compileLegalTemplate } from "./legal";
import { compileBankTemplate } from "./bank";
import { compileInsuranceTemplate } from "./insurance";
import { compileInternalTemplate } from "./internal";
import { MappedReportData } from "../types";

// Mock data to pass into section compilers
const mockMappedData: MappedReportData = {
  propertyId: "prop_123",
  address: "123 Green Valley, Bangalore",
  surveyNumber: "SURV-999",
  propertyType: "RESIDENTIAL",
  area: "2,400 sq ft",
  coordinates: "12.971598, 77.594562",
  districtState: "Bangalore Urban, Karnataka",
  cityPincode: "Bangalore — 560001",
  confidence: {
    overall: "HIGH",
    percentage: 92,
  },
  evidenceCompletenessPercentage: 90,
  timelineCompletenessPercentage: 80,
  reviewStatus: "APPROVED (2 peer signatures)",
  evidence: [
    {
      id: "ev_1",
      source: "TITLE_DEED",
      tier: "PRIMARY",
      verificationStatus: "VERIFIED",
      confidence: "HIGH",
      fileName: "sale_deed.pdf",
      version: 1,
    },
  ],
  timeline: [
    {
      id: "hist_1",
      date: "Jan 15, 2018",
      title: "Registered Sale Deed",
      description: "Transfer from Builder to Owner",
      category: "SALE_DEED",
      source: "Government Registry Office",
      confidence: "HIGH",
    },
  ],
  risks: [
    {
      type: "WARNING",
      message: "Minor boundary survey mismatch detected in Tax records.",
      supportingEvidence: ["TAX_RECORD"],
    },
  ],
  recommendations: ["Obtain latest municipal tax receipt to verify boundaries."],
  reviews: [
    {
      id: "rev_1",
      reviewerName: "John Doe",
      status: "APPROVED",
      notes: "Documents checked and aligned.",
      completedAt: "Jun 30, 2026",
    },
  ],
};

describe("Report Section Compilers", () => {
  it("compiles the Executive Summary Template correctly", () => {
    const sections = compileExecutiveTemplate(mockMappedData);

    expect(sections).toHaveLength(4);
    expect(sections[0]!.title).toBe("Executive Clearance Overview");
    expect(sections[1]!.title).toBe("Operational Confidence & Completeness Check");
    expect(sections[2]!.title).toBe("Active Risks & Discrepancies Register");
    expect(sections[3]!.title).toBe("Strategic Advisory Actions");

    // Check overview key-values
    const overviewKV = sections[0]!.elements.find((e) => e.type === "KEY_VALUE");
    expect(overviewKV).toBeDefined();
    expect(overviewKV!.keyValues).toContainEqual({ key: "Asset Address", value: mockMappedData.address });

    // Check confidence meter overall mapping
    const confidenceMeterSec = sections[1]!.elements.find((e) => e.type === "CONFIDENCE_METER");
    expect(confidenceMeterSec).toBeDefined();
    expect(confidenceMeterSec!.confidenceMeter!.percentage).toBe(92);
    expect(confidenceMeterSec!.confidenceMeter!.level).toBe("HIGH");

    // Check risks list mapping
    const risksListSec = sections[2]!.elements.find((e) => e.type === "LIST");
    expect(risksListSec).toBeDefined();
    expect(risksListSec!.listItems![0]!.title).toContain("boundary survey mismatch");
    expect(risksListSec!.listItems![0]!.references).toEqual(["TAX_RECORD"]);
  });

  it("compiles the Legal Due Diligence Template correctly", () => {
    const sections = compileLegalTemplate(mockMappedData);

    expect(sections).toHaveLength(4);
    expect(sections[0]!.title).toBe("Property Registry & Spatial Parameters");
    expect(sections[1]!.title).toBe("Documentary Evidence Register");
    expect(sections[2]!.title).toBe("Chronological Ownership Timeline");
    expect(sections[3]!.title).toBe("Legal Audit Exceptions & Risks");

    // Check coordinates mono formatting
    const spatialKV = sections[0]!.elements.find((e) => e.type === "KEY_VALUE");
    expect(spatialKV).toBeDefined();
    expect(spatialKV!.keyValues).toContainEqual({
      key: "GPS Coordinates",
      value: mockMappedData.coordinates,
      isMono: true,
    });

    // Check evidence list items
    const evidenceList = sections[1]!.elements.find((e) => e.type === "LIST");
    expect(evidenceList).toBeDefined();
    expect(evidenceList!.listItems).toHaveLength(1);
    expect(evidenceList!.listItems![0]!.title).toContain("TITLE DEED");

    // Check timeline list items
    const timelineList = sections[2]!.elements.find((e) => e.type === "LIST");
    expect(timelineList).toBeDefined();
    expect(timelineList!.listItems![0]!.title).toBe("Jan 15, 2018 — Registered Sale Deed");
  });

  it("compiles the Bank Mortgage Evaluation Template correctly", () => {
    const sections = compileBankTemplate(mockMappedData);

    expect(sections).toHaveLength(4);
    expect(sections[0]!.title).toBe("Mortgage Collateral & Asset Details");
    expect(sections[1]!.title).toBe("Operational Compliance Checks");
    expect(sections[2]!.title).toBe("Collateral Risk Audit Register");
    expect(sections[3]!.title).toBe("Underwriting Conditions & Recommendations");

    const checksMeter = sections[1]!.elements.find((e) => e.type === "CONFIDENCE_METER");
    expect(checksMeter).toBeDefined();
    expect(checksMeter!.confidenceMeter!.label).toBe("Credit Risk Confidence");
  });

  it("compiles the Insurance Risk Assessment Template correctly", () => {
    const sections = compileInsuranceTemplate(mockMappedData);

    expect(sections).toHaveLength(3);
    expect(sections[0]!.title).toBe("Underwriting Risk Assessment & Profile");
    expect(sections[1]!.title).toBe("Title & Documentation Completeness Score");
    expect(sections[2]!.title).toBe("Title & Legal Policy Risk Exclusions");
  });

  it("compiles the Internal Peer Review Template correctly", () => {
    const sections = compileInternalTemplate(mockMappedData);

    expect(sections).toHaveLength(3);
    expect(sections[0]!.title).toBe("Audit & Task Checklist Checklist");
    expect(sections[1]!.title).toBe("Evidence & Verification Pipeline Details");
    expect(sections[2]!.title).toBe("Double-Peer Review Logs");

    // Check reviews logging
    const reviewsList = sections[2]!.elements.find((e) => e.type === "LIST");
    expect(reviewsList).toBeDefined();
    expect(reviewsList!.listItems![0]!.title).toBe("Reviewer: John Doe");
  });
});
