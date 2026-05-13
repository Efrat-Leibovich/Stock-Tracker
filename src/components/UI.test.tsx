import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StockDetail } from './StockDetail';
import { WatchlistView } from './WatchlistView';
import { MetricWithTooltip } from './MetricWithTooltip';
import { PerformanceSummary } from './PerformanceSummary';
import type { IStockService, IWatchlistStore, StockQuote, Result, SearchResult } from '../types';

// ---------------------------------------------------------------------------
// Helpers / stubs
// ---------------------------------------------------------------------------

function makeQuote(overrides: Partial<StockQuote> = {}): StockQuote {
  return {
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    price: 175.5,
    change: 2.3,
    changePercent: 1.33,
    volume: 55_000_000,
    ...overrides,
  };
}

function makeStockService(quote?: StockQuote, delay = 0): IStockService {
  return {
    searchStocks: async (_q: string): Promise<Result<SearchResult[]>> => ({ ok: true, data: [] }),
    getQuote: async (_t: string): Promise<Result<StockQuote>> => {
      if (delay) await new Promise(r => setTimeout(r, delay));
      if (quote) return { ok: true, data: quote };
      return { ok: false, error: { code: 'NETWORK_ERROR', message: 'שגיאת רשת' } };
    },
  };
}

function makeErrorService(message = 'שגיאת רשת'): IStockService {
  return {
    searchStocks: async (): Promise<Result<SearchResult[]>> => ({ ok: true, data: [] }),
    getQuote: async (): Promise<Result<StockQuote>> => ({
      ok: false,
      error: { code: 'NETWORK_ERROR', message },
    }),
  };
}

function makeWatchlistStore(initial: string[] = []): IWatchlistStore {
  let tickers = [...initial];
  return {
    getWatchlist: () => [...tickers],
    addTicker: (t: string) => { if (!tickers.includes(t)) tickers.push(t); },
    removeTicker: (t: string) => { tickers = tickers.filter(x => x !== t); },
    hasTicker: (t: string) => tickers.includes(t),
  };
}

// ---------------------------------------------------------------------------
// StockDetail: loading indicator
// Validates: Requirements 2.2
// ---------------------------------------------------------------------------
describe('StockDetail — loading indicator', () => {
  it('shows loading indicator while fetching', () => {
    // Service that never resolves (simulates slow network)
    const slowService: IStockService = {
      searchStocks: async () => ({ ok: true, data: [] }),
      getQuote: () => new Promise(() => {}), // never resolves
    };
    const store = makeWatchlistStore();
    render(<StockDetail ticker="AAPL" stockService={slowService} watchlistStore={store} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/טוען/)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// StockDetail: error message + retry button
// Validates: Requirements 2.3
// ---------------------------------------------------------------------------
describe('StockDetail — error state', () => {
  it('shows error message and retry button when service fails', async () => {
    const store = makeWatchlistStore();
    render(<StockDetail ticker="AAPL" stockService={makeErrorService('שגיאת רשת')} watchlistStore={store} />);
    const errorMsg = await screen.findByRole('alert');
    expect(errorMsg).toBeInTheDocument();
    expect(screen.getByText(/שגיאת רשת/)).toBeInTheDocument();
    expect(screen.getByText(/נסה שוב/)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// WatchlistView: empty state welcome message
// Validates: Requirements 4.2
// ---------------------------------------------------------------------------
describe('WatchlistView — empty state', () => {
  it('shows welcome message when watchlist is empty', () => {
    const store = makeWatchlistStore([]);
    const service = makeStockService();
    render(<WatchlistView stockService={service} watchlistStore={store} onSelectStock={() => {}} />);
    expect(screen.getByText(/רשימת המעקב שלך ריקה/)).toBeInTheDocument();
    expect(screen.getByText(/רשימת מעקב/)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// MetricWithTooltip: tooltip shown on hover
// Validates: Requirements 5.4
// ---------------------------------------------------------------------------
describe('MetricWithTooltip — tooltip on hover', () => {
  it('shows tooltip explanation when hovering the info button', () => {
    render(
      <MetricWithTooltip label="מחיר" value="$175.50" explanation="המחיר הנוכחי של מניה אחת" />
    );
    const btn = screen.getByRole('button', { name: /הסבר על מחיר/ });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    fireEvent.mouseEnter(btn);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('tooltip').textContent).toBe('המחיר הנוכחי של מניה אחת');
    fireEvent.mouseLeave(btn);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// PerformanceSummary: correct sentence for rise and fall
// Validates: Requirements 2.7
// ---------------------------------------------------------------------------
describe('PerformanceSummary — sentence generation', () => {
  it('generates a "rose" sentence for positive change', () => {
    const quote = makeQuote({ change: 2.3, changePercent: 1.33 });
    render(<PerformanceSummary quote={quote} />);
    const el = screen.getByText(/עלתה/);
    expect(el).toBeInTheDocument();
    expect(el.textContent).toContain('1.33%');
    expect(el.textContent).toContain('שווה יותר');
  });

  it('generates a "fell" sentence for negative change', () => {
    const quote = makeQuote({ change: -1.5, changePercent: -0.85 });
    render(<PerformanceSummary quote={quote} />);
    const el = screen.getByText(/ירדה/);
    expect(el).toBeInTheDocument();
    expect(el.textContent).toContain('0.85%');
    expect(el.textContent).toContain('שווה פחות');
  });
});
