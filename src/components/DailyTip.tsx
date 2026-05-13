import React from 'react';

/**
 * 7 טיפים למתחילים — אחד לכל יום בשבוע
 * Requirements: 5.3
 */
const DAILY_TIPS: string[] = [
  'מניה היא חלק קטן מבעלות על חברה. כשהחברה מרוויחה, ערך המניה בדרך כלל עולה.',
  'ה-Ticker הוא הכינוי הקצר של המניה בבורסה. לדוגמה: AAPL = Apple, GOOG = Google.',
  'נפח מסחר גבוה אומר שהרבה אנשים קנו ומכרו את המניה היום — זה יכול להעיד על חדשות חשובות.',
  'שינוי יומי חיובי (ירוק) אומר שהמניה שווה יותר מאשר בפתיחת המסחר היום.',
  'רשימת מעקב עוזרת לך לעקוב אחר חברות שמעניינות אותך, בלי לקנות מניות בפועל.',
  'מחיר מניה משתנה כל הזמן בזמן שהבורסה פתוחה — זה נורמלי לחלוטין.',
  'לפני שמשקיעים, כדאי ללמוד על החברה: מה היא עושה, האם היא מרוויחה, ומה תוכניותיה.',
];

/**
 * מחזיר טיפ יומי קבוע לפי יום בשבוע (0=ראשון, 6=שבת)
 */
function getTodaysTip(): string {
  const dayOfWeek = new Date().getDay(); // 0–6
  return DAILY_TIPS[dayOfWeek];
}

/**
 * מציג טיפ יומי למתחילים במסך הבית.
 * Requirements: 5.3
 */
export function DailyTip() {
  const tip = getTodaysTip();

  return (
    <div
      className="daily-tip"
      role="note"
      aria-label="טיפ יומי"
      style={{
        background: '#fffbe6',
        border: '1px solid #ffe58f',
        borderRadius: '8px',
        padding: '12px 16px',
        direction: 'rtl',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
      }}
    >
      <span style={{ fontSize: '1.4rem' }}>💡</span>
      <div>
        <strong style={{ display: 'block', marginBottom: '4px' }}>טיפ יומי</strong>
        <span>{tip}</span>
      </div>
    </div>
  );
}
