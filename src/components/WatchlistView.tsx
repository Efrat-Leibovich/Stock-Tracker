import React, { useState, useEffect, useCallback } from 'react';
import type { IStockService, IWatchlistStore, StockQuote } from '../types';
import { StockCard } from './StockCard';

interface WatchlistViewProps {
  stockService: IStockService;
  watchlistStore: IWatchlistStore;
  onSelectStock: (ticker: string) => void;
}

const REFRESH_INTERVAL_MS = 60_000;

/**
 * תצוגת רשימת המעקב — מציגה את כל המניות עם מחיר ושינוי יומי.
 * רענון אוטומטי כל 60 שניות.
 * Requirements: 4.1, 4.2, 4.5
 */
export function WatchlistView({ stockService, watchlistStore, onSelectStock }: WatchlistViewProps) {
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const tickers = watchlistStore.getWatchlist();

  const fetchQuotes = useCallback(async () => {
    if (tickers.length === 0) return;
    setIsLoading(true);
    const results = await Promise.all(tickers.map(t => stockService.getQuote(t)));
    const loaded: StockQuote[] = [];
    results.forEach(r => { if (r.ok) loaded.push(r.data); });
    setQuotes(loaded);
    setIsLoading(false);
  }, [tickers.join(','), stockService]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(fetchQuotes, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchQuotes]);

  const isEmpty = tickers.length === 0;

  return (
    <div className="watchlist-view" style={{ direction: 'rtl' }}>
      {/* Requirement 4.5: brief explanation at the top */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ margin: '0 0 6px' }}>רשימת המעקב שלי 📋</h2>
        <p style={{ color: '#555', margin: 0, fontSize: '0.9rem' }}>
          כאן תוכל לראות את המניות שבחרת לעקוב אחריהן. המחירים מתעדכנים אוטומטית כל דקה.
        </p>
      </div>

      {/* Requirement 4.2: empty state */}
      {isEmpty && (
        <div
          className="watchlist-empty"
          style={{
            background: '#f9f9f9',
            border: '1px dashed #ccc',
            borderRadius: '8px',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>רשימת המעקב שלך ריקה 🌱</p>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            <strong>רשימת מעקב</strong> היא רשימה אישית של מניות שמעניינות אותך.
            כדי להוסיף מניה — חפש אותה בשורת החיפוש ולחץ על "הוסף לרשימה".
          </p>
        </div>
      )}

      {isLoading && !isEmpty && (
        <p style={{ color: '#666' }}>טוען נתונים...</p>
      )}

      {/* Requirement 4.1: show all watched stocks */}
      {!isEmpty && !isLoading && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {quotes.map(q => (
            <li key={q.ticker}>
              <StockCard quote={q} onClick={() => onSelectStock(q.ticker)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
