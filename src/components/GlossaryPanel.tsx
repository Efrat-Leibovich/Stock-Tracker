import React from 'react';
import type { TooltipDefinition } from '../types';

/**
 * מונחים פיננסיים עם הגדרות בעברית פשוטה
 * Requirements: 5.1, 5.2
 */
const GLOSSARY_TERMS: TooltipDefinition[] = [
  {
    term: 'מניה',
    explanation: 'חלק קטן מבעלות על חברה. כשקונים מניה של חברה, הופכים לבעלים חלקיים שלה.',
  },
  {
    term: 'Ticker (סמל מניה)',
    explanation: 'קוד קצר של אותיות שמזהה חברה בבורסה. לדוגמה: AAPL = Apple, TSLA = Tesla.',
  },
  {
    term: 'נפח מסחר',
    explanation: 'כמה מניות נקנו ונמכרו היום. מספר גבוה מעיד על עניין רב בחברה.',
  },
  {
    term: 'שינוי יומי',
    explanation: 'ההפרש בין מחיר הפתיחה של היום למחיר הנוכחי. מספר חיובי = המניה עלתה.',
  },
  {
    term: 'רשימת מעקב',
    explanation: 'רשימה אישית של מניות שבחרת לעקוב אחריהן. כך תוכל לראות בקלות איך הן מתנהגות.',
  },
];

interface GlossaryPanelProps {
  onClose: () => void;
}

/**
 * פאנל מילון מונחים — נגיש מהניווט הראשי.
 * Requirements: 5.1, 5.2
 */
export function GlossaryPanel({ onClose }: GlossaryPanelProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="מילון מונחים"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '320px',
        height: '100%',
        background: '#fff',
        boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
        padding: '24px',
        overflowY: 'auto',
        direction: 'rtl',
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>מילון מונחים 📖</h2>
        <button
          onClick={onClose}
          aria-label="סגור מילון מונחים"
          style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        הסברים פשוטים למונחים שתפגוש באפליקציה
      </p>
      <dl>
        {GLOSSARY_TERMS.map(({ term, explanation }) => (
          <div key={term} style={{ marginBottom: '16px' }}>
            <dt style={{ fontWeight: 'bold', marginBottom: '4px' }}>{term}</dt>
            <dd style={{ margin: 0, color: '#444', lineHeight: 1.5 }}>{explanation}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
