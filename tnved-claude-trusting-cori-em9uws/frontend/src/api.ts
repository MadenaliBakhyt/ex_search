import type { TnvedRecord, SearchResult } from "./types";

// Relative by default -- correct when something on the same origin proxies
// /api to the backend (nginx in the Docker setup, Vite's dev proxy in
// `npm run dev`). Set VITE_API_URL at build time (e.g.
// http://<server>:8003/api) when serving the built frontend standalone,
// with no proxy in front of it.
const BASE = import.meta.env.VITE_API_URL || "/api";

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
