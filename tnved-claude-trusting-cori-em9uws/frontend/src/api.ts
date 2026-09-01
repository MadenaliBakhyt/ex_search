import type { TnvedRecord, SearchResult } from "./types";

const BASE = "/api";

export async function getByCode(code: string): Promise<TnvedRecord> {
  const res = await fetch(`${BASE}/code/${encodeURIComponent(code)}`);
  if (res.status === 404) {
    throw new Error("NOT_FOUND");
  }
  if (!res.ok) {
    throw new Error("SERVER_ERROR");
  }
  return res.json();
}

export async function searchByName(query: string): Promise<SearchResult[]> {
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error("SERVER_ERROR");
  }
  return res.json();
}
