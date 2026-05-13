# Implementation Plan: Stock Tracker (למתחילים)

## Overview

בניית אפליקציית React + TypeScript למעקב מניות למתחילים. כל רכיב UI כולל הסברים בעברית פשוטה. המימוש מתחיל מהשכבות הפנימיות (types, store, service) ומתקדם לממשק המשתמש.

## Tasks

- [x] 1. הגדרת מבנה הפרויקט וטיפוסים
  - אתחול פרויקט Vite + React + TypeScript
  - הגדרת כל ה-interfaces: `StockQuote`, `SearchResult`, `StockServiceError`, `Result<T>`
  - הגדרת `IStockService` ו-`IWatchlistStore`
  - הגדרת `TooltipDefinition` — interface לזוגות `{ term, explanation }` לכל המונחים הפיננסיים
  - הגדרת תצורת Jest + fast-check
  - _Requirements: 1.1, 2.1, 3.1, 5.1_

- [x] 2. מימוש WatchlistStore
  - [x] 2.1 מימוש WatchlistStore עם localStorage
    - מימוש `addTicker`, `removeTicker`, `hasTicker`, `getWatchlist`
    - שמירה וטעינה מ-localStorage
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 2.2 בדיקת property: Watchlist add/remove round trip
    - **Property 1: Watchlist add/remove round trip**
    - **Validates: Requirements 3.1, 3.2**

  - [x] 2.3 בדיקת property: Watchlist no duplicates
    - **Property 2: Watchlist no duplicates**
    - **Validates: Requirements 3.3**

  - [x] 2.4 בדיקת property: Watchlist persistence round trip
    - **Property 3: Watchlist persistence round trip**
    - **Validates: Requirements 3.4, 3.5**

- [x] 3. Checkpoint — וודא שכל הבדיקות עוברות, שאל את המשתמש אם יש שאלות.

- [x] 4. מימוש StockService
  - [x] 4.1 מימוש StockService עם Alpha Vantage API
    - מימוש `searchStocks` ו-`getQuote`
    - פרסינג תגובות ה-API ל-`StockQuote` ו-`SearchResult[]`
    - טיפול בכל שגיאות הרשת וה-API כ-`Result<T>`
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 6.1, 6.2, 6.4_

  - [x] 4.2 בדיקת property: Search whitespace rejection
    - **Property 6: Search whitespace rejection**
    - **Validates: Requirements 1.3**

  - [x] 4.3 בדיקת property: API error always returns structured Result
    - **Property 7: API error always returns structured Result**
    - **Validates: Requirements 6.2, 2.3**

  - [x] 4.4 בדיקות unit: דוגמאות ספציפיות
    - ticker לא קיים מחזיר `NOT_FOUND`
    - רשת לא זמינה מחזיר `NETWORK_ERROR`
    - תגובת API ריקה מחזירה רשימה ריקה
    - _Requirements: 1.2, 6.1, 6.4_

- [x] 5. Checkpoint — וודא שכל הבדיקות עוברות, שאל את המשתמש אם יש שאלות.

- [x] 6. מימוש רכיבי הסבר ומילון מונחים
  - [x] 6.1 מימוש MetricWithTooltip
    - רכיב שמציג ערך פיננסי + אייקון ℹ️
    - בריחוף מציג הסבר בעברית פשוטה
    - הגדרת כל ה-tooltips: מחיר, שינוי יומי, אחוז שינוי, נפח מסחר
    - _Requirements: 2.6, 5.4_

  - [x] 6.2 מימוש GlossaryPanel
    - פאנל נגיש מהניווט הראשי
    - הצגת הגדרות בעברית פשוטה: מניה, ticker, נפח מסחר, שינוי יומי, רשימת מעקב
    - _Requirements: 5.1, 5.2_

  - [x] 6.3 מימוש DailyTip
    - רכיב שמציג טיפ יומי קבוע למתחילים במסך הבית
    - מערך של לפחות 7 טיפים שונים, אחד לכל יום בשבוע
    - _Requirements: 5.3_

- [x] 7. מימוש רכיבי React מרכזיים
  - [x] 7.1 מימוש StockCard
    - הצגת ticker, שם חברה, מחיר, שינוי, אחוז שינוי
    - CSS class חיובי/שלילי לפי כיוון השינוי
    - _Requirements: 2.1, 2.4, 2.5_

  - [x] 7.2 בדיקת property: StockCard rendering completeness
    - **Property 4: StockQuote rendering completeness**
    - **Validates: Requirements 2.1, 2.4**

  - [x] 7.3 בדיקת property: Price color invariant
    - **Property 5: Price color invariant**
    - **Validates: Requirements 2.5**

  - [x] 7.4 מימוש PerformanceSummary
    - רכיב שמייצר משפט סיכום בעברית פשוטה לביצועי המניה היומיים
    - לדוגמה: "המניה עלתה ב-2.3% היום — זה אומר שהיא שווה יותר מאתמול"
    - _Requirements: 2.7_

  - [x] 7.5 מימוש SearchBar
    - שדה חיפוש עם debounce
    - הצגת תוצאות חיפוש
    - הצגת שגיאת validation לקלט ריק/whitespace
    - הצגת טיפ מה זה ticker כשמוצגות תוצאות
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [x] 7.6 מימוש WatchlistView
    - הצגת כל המניות ברשימת המעקב
    - הסבר קצר בראש הדף מה זו רשימת מעקב
    - הודעת ברוכים הבאים כשהרשימה ריקה עם הסבר איך להוסיף מניות
    - רענון אוטומטי כל 60 שניות
    - _Requirements: 4.1, 4.2, 4.5_

  - [x] 7.7 מימוש StockDetail
    - תצוגת פרטי מניה מלאים עם MetricWithTooltip לכל מדד
    - PerformanceSummary בראש הדף
    - מצב loading ומצב שגיאה עם כפתור retry
    - כפתור הוספה/הסרה מרשימת המעקב
    - הודעת מזל טוב בהוספה ראשונה לרשימת מעקב
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 2.7, 3.6, 6.3_

  - [x] 7.8 בדיקות unit: רכיבי UI
    - loading indicator מוצג בזמן טעינה
    - הודעת שגיאה מוצגת עם כפתור retry
    - watchlist ריקה מציגה הודעת ברוכים הבאים
    - tooltip מוצג בריחוף
    - PerformanceSummary מייצר משפט נכון לעלייה ולירידה
    - _Requirements: 2.2, 2.3, 2.7, 4.2, 5.4_

- [x] 8. חיבור הכל יחד ב-App
  - [x] 8.1 חיבור כל הרכיבים ב-App.tsx
    - ניתוב בין SearchBar, WatchlistView, StockDetail
    - GlossaryPanel נגיש מהניווט הראשי
    - DailyTip במסך הבית
    - הזרקת StockService ו-WatchlistStore לרכיבים
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 5.3_

  - [x] 8.2 בדיקות integration
    - חיפוש → בחירת מניה → הוספה לרשימת מעקב
    - הסרה מרשימת מעקב
    - פתיחת מילון מונחים
    - _Requirements: 3.1, 3.2, 4.3, 5.1_

- [x] 9. Checkpoint סופי — וודא שכל הבדיקות עוברות, שאל את המשתמש אם יש שאלות.

## Notes

- כל property test מריץ מינימום 100 איטרציות
- משתנה הסביבה `VITE_ALPHA_VANTAGE_KEY` נדרש להרצה
- כל tooltip ו-PerformanceSummary נכתבים בעברית פשוטה ללא ז'רגון פיננסי
