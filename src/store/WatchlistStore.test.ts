import * as fc from 'fast-check';
import { WatchlistStore } from './WatchlistStore';

// Helper: create a fresh store with a clean localStorage slate
function makeStore(): WatchlistStore {
  localStorage.clear();
  return new WatchlistStore();
}

// Arbitrary: non-empty ticker strings (letters + digits, 1–10 chars)
const tickerArb = fc.stringMatching(/^[A-Z]{1,5}$/);

// Arbitrary: array of unique tickers
const uniqueTickersArb = fc
  .array(tickerArb, { minLength: 0, maxLength: 10 })
  .map(arr => [...new Set(arr)]);

// ============================================================
// Property 1: Watchlist add/remove round trip
// Feature: stock-tracker, Property 1: add/remove round trip
// ============================================================
describe('Property 1: Watchlist add/remove round trip', () => {
  it('adding then removing a ticker (not already present) leaves the watchlist unchanged', () => {
    // Validates: Requirements 3.1, 3.2
    // Constraint: ticker must NOT already be in the initial list, so that
    // addTicker actually inserts it and removeTicker is a true inverse.
    fc.assert(
      fc.property(uniqueTickersArb, tickerArb, (initial, ticker) => {
        // Filter out the ticker from initial to guarantee it's absent
        const safeInitial = initial.filter(t => t !== ticker);

        const store = makeStore();
        safeInitial.forEach(t => store.addTicker(t));
        const before = store.getWatchlist();

        // Add the ticker (new entry), then remove it (true inverse)
        store.addTicker(ticker);
        store.removeTicker(ticker);

        const after = store.getWatchlist();

        expect(after).toEqual(before);
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================================
// Property 2: Watchlist no duplicates
// Feature: stock-tracker, Property 2: no duplicates
// ============================================================
describe('Property 2: Watchlist no duplicates', () => {
  it('adding the same ticker multiple times results in exactly one entry', () => {
    // Validates: Requirements 3.3
    fc.assert(
      fc.property(tickerArb, fc.integer({ min: 1, max: 10 }), (ticker, times) => {
        const store = makeStore();
        for (let i = 0; i < times; i++) {
          store.addTicker(ticker);
        }
        const list = store.getWatchlist();
        const occurrences = list.filter(t => t === ticker).length;
        expect(occurrences).toBe(1);
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================================
// Property 3: Watchlist persistence round trip
// Feature: stock-tracker, Property 3: persistence round trip
// ============================================================
describe('Property 3: Watchlist persistence round trip', () => {
  it('saving to localStorage and reloading returns the same tickers', () => {
    // Validates: Requirements 3.4, 3.5
    fc.assert(
      fc.property(uniqueTickersArb, (tickers) => {
        // Build and populate a store (auto-saves on each add)
        const store1 = makeStore();
        tickers.forEach(t => store1.addTicker(t));

        // Create a new store instance — it should load from localStorage
        const store2 = new WatchlistStore();

        expect(store2.getWatchlist()).toEqual(store1.getWatchlist());
      }),
      { numRuns: 100 }
    );
  });
});
