import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import type { IStockService, IWatchlistStore, StockQuote, Result, SearchResult } from './types';

// ---------------------------------------------------------------------------
// Stubs
// ---------------------------------------------------------------------------

const APPLE_QUOTE: StockQuote = {
  ticker: 'AAPL',
  companyName: 'Apple Inc.',
  price: 175.5,
  change: 2.3,
  changePercent: 1.33,
  volume: 55_000_000,
};

const SEARCH_RESULTS: SearchResult[] = [
  { ticker: 'AAPL', companyName: 'Apple Inc.' },
];

function makeService(overrides: Partial<IStockService> = {}): IStockService {
  return {
    searchStocks: async (): Promise<Result<SearchResult[]>> => ({
      ok: true,
      data: SEARCH_RESULTS,
    }),
    getQuote: async (): Promise<Result<StockQuote>> => ({
      ok: true,
      data: APPLE_QUOTE,
    }),
    ...overrides,
  };
}

function makeStore(initial: string[] = []): IWatchlistStore {
  let tickers = [...initial];
  return {
    getWatchlist: () => [...tickers],
    addTicker: (t: string) => { if (!tickers.includes(t)) tickers.push(t); },
    removeTicker: (t: string) => { tickers = tickers.filter(x => x !== t); },
    hasTicker: (t: string) => tickers.includes(t),
  };
}

// ---------------------------------------------------------------------------
// Module-level service/store injection via module mocking
// We override the singleton instances used by App by mocking the modules.
// ---------------------------------------------------------------------------

// We need to inject our stubs into App. Since App creates singletons at module
// level, we mock the service and store modules so App picks up our stubs.

jest.mock('./services/StockService', () => ({
  StockService: jest.fn().mockImplementation(() => makeService()),
}));

jest.mock('./store/WatchlistStore', () => {
  let tickers: string[] = [];
  return {
    WatchlistStore: jest.fn().mockImplementation(() => ({
      getWatchlist: () => [...tickers],
      addTicker: (t: string) => { if (!tickers.includes(t)) tickers.push(t); },
      removeTicker: (t: string) => { tickers = tickers.filter(x => x !== t); },
      hasTicker: (t: string) => tickers.includes(t),
    })),
    __resetTickers: () => { tickers = []; },
  };
});

// Reset the in-memory store between tests
beforeEach(() => {
  const mod = jest.requireMock('./store/WatchlistStore') as { __resetTickers: () => void };
  mod.__resetTickers();
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// Integration test 1: Search → select stock → navigate to detail
// Validates: Requirements 1.1, 2.1
// ---------------------------------------------------------------------------
describe('Integration: search → select stock → detail view', () => {
  it('shows stock detail after searching and clicking a result', async () => {
    render(<App />);

    // Type in the search box
    const input = screen.getByRole('textbox', { name: /חיפוש מניה/i });
    fireEvent.change(input, { target: { value: 'AAPL' } });

    // Wait for search results to appear
    const resultBtn = await screen.findByText('AAPL');
    fireEvent.click(resultBtn);

    // Stock detail should load
    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Integration test 2: Add to watchlist → remove from watchlist
// Validates: Requirements 3.1, 3.2
// ---------------------------------------------------------------------------
describe('Integration: add and remove from watchlist', () => {
  it('adds a stock to the watchlist and then removes it', async () => {
    render(<App />);

    // Navigate to stock detail
    const input = screen.getByRole('textbox', { name: /חיפוש מניה/i });
    fireEvent.change(input, { target: { value: 'AAPL' } });
    const resultBtn = await screen.findByText('AAPL');
    fireEvent.click(resultBtn);

    // Wait for detail to load and click "add to watchlist"
    const addBtn = await screen.findByText(/הוסף לרשימת המעקב/);
    fireEvent.click(addBtn);

    // Button should now say "remove"
    expect(screen.getByText(/הסר מרשימת המעקב/)).toBeInTheDocument();

    // Remove from watchlist
    fireEvent.click(screen.getByText(/הסר מרשימת המעקב/));

    // Button should say "add" again
    expect(screen.getByText(/הוסף לרשימת המעקב/)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Integration test 3: Open glossary panel
// Validates: Requirements 5.1
// ---------------------------------------------------------------------------
describe('Integration: open glossary panel', () => {
  it('opens the glossary panel from the navigation', () => {
    render(<App />);

    const glossaryBtn = screen.getByRole('button', { name: /פתח מילון מונחים/i });
    fireEvent.click(glossaryBtn);

    expect(screen.getByRole('dialog', { name: /מילון מונחים/i })).toBeInTheDocument();
    // The glossary <dt> for "מניה" should be present
    const dts = screen.getAllByText(/^מניה$/);
    expect(dts.length).toBeGreaterThanOrEqual(1);
  });

  it('closes the glossary panel when close button is clicked', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /פתח מילון מונחים/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /סגור מילון מונחים/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Integration test 4: Watchlist view navigation
// Validates: Requirements 4.3
// ---------------------------------------------------------------------------
describe('Integration: watchlist navigation', () => {
  it('navigates to watchlist view and shows empty state', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /רשימת מעקב/i }));

    expect(screen.getByText(/רשימת המעקב שלי/)).toBeInTheDocument();
    expect(screen.getByText(/רשימת המעקב שלך ריקה/)).toBeInTheDocument();
  });
});
