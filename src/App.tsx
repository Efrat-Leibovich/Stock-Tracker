import React, { useState } from 'react';
import { StockService } from './services/StockService';
import { WatchlistStore } from './store/WatchlistStore';
import { SearchBar } from './components/SearchBar';
import { WatchlistView } from './components/WatchlistView';
import { StockDetail } from './components/StockDetail';
import { GlossaryPanel } from './components/GlossaryPanel';
import { DailyTip } from './components/DailyTip';
import { ALPHA_VANTAGE_KEY, API_BASE_URL } from './env';

// Singleton instances — created once for the app lifetime.
const stockService = new StockService(API_BASE_URL);
const watchlistStore = new WatchlistStore();

type View = 'home' | 'watchlist' | 'detail';

/**
 * App — מחבר את כל הרכיבים יחד
 * Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 5.3
 */
function App() {
  const [view, setView] = useState<View>('home');
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  function handleSelectStock(ticker: string) {
    setSelectedTicker(ticker);
    setView('detail');
  }

  function handleNavHome() {
    setView('home');
    setSelectedTicker(null);
  }

  function handleNavWatchlist() {
    setView('watchlist');
    setSelectedTicker(null);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', direction: 'rtl' }}>
      {/* ── Navigation bar ── */}
      <nav
        style={{
          background: '#1565c0',
          color: '#fff',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer' }} onClick={handleNavHome}>
          📈 מעקב מניות
        </span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handleNavHome}
            style={navBtnStyle(view === 'home')}
            aria-current={view === 'home' ? 'page' : undefined}
          >
            בית
          </button>
          <button
            onClick={handleNavWatchlist}
            style={navBtnStyle(view === 'watchlist')}
            aria-current={view === 'watchlist' ? 'page' : undefined}
          >
            רשימת מעקב
          </button>
          {/* Requirement 5.1: glossary accessible from main nav */}
          <button
            onClick={() => setGlossaryOpen(true)}
            style={navBtnStyle(false)}
            aria-label="פתח מילון מונחים"
          >
            מילון מונחים 📖
          </button>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px' }}>
        {/* ── Home view ── */}
        {view === 'home' && (
          <div>
            {/* Requirement 5.3: daily tip on home screen */}
            <div style={{ marginBottom: '24px' }}>
              <DailyTip />
            </div>

            {/* Requirement 1.1: search bar */}
            <SearchBar
              stockService={stockService}
              onSelectStock={handleSelectStock}
            />
          </div>
        )}

        {/* ── Watchlist view ── */}
        {view === 'watchlist' && (
          <WatchlistView
            stockService={stockService}
            watchlistStore={watchlistStore}
            onSelectStock={handleSelectStock}
          />
        )}

        {/* ── Stock detail view ── */}
        {view === 'detail' && selectedTicker && (
          <div>
            <button
              onClick={() => setView('home')}
              style={{
                background: 'none',
                border: 'none',
                color: '#1565c0',
                cursor: 'pointer',
                marginBottom: '16px',
                fontSize: '0.95rem',
                padding: 0,
              }}
            >
              ← חזור לחיפוש
            </button>
            <StockDetail
              ticker={selectedTicker}
              stockService={stockService}
              watchlistStore={watchlistStore}
            />
          </div>
        )}
      </main>

      {/* ── Glossary panel (slide-in) ── */}
      {glossaryOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setGlossaryOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.3)',
              zIndex: 99,
            }}
            aria-hidden="true"
          />
          <GlossaryPanel onClose={() => setGlossaryOpen(false)} />
        </>
      )}
    </div>
  );
}

function navBtnStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? 'rgba(255,255,255,0.2)' : 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: '4px',
    fontWeight: active ? 'bold' : 'normal',
    fontSize: '0.95rem',
  };
}

export default App;
