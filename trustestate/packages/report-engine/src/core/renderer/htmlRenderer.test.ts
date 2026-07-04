import { describe, it, expect } from "vitest";
import { validatePageModel, validatePageModelOrThrow } from "../validator/pageValidator";
import { renderPageModelToHtml } from "./htmlRenderer";
import { PageModel } from "../types";

// Mock PageModel for tests
const mockValidPageModel: PageModel = {
  reportNumber: "REP-987654",
  title: "Property Clearance Identity Report",
  subtitle: "123 Green Valley, Bangalore",
  manifest: {
    identityVersion: 1,
    schemaVersion: 1,
    reportVersion: "1.0",
    generatedAt: "2026-07-04T12:00:00Z",
    generatedBy: "System Operator",
    reportNumber: "REP-987654",
    reportHash: "0xHASH-ABC-123",
    sections: ["Executive Summary", "Report Verification & Digital Seals"],
  },
  pages: [
    {
      pageNumber: 1,
      header: { left: "TRUSTESTATE PROFILE", right: "V1" },
      footer: { left: "CONFIDENTIAL", right: "Page 1" },
      sections: [
        {
          id: "exec_sec",
          title: "Executive Summary",
          elements: [
            {
              type: "TEXT",
              content: "This property clear audit has passed validation.",
            },
            {
              type: "CONFIDENCE_METER",
              confidenceMeter: {
                label: "Audit Confidence",
                percentage: 95,
                level: "HIGH",
                details: "No blockers logged.",
              },
            },
          ],
        },
      ],
    },
    {
      pageNumber: 2,
      header: { left: "VERIFICATION", right: "V1" },
      footer: { left: "CONFIDENTIAL", right: "Page 2" },
      sections: [
        {
          id: "verify_sec",
          title: "Report Verification & Digital Seals",
          elements: [
            {
              type: "VERIFICATION_BLOCK",
              verificationBlock: {
                reportNumber: "REP-987654",
                identityVersion: 1,
                generatedDate: "2026-07-04T12:00:00Z",
                schemaVersion: 1,
                reportVersion: "1.0",
                reportHash: "0xHASH-ABC-123",
                qrReserved: true,
                signatureReserved: true,
              },
            },
          ],
        },
      ],
    },
  ],
};

describe("Page Model Validator", () => {
  it("passes validation for a fully structured PageModel", () => {
    const errors = validatePageModel(mockValidPageModel);
    expect(errors).toHaveLength(0);
    expect(() => validatePageModelOrThrow(mockValidPageModel)).not.toThrow();
  });

  it("fails and lists errors for a malformed PageModel", () => {
    const malformedModel: PageModel = {
      reportNumber: "", // Error: missing reportNumber
      title: "Title only",
      manifest: {
        identityVersion: 0, // Error: version must be positive
        schemaVersion: 1,
        reportVersion: "1.0",
        generatedAt: "",
        generatedBy: "",
        reportNumber: "",
        reportHash: "", // Error: missing hash
        sections: [], // Error: sections list is empty
      },
      pages: [], // Error: missing pages (and thus missing verification block)
    };

    const errors = validatePageModel(malformedModel);
    expect(errors.length).toBeGreaterThan(0);

    const fieldsWithErrors = errors.map((e) => e.field);
    expect(fieldsWithErrors).toContain("reportNumber");
    expect(fieldsWithErrors).toContain("manifest.identityVersion");
    expect(fieldsWithErrors).toContain("manifest.reportHash");
    expect(fieldsWithErrors).toContain("manifest.sections");
    expect(fieldsWithErrors).toContain("pages");

    expect(() => validatePageModelOrThrow(malformedModel)).toThrow("Page Model Validation Failed:");
  });

  it("fails validation if there is no VERIFICATION_BLOCK element in the document", () => {
    const missingVerificationBlockModel: PageModel = {
      ...mockValidPageModel,
      pages: [
        {
          pageNumber: 1,
          sections: [
            {
              id: "test_sec",
              title: "Test Section",
              elements: [
                {
                  type: "TEXT",
                  content: "Valid text.",
                },
              ],
            },
          ],
        },
      ],
    };

    const errors = validatePageModel(missingVerificationBlockModel);
    expect(errors.length).toBe(1);
    expect(errors[0]!.message).toContain("missing a cryptographic Verification Block");
  });
});

describe("HTML Renderer", () => {
  it("renders a valid semantic HTML snapshot", () => {
    const html = renderPageModelToHtml(mockValidPageModel);

    // Assert semantic HTML presence
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html lang=\"en\">");
    expect(html).toContain("<style>");
    expect(html).toContain("@import url");
    
    // Header/Footer elements
    expect(html).toContain("<header class=\"page-header-block\">");
    expect(html).toContain("<footer class=\"page-footer-block\">");
    expect(html).toContain("<main class=\"page-content\">");
    expect(html).toContain("<section class=\"report-page\">");

    // Check specific rendered elements
    expect(html).toContain("This property clear audit has passed validation.");
    expect(html).toContain("REP-987654");
    expect(html).toContain("0xHASH-ABC-123");
    expect(html).toContain("QR VERIFICATION RESERVED");
    expect(html).toContain("Verified Autograph");
    
    // Check meter bar percentage and ASCII fallback
    expect(html).toContain("style=\"width: 95%;\"");
    expect(html).toContain("██████████"); // 95% rounds to 10 blocks (100%)
  });
});
