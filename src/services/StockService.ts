import {
  IStockService,
  Result,
  SearchResult,
  StockQuote,
  StockServiceError,
} from '../types';

const API_BASE = '/api';

/**
 * StockService — שולף נתוני מניות דרך ה-backend proxy שלנו
 * (Fetches stock data via our secure backend proxy — API key never exposed to browser)
 */
export class StockService implements IStockService {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? API_BASE;
  }

  // ----------------------------------------------------------
  // searchStocks — חיפוש מניות לפי שם חברה או סמל
  // ----------------------------------------------------------
  async searchStocks(query: string): Promise<Result<SearchResult[]>> {
    if (query.trim().length === 0) {
      return {
        ok: false,
        error: { code: 'INVALID_INPUT', message: 'שאילתת החיפוש לא יכולה להיות ריקה' },
      };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/search?q=${encodeURIComponent(query)}`
      );
      const json = await response.json() as { results?: SearchResult[]; error?: string; message?: string };

      if (!response.ok) {
        return this.apiError(json.error ?? 'API_ERROR', json.message ?? 'שגיאת שרת');
      }

      return { ok: true, data: json.results ?? [] };
    } catch (err) {
      return this.networkError(String(err));
    }
  }

  // ----------------------------------------------------------
  // getQuote — שליפת נתוני מחיר עדכניים למניה
  // ----------------------------------------------------------
  async getQuote(ticker: string): Promise<Result<StockQuote>> {
    if (ticker.trim().length === 0) {
      return {
        ok: false,
        error: { code: 'INVALID_INPUT', message: 'סמל המניה לא יכול להיות ריק' },
      };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/quote/${encodeURIComponent(ticker)}`
      );
      const json = await response.json() as StockQuote & { error?: string; message?: string };

      if (response.status === 404) {
        return {
          ok: false,
          error: { code: 'NOT_FOUND', message: json.message ?? `המניה "${ticker}" לא נמצאה` },
        };
      }

      if (!response.ok) {
        return this.apiError(json.error ?? 'API_ERROR', json.message ?? 'שגיאת שרת');
      }

      return { ok: true, data: json };
    } catch (err) {
      return this.networkError(String(err));
    }
  }

  // ----------------------------------------------------------
  // Private helpers
  // ----------------------------------------------------------
  private apiError(code: string, message: string): Result<never> {
    const error: StockServiceError = {
      code: code as StockServiceError['code'],
      message,
    };
    return { ok: false, error };
  }

  private networkError(detail: string): Result<never> {
    const error: StockServiceError = {
      code: 'NETWORK_ERROR',
      message: `שגיאת רשת: ${detail}`,
    };
    return { ok: false, error };
  }
}
