import { MappedReportData, ReportSection } from "../types";
import { compileExecutiveTemplate } from "./executive";
import { compileLegalTemplate } from "./legal";
import { compileBankTemplate } from "./bank";
import { compileInsuranceTemplate } from "./insurance";
import { compileInternalTemplate } from "./internal";

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  compileSections(data: MappedReportData): ReportSection[];
}

export const TEMPLATES: Record<string, ReportTemplate> = {
  executive: {
    id: "executive",
    name: "Executive Summary Report",
    description: "High-level visual summary optimized for decision makers and investors.",
    compileSections: compileExecutiveTemplate,
  },
  legal: {
    id: "legal",
    name: "Legal Due Diligence Report",
    description: "Detailed ownership timeline and RERA registration clearance.",
    compileSections: compileLegalTemplate,
  },
  bank: {
    id: "bank",
    name: "Bank Mortgage Evaluation",
    description: "Structured risk matrix for financial underwriting and compliance checks.",
    compileSections: compileBankTemplate,
  },
  insurance: {
    id: "insurance",
    name: "Insurance Risk Assessment",
    description: "Focuses on potential blockers, completeness scores, and warnings.",
    compileSections: compileInsuranceTemplate,
  },
  internal: {
    id: "internal",
    name: "Internal Peer Review Log",
    description: "Comprehensive registry check with raw notes and checklists.",
    compileSections: compileInternalTemplate,
  },
};

export function getTemplate(templateId: string): ReportTemplate {
  const normalized = templateId.toLowerCase();
  const template = TEMPLATES[normalized];
  if (!template) {
    throw new Error(`Report Template "${templateId}" not supported.`);
  }
  return template;
}
