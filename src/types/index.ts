// ============================================================
// Core domain types for the Stock Tracker application
// ============================================================

/**
 * נתוני מחיר עדכניים של מניה
 * (Current price data for a stock)
 */
export interface StockQuote {
  ticker: string;        // סמל המניה, לדוגמה "AAPL"
  companyName: string;   // שם החברה, לדוגמה "Apple Inc."
  price: number;         // מחיר נוכחי (חייב להיות חיובי)
  change: number;        // שינוי מוחלט מפתיחת היום
  changePercent: number; // שינוי באחוזים מפתיחת היום
  volume: number;        // נפח מסחר (כמה מניות נסחרו היום)
}

/**
 * תוצאת חיפוש מניה
 * (Stock search result)
 */
export interface SearchResult {
  ticker: string;      // סמל המניה
  companyName: string; // שם החברה
}

/**
 * שגיאה מ-StockService
 * (Error returned by StockService)
 */
export interface StockServiceError {
  code: 'NOT_FOUND' | 'NETWORK_ERROR' | 'API_ERROR' | 'INVALID_INPUT';
  message: string;
}

/**
 * עטיפת תוצאה שמאפשרת טיפול בשגיאות ללא exceptions
 * (Result wrapper for error handling without exceptions)
 *
 * Usage:
 *   const result: Result<StockQuote> = await service.getQuote('AAPL');
 *   if (result.ok) { use(result.data) } else { handle(result.error) }
 */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: StockServiceError };

/**
 * זוג מונח + הסבר בעברית פשוטה לשימוש ב-tooltips ובמילון מונחים
 * (Term + plain-Hebrew explanation pair for tooltips and glossary)
 */
export interface TooltipDefinition {
  term: string;        // המונח הפיננסי (לדוגמה "Volume")
  explanation: string; // הסבר בעברית פשוטה (לדוגמה "כמה מניות נקנו ונמכרו היום")
}

// ============================================================
// Service interfaces
// ============================================================

/**
 * ממשק שירות המניות — שליפת נתונים מ-API חיצוני
 * (Stock service interface — fetches data from external API)
 */
export interface IStockService {
  /**
   * חיפוש מניות לפי שם חברה או סמל מניה
   * Returns empty array when no results found.
   * Returns INVALID_INPUT error for empty/whitespace queries.
   */
  searchStocks(query: string): Promise<Result<SearchResult[]>>;

  /**
   * שליפת נתוני מחיר עדכניים למניה לפי סמל
   * Returns NOT_FOUND when ticker does not exist.
   */
  getQuote(ticker: string): Promise<Result<StockQuote>>;
}

/**
 * ממשק חנות רשימת המעקב — שמירה וטעינה מ-localStorage
 * (Watchlist store interface — persists to localStorage)
 */
export interface IWatchlistStore {
  /** מחזיר את רשימת ה-tickers השמורים */
  getWatchlist(): string[];

  /** מוסיף ticker לרשימה (ללא כפילויות) */
  addTicker(ticker: string): void;

  /** מסיר ticker מהרשימה */
  removeTicker(ticker: string): void;

  /** בודק אם ticker קיים ברשימה */
  hasTicker(ticker: string): boolean;
}
