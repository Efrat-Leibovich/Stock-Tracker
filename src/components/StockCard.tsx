import React from 'react';
import type { StockQuote } from '../types';

interface StockCardProps {
  quote: StockQuote;
  onClick?: () => void;
}

/**
 * כרטיס מניה — מציג ticker, שם חברה, מחיר, שינוי יומי ואחוז שינוי.
 * CSS class חיובי/שלילי לפי כיוון השינוי.
 * Requirements: 2.1, 2.4, 2.5
 */
export function StockCard({ quote, onClick }: StockCardProps) {
  const isPositive = quote.change >= 0;
  const changeClass = isPositive ? 'positive' : 'negative';
  const changeSign = isPositive ? '+' : '';

  return (
    <div
      className="stock-card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '16px',
        cursor: onClick ? 'pointer' : 'default',
        direction: 'rtl',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div className="stock-card-identity">
        <span className="stock-card-ticker" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
          {quote.ticker}
        </span>
        <span
          className="stock-card-company"
          style={{ display: 'block', color: '#666', fontSize: '0.9rem' }}
        >
          {quote.companyName}
        </span>
      </div>

      <div className="stock-card-price-info" style={{ textAlign: 'left' }}>
        <span className="stock-card-price" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
          ${quote.price.toFixed(2)}
        </span>
        <span
          className={`stock-card-change ${changeClass}`}
          style={{
            display: 'block',
            color: isPositive ? '#2e7d32' : '#c62828',
            fontSize: '0.9rem',
          }}
        >
          {changeSign}{quote.change.toFixed(2)} ({changeSign}{quote.changePercent.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
}
