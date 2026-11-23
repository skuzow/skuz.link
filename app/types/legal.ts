import type { Component } from 'vue';

// a numbered section of a Legal document, "## 2. What I process and why"
export interface LegalSection {
  // two digits, as in its "/ 02" label
  number: string;
  // the heading without its number
  title: string;
  // the heading's anchor id
  id: string;
}

// one locale of a Legal document: its compiled Markdown and its sections
export interface LegalDocumentLocale {
  body: Component;
  sections: LegalSection[];
}
