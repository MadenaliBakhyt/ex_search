export interface TnvedRecord {
  code: string;
  name: string;
  tariff: string | null;
  details: string | null;
  documents: string[];
}

export interface SearchResult {
  code: string;
  name: string;
}
