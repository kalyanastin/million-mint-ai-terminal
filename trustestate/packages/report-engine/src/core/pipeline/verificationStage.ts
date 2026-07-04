import * as crypto from "crypto";
import { PipelineContext, ReportPage, ReportSection } from "../types";

export function verifyReportStage(context: PipelineContext): PipelineContext {
  const { pageModel, snapshot, mappedData, identityVersion, schemaVersion } = context;

  if (!pageModel || !mappedData) {
    throw new Error(
      "Report Engine Verification Error: Missing page model or mapped data in context."
    );
  }

  // 1. Calculate deterministic report hash based on snapshot + report parameters
  const payloadString = JSON.stringify({
    snapshot,
    reportNumber: pageModel.reportNumber,
    generatedBy: pageModel.manifest.generatedBy,
  });

  const hash = crypto.createHash("sha256").update(payloadString).digest("hex");
  const formattedHash = `0x${hash.toUpperCase()}`;

  // 2. Update pageModel and manifest hash
  pageModel.manifest.reportHash = formattedHash;
  pageModel.reportNumber = pageModel.reportNumber; // keep it consistent

  // 3. Compile the Verification Block Element
  const verificationElement = {
    type: "VERIFICATION_BLOCK" as const,
    verificationBlock: {
      reportNumber: pageModel.reportNumber,
      identityVersion: identityVersion || 1,
      generatedDate: pageModel.manifest.generatedAt,
      schemaVersion: schemaVersion || 1,
      reportVersion: pageModel.manifest.reportVersion,
      reportHash: formattedHash,
      qrReserved: true,
      signatureReserved: true,
    },
  };

  // Create a Verification Block section
  const verificationSection: ReportSection = {
    id: "verification_block_section",
    title: "Report Verification & Digital Seals",
    elements: [
      {
        type: "TEXT" as const,
        content: "This document is a certified export of the TrustEstate Property Identity chain. The cryptographic hash below seals the authenticity of this version and can be validated against the network registry.",
      },
      verificationElement,
    ],
  };

  // Add Verification Block to the last page or append as a new page
  const verificationPageNum = pageModel.pages.length + 1;
  const verificationPage: ReportPage = {
    pageNumber: verificationPageNum,
    header: {
      left: "TRUSTESTATE REPORT VERIFICATION BLOCK",
      right: `REF: ${pageModel.reportNumber}`,
    },
    footer: {
      left: "SECURED PROPERTY LEDGER ENTRY",
      right: `Page ${verificationPageNum}`,
    },
    sections: [verificationSection],
  };

  pageModel.pages.push(verificationPage);

  // Update manifest sections list
  pageModel.manifest.sections.push(verificationSection.title);

  return {
    ...context,
    reportHash: formattedHash,
    pageModel,
  };
}
