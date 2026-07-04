import { PageModel } from "../types";

export interface ValidationError {
  field: string;
  message: string;
}

export function validatePageModel(model: PageModel): ValidationError[] {
  const errors: ValidationError[] = [];

  // 1. Root Metadata Checks
  if (!model.title || model.title.trim() === "") {
    errors.push({ field: "title", message: "Report title is missing or empty." });
  }

  if (!model.reportNumber || model.reportNumber.trim() === "") {
    errors.push({ field: "reportNumber", message: "Report number is missing or empty." });
  }

  if (!model.manifest) {
    errors.push({ field: "manifest", message: "Report manifest is missing." });
  } else {
    const { identityVersion, schemaVersion, reportHash, sections } = model.manifest;
    if (identityVersion <= 0) {
      errors.push({ field: "manifest.identityVersion", message: "Identity version must be positive." });
    }
    if (schemaVersion <= 0) {
      errors.push({ field: "manifest.schemaVersion", message: "Schema version must be positive." });
    }
    if (!reportHash || reportHash.trim() === "") {
      errors.push({ field: "manifest.reportHash", message: "Report verification hash is missing." });
    }
    if (!sections || sections.length === 0) {
      errors.push({ field: "manifest.sections", message: "Report sections listing is empty." });
    }
  }

  // 2. Page Integrity Checks
  if (!model.pages || model.pages.length === 0) {
    errors.push({ field: "pages", message: "Report model contains no pages." });
  } else {
    let hasVerificationBlock = false;
    let expectedPageNum = 1;

    model.pages.forEach((page, idx) => {
      // Page ordering validation
      if (page.pageNumber !== expectedPageNum) {
        errors.push({
          field: `pages[${idx}].pageNumber`,
          message: `Expected page number ${expectedPageNum}, found ${page.pageNumber}.`,
        });
      }
      expectedPageNum++;

      // Empty page check
      if (!page.sections || page.sections.length === 0) {
        errors.push({
          field: `pages[${idx}].sections`,
          message: `Page ${page.pageNumber} contains no sections.`,
        });
      } else {
        page.sections.forEach((section, sIdx) => {
          if (!section.title || section.title.trim() === "") {
            errors.push({
              field: `pages[${idx}].sections[${sIdx}].title`,
              message: `Section title is missing on page ${page.pageNumber}.`,
            });
          }

          if (!section.elements || section.elements.length === 0) {
            errors.push({
              field: `pages[${idx}].sections[${sIdx}].elements`,
              message: `Section "${section.title}" on page ${page.pageNumber} contains no content elements.`,
            });
          } else {
            section.elements.forEach((element, eIdx) => {
              if (element.type === "VERIFICATION_BLOCK") {
                hasVerificationBlock = true;
              }

              // Element contents validation
              if (element.type === "KEY_VALUE" && (!element.keyValues || element.keyValues.length === 0)) {
                errors.push({
                  field: `pages[${idx}].sections[${sIdx}].elements[${eIdx}]`,
                  message: `KEY_VALUE element in section "${section.title}" is empty.`,
                });
              }

              if (element.type === "LIST" && (!element.listItems || element.listItems.length === 0)) {
                errors.push({
                  field: `pages[${idx}].sections[${sIdx}].elements[${eIdx}]`,
                  message: `LIST element in section "${section.title}" is empty.`,
                });
              }

              if (element.type === "CONFIDENCE_METER" && !element.confidenceMeter) {
                errors.push({
                  field: `pages[${idx}].sections[${sIdx}].elements[${eIdx}]`,
                  message: `CONFIDENCE_METER element in section "${section.title}" is missing config payload.`,
                });
              }

              if (element.type === "VERIFICATION_BLOCK" && !element.verificationBlock) {
                errors.push({
                  field: `pages[${idx}].sections[${sIdx}].elements[${eIdx}]`,
                  message: `VERIFICATION_BLOCK element in section "${section.title}" is missing config payload.`,
                });
              }
            });
          }
        });
      }
    });

    if (!hasVerificationBlock) {
      errors.push({
        field: "pages",
        message: "Document is missing a cryptographic Verification Block.",
      });
    }
  }

  return errors;
}

export function validatePageModelOrThrow(model: PageModel): void {
  const errors = validatePageModel(model);
  if (errors.length > 0) {
    const errorDetails = errors.map((e) => `[${e.field}]: ${e.message}`).join("\n");
    throw new Error(`Page Model Validation Failed:\n${errorDetails}`);
  }
}
