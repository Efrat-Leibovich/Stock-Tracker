import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as fc from 'fast-check';
import { StockCard } from './StockCard';
import type { StockQuote } from '../types';

afterEach(() => cleanup());

// ---------------------------------------------------------------------------
// Arbitrary: valid StockQuote
// ---------------------------------------------------------------------------
const stockQuoteArb = fc.record<StockQuote>({
  ticker: fc.stringMatching(/^[A-Z]{1,5}$/),
  companyName: fc.string({ minLength: 1, maxLength: 40 }),
  price: fc.double({ min: 0.01, max: 10000, noNaN: true }),
  change: fc.double({ min: -500, max: 500, noNaN: true }),
  changePercent: fc.double({ min: -100, max: 100, noNaN: true }),
  volume: fc.integer({ min: 0, max: 1_000_000_000 }),
});

// Positive-change quote
const positiveQuoteArb = stockQuoteArb.filter(q => q.change > 0);

// Negative-change quote
const negativeQuoteArb = stockQuoteArb.filter(q => q.change < 0);

// ---------------------------------------------------------------------------
// Property 4: StockQuote rendering completeness
// Feature: stock-tracker, Property 4: StockQuote rendering completeness
// Validates: Requirements 2.1, 2.4
// ---------------------------------------------------------------------------
describe('Property 4: StockQuote rendering completeness', () => {
  it('renders ticker, company name, price, change, and changePercent for any valid StockQuote', () => {
    fc.assert(
      fc.property(stockQuoteArb, (quote) => {
        cleanup();
        const { container } = render(<StockCard quote={quote} />);

        // ticker must be present
        const tickerEl = container.querySelector('.stock-card-ticker');
        expect(tickerEl).not.toBeNull();
        expect(tickerEl!.textContent).toBe(quote.ticker);

        // company name must be present
        const companyEl = container.querySelector('.stock-card-company');
        expect(companyEl).not.toBeNull();
        expect(companyEl!.textContent).toBe(quote.companyName);

        // price must appear (formatted with $)
        const priceEl = container.querySelector('.stock-card-price');
        expect(priceEl).not.toBeNull();
        expect(priceEl!.textContent).toContain(quote.price.toFixed(2));

        // change and changePercent must appear in the change element
        const changeEl = container.querySelector('.stock-card-change');
        expect(changeEl).not.toBeNull();
        expect(changeEl!.textContent).toContain(Math.abs(quote.change).toFixed(2));
        expect(changeEl!.textContent).toContain(Math.abs(quote.changePercent).toFixed(2));

        cleanup();
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 5: Price color invariant
// Feature: stock-tracker, Property 5: Price color invariant
// Validates: Requirements 2.5
// ---------------------------------------------------------------------------
describe('Property 5: Price color invariant', () => {
  it('applies "positive" class when change > 0', () => {
    fc.assert(
      fc.property(positiveQuoteArb, (quote) => {
        cleanup();
        const { container } = render(<StockCard quote={quote} />);
        const changeEl = container.querySelector('.stock-card-change');
        expect(changeEl).not.toBeNull();
        expect(changeEl!.classList.contains('positive')).toBe(true);
        expect(changeEl!.classList.contains('negative')).toBe(false);
        cleanup();
      }),
      { numRuns: 100 }
    );
  });

  it('applies "negative" class when change < 0', () => {
    fc.assert(
      fc.property(negativeQuoteArb, (quote) => {
        cleanup();
        const { container } = render(<StockCard quote={quote} />);
        const changeEl = container.querySelector('.stock-card-change');
        expect(changeEl).not.toBeNull();
        expect(changeEl!.classList.contains('negative')).toBe(true);
        expect(changeEl!.classList.contains('positive')).toBe(false);
        cleanup();
      }),
      { numRuns: 100 }
    );
  });
});
