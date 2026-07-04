import { CompiledPropertySnapshot } from "@trustestate/identity-engine";

export interface ReportManifest {
  identityVersion: number;
  schemaVersion: number;
  reportVersion: string;
  generatedAt: string;
  generatedBy: string;
  reportNumber: string;
  reportHash: string;
  sections: string[];
}

export type LayoutElementType =
  | "HEADER"
  | "TEXT"
  | "KEY_VALUE"
  | "LIST"
  | "CONFIDENCE_METER"
  | "EVIDENCE_REFERENCE"
  | "VERIFICATION_BLOCK"
  | "SECTION_DIVIDER"
  | "GRID";

export interface KeyValueItem {
  key: string;
  value: string;
  isMono?: boolean;
}

export interface ListLayoutItem {
  title?: string;
  description?: string;
  badge?: {
    text: string;
    variant: "INFO" | "WARNING" | "BLOCKER" | "SUCCESS" | "NEUTRAL";
  };
  references?: string[]; // IDs or names of evidence supporting this list item
}

export interface ConfidenceMeterItem {
  label: string;
  percentage: number;
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "NONE";
  details?: string;
}

export interface VerificationBlockItem {
  reportNumber: string;
  identityVersion: number;
  generatedDate: string;
  schemaVersion: number;
  reportVersion: string;
  reportHash: string;
  qrReserved: boolean;
  signatureReserved: boolean;
}

export interface GridItem {
  elements: LayoutElement[];
  colSpan?: number; // relative size
}

export interface LayoutElement {
  type: LayoutElementType;
  title?: string;
  content?: string; // for paragraphs/text
  keyValues?: KeyValueItem[];
  listItems?: ListLayoutItem[];
  confidenceMeter?: ConfidenceMeterItem;
  verificationBlock?: VerificationBlockItem;
  gridItems?: GridItem[];
  styles?: {
    isBold?: boolean;
    isItalic?: boolean;
    color?: string;
    fontSize?: "SM" | "MD" | "LG" | "XL";
    marginTop?: boolean;
    border?: boolean;
  };
}

export interface ReportSection {
  id: string;
  title: string;
  elements: LayoutElement[];
}

export interface ReportPage {
  pageNumber: number;
  header?: {
    left: string;
    right: string;
  };
  footer?: {
    left: string;
    right: string;
  };
  sections: ReportSection[];
}

export interface PageModel {
  reportNumber: string;
  title: string;
  subtitle?: string;
  manifest: ReportManifest;
  pages: ReportPage[];
}

// Stages Input/Output Types
export interface PipelineContext {
  snapshot: CompiledPropertySnapshot;
  templateId: string;
  generatedBy: string;
  identityVersion?: number;
  schemaVersion?: number;
  reportNumber?: string;
  reportHash?: string;
  mappedData?: MappedReportData;
  sections?: ReportSection[];
  pageModel?: PageModel;
  outputHtml?: string;
  outputManifest?: ReportManifest;
}

export interface MappedReportData {
  propertyId: string;
  address: string;
  surveyNumber: string;
  propertyType: string;
  area: string;
  coordinates: string;
  districtState: string;
  cityPincode: string;
  confidence: {
    overall: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "NONE";
    percentage: number;
  };
  evidenceCompletenessPercentage: number;
  timelineCompletenessPercentage: number;
  reviewStatus: string;
  evidence: Array<{
    id: string;
    source: string;
    tier: string;
    verificationStatus: string;
    confidence: string;
    fileName: string;
    version: number;
  }>;
  timeline: Array<{
    id: string;
    date: string;
    title: string;
    description: string;
    category: string;
    source: string;
    confidence: string;
  }>;
  risks: Array<{
    type: "BLOCKER" | "WARNING";
    message: string;
    supportingEvidence: string[]; // references matched by mapping stage
  }>;
  recommendations: string[];
  reviews: Array<{
    id: string;
    reviewerName: string;
    status: string;
    notes: string;
    completedAt: string;
  }>;
}
