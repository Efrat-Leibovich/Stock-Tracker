import { IWatchlistStore } from '../types';

const STORAGE_KEY = 'watchlist';

/**
 * WatchlistStore — שומר ומנהל את רשימת המעקב ב-localStorage
 * (Manages the user's personal watchlist, persisted to localStorage)
 */
export class WatchlistStore implements IWatchlistStore {
  private tickers: string[];

  constructor() {
    this.tickers = this.load();
  }

  /** טוען את הרשימה מ-localStorage */
  private load(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((t): t is string => typeof t === 'string');
      }
      return [];
    } catch {
      return [];
    }
  }

  /** שומר את הרשימה ל-localStorage */
  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tickers));
  }

  /** מחזיר עותק של רשימת ה-tickers */
  getWatchlist(): string[] {
    return [...this.tickers];
  }

  /** מוסיף ticker לרשימה — מתעלם מכפילויות */
  addTicker(ticker: string): void {
    if (!this.hasTicker(ticker)) {
      this.tickers.push(ticker);
      this.save();
    }
  }

  /** מסיר ticker מהרשימה */
  removeTicker(ticker: string): void {
    this.tickers = this.tickers.filter(t => t !== ticker);
    this.save();
  }

  /** בודק אם ticker קיים ברשימה */
  hasTicker(ticker: string): boolean {
    return this.tickers.includes(ticker);
  }
}
