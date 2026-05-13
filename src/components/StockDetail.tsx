import React, { useState, useEffect } from 'react';
import type { IStockService, IWatchlistStore, StockQuote } from '../types';
import { MetricWithTooltip, METRIC_TOOLTIPS } from './MetricWithTooltip';
import { PerformanceSummary } from './PerformanceSummary';

interface StockDetailProps {
  ticker: string;
  stockService: IStockService;
  watchlistStore: IWatchlistStore;
}

/**
 * תצוגת פרטי מניה מלאים.
 * Requirements: 2.1, 2.2, 2.3, 2.6, 2.7, 3.6, 6.3
 */
export function StockDetail({ ticker, stockService, watchlistStore }: StockDetailProps) {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [inWatchlist, setInWatchlist] = useState(watchlistStore.hasTicker(ticker));
  const [showCongrats, setShowCongrats] = useState(false);

  async function loadQuote() {
    setIsLoading(true);
    setError('');
    const result = await stockService.getQuote(ticker);
    setIsLoading(false);
    if (result.ok) {
      setQuote(result.data);
    } else {
      const failed = result as { ok: false; error: { message: string } };
      setError(failed.error.message);
    }
  }

  useEffect(() => {
    loadQuote();
  }, [ticker]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleWatchlistToggle() {
    if (inWatchlist) {
      watchlistStore.removeTicker(ticker);
      setInWatchlist(false);
      setShowCongrats(false);
    } else {
      const wasEmpty = watchlistStore.getWatchlist().length === 0;
      watchlistStore.addTicker(ticker);
      setInWatchlist(true);
      // Requirement 3.6: congratulatory message on first addition
      if (wasEmpty) {
        setShowCongrats(true);
      }
    }
  }

  return (
    <div className="stock-detail" style={{ direction: 'rtl', maxWidth: '600px' }}>
      {/* Requirement 2.2: loading indicator */}
      {isLoading && (
        <div className="stock-detail-loading" role="status" aria-live="polite">
          <p>טוען נתוני מניה...</p>
        </div>
      )}

      {/* Requirement 2.3 / 6.3: error state with retry */}
      {!isLoading && error && (
        <div className="stock-detail-error" role="alert">
          <p style={{ color: '#c62828' }}>{error}</p>
          <button onClick={loadQuote} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            נסה שוב
          </button>
        </div>
      )}

      {!isLoading && !error && quote && (
        <>
          {/* Requirement 2.4: ticker and company name prominently */}
          <div style={{ marginBottom: '12px' }}>
            <h2 style={{ margin: '0 0 4px' }}>{quote.ticker}</h2>
            <p style={{ margin: 0, color: '#555' }}>{quote.companyName}</p>
          </div>

          {/* Requirement 2.7: plain-language performance summary */}
          <PerformanceSummary quote={quote} />

          {/* Requirement 2.1 + 2.6: metrics with tooltips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '16px 0' }}>
            <MetricWithTooltip
              label={METRIC_TOOLTIPS.price.term}
              value={`$${quote.price.toFixed(2)}`}
              explanation={METRIC_TOOLTIPS.price.explanation}
            />
            <MetricWithTooltip
              label={METRIC_TOOLTIPS.change.term}
              value={`${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)}`}
              explanation={METRIC_TOOLTIPS.change.explanation}
            />
            <MetricWithTooltip
              label={METRIC_TOOLTIPS.changePercent.term}
              value={`${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%`}
              explanation={METRIC_TOOLTIPS.changePercent.explanation}
            />
            <MetricWithTooltip
              label={METRIC_TOOLTIPS.volume.term}
              value={quote.volume.toLocaleString()}
              explanation={METRIC_TOOLTIPS.volume.explanation}
            />
          </div>

          {/* Requirement 3.6: watchlist toggle button */}
          <button
            className="watchlist-toggle"
            onClick={handleWatchlistToggle}
            style={{
              padding: '10px 20px',
              cursor: 'pointer',
              background: inWatchlist ? '#ffebee' : '#e8f5e9',
              border: `1px solid ${inWatchlist ? '#c62828' : '#2e7d32'}`,
              borderRadius: '6px',
              color: inWatchlist ? '#c62828' : '#2e7d32',
              fontWeight: 'bold',
            }}
          >
            {inWatchlist ? '🗑️ הסר מרשימת המעקב' : '➕ הוסף לרשימת המעקב'}
          </button>

          {/* Requirement 3.6: congratulatory message on first addition */}
          {showCongrats && (
            <div
              className="watchlist-congrats"
              role="status"
              style={{
                marginTop: '12px',
                background: '#e8f5e9',
                border: '1px solid #a5d6a7',
                borderRadius: '6px',
                padding: '12px',
              }}
            >
              🎉 <strong>מזל טוב!</strong> הוספת את המניה הראשונה שלך לרשימת המעקב.
              רשימת המעקב עוזרת לך לעקוב אחר חברות שמעניינות אותך לאורך זמן.
            </div>
          )}
        </>
      )}
    </div>
  );
}
