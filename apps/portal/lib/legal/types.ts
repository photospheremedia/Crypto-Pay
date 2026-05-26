export type LegalInlineLink = {
  match: string;
  href: string;
};

export type LegalParagraph = string | { text: string; links?: LegalInlineLink[] };

export type LegalSubsection = {
  title: string;
  paragraphs?: LegalParagraph[];
  list?: string[];
};

export type LegalSection = {
  id?: string;
  title: string;
  paragraphs?: LegalParagraph[];
  list?: string[];
  subsections?: LegalSubsection[];
};

export const LEGAL_LAST_UPDATED = "May 26, 2026";
export const LEGAL_EFFECTIVE_DATE = "May 26, 2026";
