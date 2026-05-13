import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT ?? 3001;
const FINNHUB_KEY = process.env.FINNHUB_API_KEY ?? '';
const FINNHUB_BASE = 'https://finnhub.io/api/v1';

// ── Security middleware ──────────────────────────────────────────────────────

// Allow only the Vite dev server (and same-origin in production)
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173',
  methods: ['GET'],
}));

// Rate limiting — max 60 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'יותר מדי בקשות, נסה שוב בעוד דקה' },
});
app.use(limiter);

// ── Helpers ──────────────────────────────────────────────────────────────────

function validateQuery(q: unknown): string | null {
  if (typeof q !== 'string') return null;
  const trimmed = q.trim();
  if (trimmed.length === 0 || trimmed.length > 100) return null;
  // Allow only alphanumeric, spaces, dots, hyphens (safe for ticker/company names)
  if (!/^[\w\s.\-]+$/i.test(trimmed)) return null;
  return trimmed;
}

// ── Endpoints ────────────────────────────────────────────────────────────────

/**
 * GET /api/search?q=apple
 * Returns list of matching stocks (supports .TA suffix for Israeli stocks)
 */
app.get('/api/search', async (req, res) => {
  const query = validateQuery(req.query.q);
  if (!query) {
    res.status(400).json({ error: 'INVALID_INPUT', message: 'שאילתת חיפוש לא תקינה' });
    return;
  }

  try {
    const url = `${FINNHUB_BASE}/search?q=${encodeURIComponent(query)}&token=${FINNHUB_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      res.status(502).json({ error: 'API_ERROR', message: `שגיאת API: ${response.status}` });
      return;
    }
    const json = await response.json() as { result?: { symbol: string; description: string }[] };
    const results = (json.result ?? []).map(r => ({
      ticker: r.symbol,
      companyName: r.description,
    }));
    res.json({ results });
  } catch {
    res.status(503).json({ error: 'NETWORK_ERROR', message: 'שגיאת רשת' });
  }
});

/**
 * GET /api/quote/:ticker
 * Returns current price data for a ticker (e.g. TEVA.TA for Israeli stocks)
 */
app.get('/api/quote/:ticker', async (req, res) => {
  const ticker = validateQuery(req.params.ticker);
  if (!ticker) {
    res.status(400).json({ error: 'INVALID_INPUT', message: 'סמל מניה לא תקין' });
    return;
  }

  try {
    // Fetch quote and profile in parallel
    const [quoteRes, profileRes] = await Promise.all([
      fetch(`${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(ticker)}&token=${FINNHUB_KEY}`),
      fetch(`${FINNHUB_BASE}/stock/profile2?symbol=${encodeURIComponent(ticker)}&token=${FINNHUB_KEY}`),
    ]);

    if (!quoteRes.ok) {
      res.status(502).json({ error: 'API_ERROR', message: `שגיאת API: ${quoteRes.status}` });
      return;
    }

    const quote = await quoteRes.json() as { c: number; d: number; dp: number; v?: number };
    const profile = profileRes.ok
      ? await profileRes.json() as { name?: string }
      : {};

    // Finnhub returns c=0 when ticker not found
    if (!quote.c) {
      res.status(404).json({ error: 'NOT_FOUND', message: `המניה "${ticker}" לא נמצאה` });
      return;
    }

    res.json({
      ticker,
      companyName: (profile as { name?: string }).name ?? ticker,
      price: quote.c,
      change: quote.d ?? 0,
      changePercent: quote.dp ?? 0,
      volume: quote.v ?? 0,
    });
  } catch {
    res.status(503).json({ error: 'NETWORK_ERROR', message: 'שגיאת רשת' });
  }
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Stock proxy server running on http://localhost:${PORT}`);
  if (!FINNHUB_KEY) {
    console.warn('⚠️  FINNHUB_API_KEY is not set in server/.env');
  }
});
