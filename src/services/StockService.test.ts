import * as fc from 'fast-check';
import { StockService } from './StockService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

let originalFetch: typeof fetch;
beforeAll(() => { originalFetch = global.fetch; });
afterEach(() => { global.fetch = originalFetch; });
afterAll(() => { global.fetch = originalFetch; });

// ---------------------------------------------------------------------------
// Property 6: Search whitespace rejection
// Feature: stock-tracker, Property 6: search whitespace rejection
// Validates: Requirements 1.3
// ---------------------------------------------------------------------------
describe('Property 6: Search whitespace rejection', () => {
  it('returns INVALID_INPUT for any whitespace-only or empty query', async () => {
    const whitespaceArb = fc.string({
      unit: fc.constantFrom(' ', '\t', '\n', '\r'),
      minLength: 0,
      maxLength: 20,
    });

    await fc.assert(
      fc.asyncProperty(whitespaceArb, async (query) => {
        const svc = new StockService('/api');
        const result = await svc.searchStocks(query);
        expect(result.ok).toBe(false);
        const failed = result as { ok: false; error: { code: string } };
        expect(failed.error.code).toBe('INVALID_INPUT');
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 7: API error always returns structured Result
// Feature: stock-tracker, Property 7: API error always returns structured Result
// Validates: Requirements 6.2, 2.3
// ---------------------------------------------------------------------------
describe('Property 7: API error always returns structured Result', () => {
  it('never throws and always returns { ok: false } for any HTTP error status', async () => {
    const errorStatusArb = fc.integer({ min: 400, max: 599 });
    const queryArb = fc.stringMatching(/^[A-Z]{1,5}$/);

    await fc.assert(
      fc.asyncProperty(errorStatusArb, queryArb, async (status, query) => {
        global.fetch = async () => mockResponse({ error: 'API_ERROR', message: 'שגיאה' }, status);

        const svc = new StockService('/api');
        const searchResult = await svc.searchStocks(query);
        const quoteResult = await svc.getQuote(query);

        expect(searchResult.ok).toBe(false);
        expect(quoteResult.ok).toBe(false);

        const failedSearch = searchResult as { ok: false; error: { code: string; message: string } };
        const failedQuote = quoteResult as { ok: false; error: { code: string; message: string } };
        expect(failedSearch.error).toHaveProperty('code');
        expect(failedSearch.error).toHaveProperty('message');
        expect(failedQuote.error).toHaveProperty('code');
        expect(failedQuote.error).toHaveProperty('message');
      }),
      { numRuns: 100 }
    );
  });

  it('never throws and always returns { ok: false } when fetch rejects (network down)', async () => {
    const queryArb = fc.stringMatching(/^[A-Z]{1,5}$/);

    await fc.assert(
      fc.asyncProperty(queryArb, async (query) => {
        global.fetch = async () => { throw new Error('Network unavailable'); };

        const svc = new StockService('/api');
        const searchResult = await svc.searchStocks(query);
        const quoteResult = await svc.getQuote(query);

        expect(searchResult.ok).toBe(false);
        expect(quoteResult.ok).toBe(false);

        const failedSearch = searchResult as { ok: false; error: { code: string } };
        const failedQuote = quoteResult as { ok: false; error: { code: string } };
        expect(failedSearch.error.code).toBe('NETWORK_ERROR');
        expect(failedQuote.error.code).toBe('NETWORK_ERROR');
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Unit tests: specific examples
// Validates: Requirements 1.2, 6.1, 6.4
// ---------------------------------------------------------------------------
describe('StockService unit tests', () => {
  it('returns NOT_FOUND when server returns 404', async () => {
    global.fetch = async () =>
      mockResponse({ error: 'NOT_FOUND', message: 'המניה לא נמצאה' }, 404);

    const svc = new StockService('/api');
    const result = await svc.getQuote('FAKE');

    expect(result.ok).toBe(false);
    const failed = result as { ok: false; error: { code: string } };
    expect(failed.error.code).toBe('NOT_FOUND');
  });

  it('returns NETWORK_ERROR when fetch throws (network unavailable)', async () => {
    global.fetch = async () => { throw new Error('Failed to fetch'); };

    const svc = new StockService('/api');
    const result = await svc.getQuote('AAPL');

    expect(result.ok).toBe(false);
    const failed = result as { ok: false; error: { code: string } };
    expect(failed.error.code).toBe('NETWORK_ERROR');
  });

  it('returns empty array when server returns empty results', async () => {
    global.fetch = async () => mockResponse({ results: [] });

    const svc = new StockService('/api');
    const result = await svc.searchStocks('AAPL');

    expect(result.ok).toBe(true);
    const ok = result as { ok: true; data: import('../types').SearchResult[] };
    expect(ok.data).toEqual([]);
  });

  it('parses a valid quote response from the backend', async () => {
    const quotePayload = {
      ticker: 'AAPL',
      companyName: 'Apple Inc.',
      price: 175.5,
      change: 2.3,
      changePercent: 1.33,
      volume: 55000000,
    };
    global.fetch = async () => mockResponse(quotePayload);

    const svc = new StockService('/api');
    const result = await svc.getQuote('AAPL');

    expect(result.ok).toBe(true);
    const ok = result as { ok: true; data: import('../types').StockQuote };
    expect(ok.data.ticker).toBe('AAPL');
    expect(ok.data.price).toBe(175.5);
    expect(ok.data.change).toBe(2.3);
    expect(ok.data.changePercent).toBeCloseTo(1.33);
    expect(ok.data.volume).toBe(55000000);
  });
});
