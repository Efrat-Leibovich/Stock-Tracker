import React, { useState, useEffect, useRef } from 'react';
import type { IStockService, SearchResult } from '../types';

interface SearchBarProps {
  stockService: IStockService;
  onSelectStock: (ticker: string) => void;
}

/**
 * שדה חיפוש מניות עם debounce, הצגת תוצאות, validation ו-ticker tip.
 * Requirements: 1.1, 1.2, 1.3, 1.5
 */
export function SearchBar({ stockService, onSelectStock }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [validationError, setValidationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length === 0) {
      setResults([]);
      setNoResults(false);
      setValidationError('');
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setValidationError('');
      const result = await stockService.searchStocks(query);
      setIsLoading(false);

      if (!result.ok) {
        const err = (result as { ok: false; error: { code: string; message: string } }).error;
        if (err.code === 'INVALID_INPUT') {
          setValidationError('אנא הכנס שם חברה או סמל מניה תקין');
          setResults([]);
        } else {
          setValidationError(err.message);
          setResults([]);
        }
        setNoResults(false);
      } else {
        setResults(result.data);
        setNoResults(result.data.length === 0);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, stockService]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length === 0) {
      setValidationError('אנא הכנס שם חברה או סמל מניה');
    }
  }

  const showResults = results.length > 0;

  return (
    <div className="search-bar" style={{ direction: 'rtl' }}>
      <form onSubmit={handleSubmit} role="search">
        <label htmlFor="stock-search" style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
          חפש מניה
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            id="stock-search"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="לדוגמה: Apple או AAPL"
            aria-label="חיפוש מניה"
            aria-describedby={validationError ? 'search-error' : undefined}
            style={{ flex: 1, padding: '8px 12px', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
            חפש
          </button>
        </div>
      </form>

      {validationError && (
        <p id="search-error" role="alert" className="search-validation-error" style={{ color: '#c62828', marginTop: '6px' }}>
          {validationError}
        </p>
      )}

      {isLoading && <p style={{ marginTop: '8px', color: '#666' }}>מחפש...</p>}

      {noResults && !isLoading && (
        <p style={{ marginTop: '8px', color: '#666' }}>לא נמצאו תוצאות עבור "{query}"</p>
      )}

      {showResults && (
        <div className="search-results" style={{ marginTop: '8px' }}>
          {/* Requirement 1.5: ticker tip when results are shown */}
          <p className="ticker-tip" style={{ fontSize: '0.85rem', color: '#555', marginBottom: '8px', background: '#f5f5f5', padding: '6px 10px', borderRadius: '4px' }}>
            💡 <strong>מה זה Ticker?</strong> זהו הקוד הקצר שמזהה חברה בבורסה — לדוגמה AAPL = Apple, TSLA = Tesla
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, border: '1px solid #e0e0e0', borderRadius: '4px' }}>
            {results.map(r => (
              <li key={r.ticker}>
                <button
                  onClick={() => onSelectStock(r.ticker)}
                  style={{
                    width: '100%',
                    textAlign: 'right',
                    padding: '10px 14px',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ color: '#666', fontSize: '0.9rem' }}>{r.companyName}</span>
                  <span style={{ fontWeight: 'bold' }}>{r.ticker}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
