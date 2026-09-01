import type { TnvedRecord, SearchResult } from "./types";

// import.meta.env.VITE_API_URL, if set at build time, wins. Otherwise: if
// this page was itself loaded from "/api/..." reachability (something on
// the same origin proxying it -- nginx in the Docker setup, Vite's dev
// proxy in `npm run dev`) that's handled by the relative fallback. When
// served standalone with nothing proxying /api, fall back to the backend's
// well-known port on the same host at runtime -- this works without any
// build-time configuration at all.
const BASE =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:8003/api`;

// no-store: some browsers can serve a 304 straight to fetch() for a
// previously-cached URL, which fetch() treats as a failed (non-2xx)
// response even though the data is valid -- always get a fresh response.
const FETCH_OPTS: RequestInit = { cache: "no-store" };

export async function getByCode(code: string): Promise<TnvedRecord> {
  const res = await fetch(`${BASE}/code/${encodeURIComponent(code)}`, FETCH_OPTS);
  if (res.status === 404) {
    throw new Error("NOT_FOUND");
  }
  if (!res.ok) {
    throw new Error("SERVER_ERROR");
  }
  return res.json();
}

export async function searchByName(query: string): Promise<SearchResult[]> {
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}`, FETCH_OPTS);
  if (!res.ok) {
    throw new Error("SERVER_ERROR");
  }
  return res.json();
}
