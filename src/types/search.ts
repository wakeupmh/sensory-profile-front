// Types for GET /api/search?q= — free-text search across children, daily
// logs, and documents.

export interface SearchChildResult {
  id: string;
  name: string;
}

export interface SearchLogResult {
  id: string;
  childId: string;
  childName: string;
  logType: string;
  occurredAt: string;
  notesSnippet: string;
}

export interface SearchDocumentResult {
  id: string;
  childId: string;
  childName: string;
  title: string;
  createdAt: string;
}

export interface SearchResults {
  children: SearchChildResult[];
  logs: SearchLogResult[];
  documents: SearchDocumentResult[];
}
