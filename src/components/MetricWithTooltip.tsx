import React, { useState } from 'react';

interface MetricWithTooltipProps {
  label: string;
  value: string | number;
  explanation: string; // הסבר בעברית פשוטה
}

/**
 * מציג ערך פיננסי עם אייקון ℹ️ שבריחוף מציג הסבר בעברית פשוטה.
 * Requirements: 2.6, 5.4
 */
export function MetricWithTooltip({ label, value, explanation }: MetricWithTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="metric-with-tooltip" style={{ position: 'relative', display: 'inline-block' }}>
      <span className="metric-label">{label}: </span>
      <span className="metric-value">{value}</span>
      <button
        className="tooltip-trigger"
        aria-label={`הסבר על ${label}`}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}
      >
        ℹ️
      </button>
      {visible && (
        <div
          role="tooltip"
          className="tooltip-popup"
          style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            background: '#333',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            zIndex: 10,
            fontSize: '0.85rem',
            direction: 'rtl',
          }}
        >
          {explanation}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Tooltip definitions for all financial metrics
// Requirements: 2.6, 5.4
// ============================================================
export const METRIC_TOOLTIPS = {
  price: {
    term: 'מחיר',
    explanation: 'המחיר הנוכחי של מניה אחת בדולרים',
  },
  change: {
    term: 'שינוי יומי',
    explanation: 'כמה עלה או ירד המחיר מאז פתיחת המסחר היום',
  },
  changePercent: {
    term: 'אחוז שינוי',
    explanation: 'השינוי היומי מבוטא באחוזים — למשל 2% אומר שהמניה עלתה בשני אחוזים',
  },
  volume: {
    term: 'נפח מסחר',
    explanation: 'כמה מניות נקנו ונמכרו היום — מספר גבוה מעיד על עניין רב בחברה',
  },
} as const;
