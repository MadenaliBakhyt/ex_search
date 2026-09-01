import { useState, type FormEvent } from "react";
import { getByCode, searchByName } from "./api";
import type { TnvedRecord, SearchResult } from "./types";

// By default, points at the same host this page was opened from, on the
// standard EXIM Search port (8080) -- so it works whether opened via
// localhost, the server's IP, or a domain. Override with VITE_HUB_URL at
// build time if EXIM Search lives on a different host/port.
const HUB_URL =
  import.meta.env.VITE_HUB_URL ||
  `${window.location.protocol}//${window.location.hostname}:8080`;

function App() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<TnvedRecord | null>(null);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"code" | "search">("code");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setRecord(null);
    setSuggestions([]);

    try {
      if (mode === "code") {
        const result = await getByCode(q);
        setRecord(result);
      } else {
        const results = await searchByName(q);
        setSuggestions(results);
      }
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") {
        setError("Код не найден");
      } else {
        setError("Ошибка сервера");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = async (code: string) => {
    setQuery(code);
    setMode("code");
    setLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const result = await getByCode(code);
      setRecord(result);
    } catch {
      setError("Код не найден");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <a
            href={HUB_URL}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors mb-6"
          >
            ← EXIM Search
          </a>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ТН ВЭД</h1>
          <p className="text-gray-500">Поиск по товарной номенклатуре</p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setMode("code")}
              className={`px-4 py-1.5 text-sm rounded-md border transition-colors ${
                mode === "code"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
              }`}
            >
              По коду
            </button>
            <button
              type="button"
              onClick={() => setMode("search")}
              className={`px-4 py-1.5 text-sm rounded-md border transition-colors ${
                mode === "search"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
              }`}
            >
              По наименованию
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                mode === "code"
                  ? "Введите код, например 0101210000"
                  : "Введите наименование"
              }
              className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-lg"
            >
              Найти
            </button>
          </div>
        </form>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">{error}</p>
          </div>
        )}

        {record && <RecordCard record={record} />}

        {suggestions.length > 0 && (
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
            {suggestions.map((s) => (
              <button
                key={s.code}
                onClick={() => handleSelectSuggestion(s.code)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <span className="font-mono text-red-600 mr-3">{s.code}</span>
                <span className="text-gray-700">{s.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RecordCard({ record }: { record: TnvedRecord }) {
  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="mb-4">
        <span className="text-sm text-gray-500">Код</span>
        <p className="text-2xl font-mono font-bold text-gray-900">
          {record.code}
        </p>
      </div>

      <div className="mb-4">
        <span className="text-sm text-gray-500">Наименование</span>
        <p className="text-lg text-gray-900">{record.name}</p>
      </div>

      {record.tariff && (
        <div className="mb-4">
          <span className="text-sm text-gray-500">Тариф</span>
          <p className="text-lg text-gray-900">{record.tariff}</p>
        </div>
      )}

      {record.details && (
        <div className="mb-4">
          <span className="text-sm text-gray-500">Подробности</span>
          <p className="text-gray-700">{record.details}</p>
        </div>
      )}

      <div>
        <span className="text-sm text-gray-500 block mb-2">Документы</span>
        {record.documents.length > 0 ? (
          <div className="space-y-2">
            {record.documents.map((doc, i) => (
              <div
                key={i}
                className="px-4 py-2.5 border border-gray-200 rounded-md text-gray-700"
              >
                {doc}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Документы отсутствуют</p>
        )}
      </div>
    </div>
  );
}

export default App;
