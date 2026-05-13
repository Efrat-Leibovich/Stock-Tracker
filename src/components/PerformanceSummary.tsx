import React from 'react';
import type { StockQuote } from '../types';

interface PerformanceSummaryProps {
  quote: StockQuote;
}

/**
 * מייצר משפט סיכום בעברית פשוטה לביצועי המניה היומיים.
 * Requirements: 2.7
 */
export function PerformanceSummary({ quote }: PerformanceSummaryProps) {
  const direction = quote.change >= 0 ? 'עלתה' : 'ירדה';
  const meaning = quote.change >= 0 
    ? 'זה אומר שהיא שווה יותר מאתמול' 
    : 'זה אומר שהיא שווה פחות מאתמול';

  const absPercent = Math.abs(quote.changePercent).toFixed(2);

  return (
    <p className="performance-summary" style={{ direction: 'rtl', fontSize: '1rem', color: '#333' }}>
      המניה {direction} ב-{absPercent}% היום — {meaning}
    </p>
  );
}
