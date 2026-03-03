import { useState, useEffect } from "react";
import "./CompetitorComparison.css";

const API_BASE = "http://localhost:5000";

// ── Mock competitor data ──────────────────────────────────────
const COMPETITORS = [
  {
    name: "Spice Garden", avgRating: 3.8, totalReviews: 210, color: "#FBBF24",
    responseRate: 45, priceRange: "₹₹", cuisine: "North Indian",
    trend: [3.6, 3.7, 3.7, 3.8, 3.8, 3.9, 3.8],
    sentiment: { positive: 52, neutral: 28, negative: 20 },
    categories: { Food: 72, Service: 58, Staff: 41, Ambience: 35, Cleanliness: 24 },
    strengths: ["Great ambience", "Fast delivery"], weaknesses: ["Inconsistent food", "High prices"],
    reviewSample: { text: "Great ambience but food quality varies too much.", rating: 3, source: "Google" },
  },
  {
    name: "Bombay Bites", avgRating: 4.1, totalReviews: 178, color: "#A78BFA",
    responseRate: 72, priceRange: "₹₹₹", cuisine: "Multi-cuisine",
    trend: [3.8, 3.9, 4.0, 4.0, 4.1, 4.1, 4.1],
    sentiment: { positive: 63, neutral: 22, negative: 15 },
    categories: { Food: 85, Service: 45, Staff: 30, Ambience: 52, Cleanliness: 38 },
    strengths: ["Consistent quality", "Fast responses"], weaknesses: ["Expensive", "Small portions"],
    reviewSample: { text: "Best biryani in the area. Consistent quality every single time.", rating: 5, source: "Zomato" },
  },
  {
    name: "The Curry House", avgRating: 3.5, totalReviews: 134, color: "#34D399",
    responseRate: 18, priceRange: "₹", cuisine: "South Indian",
    trend: [3.8, 3.7, 3.6, 3.5, 3.5, 3.4, 3.5],
    sentiment: { positive: 44, neutral: 25, negative: 31 },
    categories: { Food: 60, Service: 70, Staff: 55, Ambience: 28, Cleanliness: 42 },
    strengths: ["Affordable", "Authentic taste"], weaknesses: ["Slow service", "Poor hygiene"],
    reviewSample: { text: "Authentic flavors but the service is painfully slow.", rating: 2, source: "Swiggy" },
  },
];

function buildYours(reviews, analytics) {
  if (!reviews || !analytics) return null;
  const s = analytics.sentiment_breakdown || {};
  return {
    name: "Your Restaurant", avgRating: parseFloat(analytics.average_rating) || 3.2,
    totalReviews: reviews.length || 25, color: "#818CF8", isYou: true,
    responseRate: parseFloat(analytics.response_rate_percent) || 12,
    priceRange: "₹₹", cuisine: "Multi-cuisine",
    trend: [3.0, 3.1, 3.0, 3.2, 3.1, 3.2, parseFloat(analytics.average_rating) || 3.2],
    sentiment: { positive: s.positive || 14, neutral: s.neutral || 4, negative: s.negative || 7 },
    categories: analytics.category_breakdown || { Food: 65, Service: 48, Staff: 38, Ambience: 25, Cleanliness: 20 },
    strengths: ["Loyal customer base", "Active on social"], weaknesses: ["Low response rate", "Food consistency"],
    reviewSample: { text: "Food was cold and service needs improvement. Disappointed.", rating: 2, source: "Google" },
  };
}

// ── Sparkline ─────────────────────────────────────────────────
function Sparkline({ data, color, width = 70, height = 26 }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 0.1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  const last = data[data.length - 1], prev = data[data.length - 2];
  const trending = last >= prev;
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 3px ${color}66)` }} />
      <circle cx={(data.length - 1) / (data.length - 1) * width} cy={height - ((last - min) / range) * (height - 4) - 2}
        r="3" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
    </svg>
  );
}

// ── Animated Bar ──────────────────────────────────────────────
function AnimBar({ pct, color, delay = 0, height = 8, glow = true }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), delay); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div style={{ height, background: "rgba(255,255,255,0.07)", borderRadius: height, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: height,
        width: `${w}%`, background: `linear-gradient(90deg,${color},${color}bb)`,
        boxShadow: glow ? `0 0 10px ${color}55` : "none",
        transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
      }} />
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────
function Card({ children, accent = "#818CF8", delay = 0, style = {} }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div className="cc-card" style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(18px)",
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      ...style
    }}>
      <div className="cc-card-shimmer" style={{ background: `linear-gradient(90deg,transparent,${accent}80,transparent)` }} />
      {children}
    </div>
  );
}

// ── CompetitorCard (overview) ─────────────────────────────────
function CompetitorCard({ entity, rank, delay = 0 }) {
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  const total = entity.sentiment.positive + entity.sentiment.neutral + entity.sentiment.negative;
  const posPct = total ? Math.round((entity.sentiment.positive / total) * 100) : 0;
  const negPct = total ? Math.round((entity.sentiment.negative / total) * 100) : 0;
  const last = entity.trend[entity.trend.length - 1];
  const prev = entity.trend[entity.trend.length - 2];
  const trendUp = last >= prev;

  return (
    <div className={`cc-competitor-card ${entity.isYou ? "cc-you" : ""}`}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.45s ease ${delay}ms, transform 0.45s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        borderColor: hov ? `${entity.color}44` : undefined,
        boxShadow: hov ? `0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px ${entity.color}33` : undefined,
      }}>
      {entity.isYou && <div className="cc-you-ribbon">YOU</div>}

      {/* Header */}
      <div className="cc-ccard-header">
        <div className="cc-ccard-rank" style={{ color: entity.color, background: `${entity.color}18`, border: `1px solid ${entity.color}33` }}>
          #{rank}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="cc-ccard-name">{entity.name}</div>
          <div className="cc-ccard-meta">{entity.cuisine} · {entity.priceRange} · {entity.totalReviews} reviews</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div className="cc-ccard-rating" style={{ color: entity.color }}>{entity.avgRating}★</div>
          <div className="cc-ccard-trend" style={{ color: trendUp ? "#34D399" : "#F87171" }}>
            {trendUp ? "↑" : "↓"} trending
          </div>
        </div>
      </div>

      {/* Rating bar */}
      <div style={{ marginBottom: 12 }}>
        <AnimBar pct={(entity.avgRating / 5) * 100} color={entity.color} delay={delay + 200} />
      </div>

      {/* Stats row */}
      <div className="cc-ccard-stats">
        <div className="cc-ccard-stat">
          <div className="cc-ccard-stat-val" style={{ color: "#34D399" }}>{posPct}%</div>
          <div className="cc-ccard-stat-lbl">Positive</div>
        </div>
        <div className="cc-ccard-stat">
          <div className="cc-ccard-stat-val" style={{ color: "#F87171" }}>{negPct}%</div>
          <div className="cc-ccard-stat-lbl">Negative</div>
        </div>
        <div className="cc-ccard-stat">
          <div className="cc-ccard-stat-val" style={{ color: entity.responseRate > 50 ? "#34D399" : "#FBBF24" }}>
            {entity.responseRate}%
          </div>
          <div className="cc-ccard-stat-lbl">Resp. Rate</div>
        </div>
        <div className="cc-ccard-stat">
          <Sparkline data={entity.trend} color={entity.color} />
          <div className="cc-ccard-stat-lbl">7-day trend</div>
        </div>
      </div>

      {/* Strengths/Weaknesses */}
      <div className="cc-sw-row">
        <div className="cc-sw-col">
          {entity.strengths.map(s => (
            <span key={s} className="cc-sw-chip cc-sw-strength">✓ {s}</span>
          ))}
        </div>
        <div className="cc-sw-col">
          {entity.weaknesses.map(w => (
            <span key={w} className="cc-sw-chip cc-sw-weakness">✗ {w}</span>
          ))}
        </div>
      </div>

      {/* Sample review */}
      <div className="cc-ccard-review">
        <div className="cc-ccard-review-stars">
          {"★".repeat(entity.reviewSample.rating)}{"☆".repeat(5 - entity.reviewSample.rating)}
        </div>
        <p className="cc-ccard-review-text">"{entity.reviewSample.text}"</p>
        <span className="cc-ccard-review-source">{entity.reviewSample.source}</span>
      </div>
    </div>
  );
}

// ── RatingBar ─────────────────────────────────────────────────
function RatingBar({ entity, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW((entity.avgRating / 5) * 100), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div className="cc-rbar-row">
      <div className="cc-rbar-meta">
        <div className="cc-rbar-left">
          <div className="cc-rbar-dot" style={{ background: entity.color, boxShadow: `0 0 6px ${entity.color}` }} />
          {entity.isYou && <span className="cc-you-badge">YOU</span>}
          <span className={`cc-rbar-name ${entity.isYou ? "you" : ""}`}>{entity.name}</span>
          <span className="cc-rbar-count">({entity.totalReviews})</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Sparkline data={entity.trend} color={entity.color} width={55} height={20} />
          <span className="cc-rbar-rating" style={{ color: entity.color }}>{entity.avgRating}★</span>
        </div>
      </div>
      <AnimBar pct={w} color={entity.color} delay={0} height={8} />
    </div>
  );
}

// ── SentimentBar ──────────────────────────────────────────────
function SentimentBar({ entity, delay = 0 }) {
  const [w, setW] = useState({ pos: 0, neu: 0, neg: 0 });
  const total = entity.sentiment.positive + entity.sentiment.neutral + entity.sentiment.negative;
  const pos = total > 0 ? Math.round((entity.sentiment.positive / total) * 100) : 0;
  const neu = total > 0 ? Math.round((entity.sentiment.neutral / total) * 100) : 0;
  const neg = 100 - pos - neu;
  useEffect(() => { const x = setTimeout(() => setW({ pos, neu, neg }), delay); return () => clearTimeout(x); }, [delay]);

  return (
    <div className="cc-sbar-row">
      <div className="cc-sbar-meta">
        <div className="cc-rbar-left">
          <div className="cc-rbar-dot" style={{ background: entity.color, boxShadow: `0 0 6px ${entity.color}` }} />
          {entity.isYou && <span className="cc-you-badge">YOU</span>}
          <span className={`cc-rbar-name ${entity.isYou ? "you" : ""}`}>{entity.name}</span>
        </div>
        <div className="cc-sbar-stats">
          <span className="cc-sbar-pos">+{pos}%</span>
          <span className="cc-sbar-neu">{neu}%</span>
          <span className="cc-sbar-neg">−{neg}%</span>
        </div>
      </div>
      <div className="cc-sbar-track">
        <div className="cc-sbar-pos-fill" style={{ width: `${w.pos}%` }} />
        <div className="cc-sbar-neu-fill" style={{ width: `${w.neu}%` }} />
        <div className="cc-sbar-neg-fill" style={{ width: `${w.neg}%` }} />
      </div>
    </div>
  );
}

// ── CategoryBars ──────────────────────────────────────────────
function CategoryBars({ yours, competitors }) {
  const allE = yours ? [yours, ...competitors] : competitors;
  const cats = ["Food", "Service", "Staff", "Ambience", "Cleanliness"];
  const [w, setW] = useState({});
  useEffect(() => {
    const t = setTimeout(() => {
      const nw = {};
      cats.forEach(cat => {
        const mx = Math.max(...allE.map(e => e.categories[cat] || 0), 1);
        allE.forEach(e => { nw[`${e.name}-${cat}`] = ((e.categories[cat] || 0) / mx) * 100; });
      });
      setW(nw);
    }, 300);
    return () => clearTimeout(t);
  }, [yours]);

  return (
    <div>
      {cats.map(cat => (
        <div key={cat} className="cc-cat-group">
          <div className="cc-cat-title">{cat}</div>
          {allE.map(e => (
            <div key={e.name} className="cc-cat-row">
              <div className="cc-cat-dot" style={{ background: e.color, boxShadow: `0 0 5px ${e.color}` }} />
              <span className={`cc-cat-name ${e.isYou ? "you" : ""}`}>{e.isYou ? "You" : e.name}</span>
              <div className="cc-cat-track">
                <div className="cc-cat-fill" style={{
                  width: `${w[`${e.name}-${cat}`] || 0}%`,
                  background: e.isYou ? `linear-gradient(90deg,${e.color},${e.color}99)` : e.color,
                  opacity: e.isYou ? 1 : 0.5,
                  boxShadow: e.isYou ? `0 0 10px ${e.color}44` : "none",
                }} />
              </div>
              <span className={`cc-cat-count ${e.isYou ? "you" : ""}`} style={{ color: e.color, opacity: e.isYou ? 1 : 0.65 }}>
                {e.categories[cat] || 0}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Response Rate Comparison ──────────────────────────────────
function ResponseRateComp({ all }) {
  return (
    <div>
      {[...all].sort((a, b) => b.responseRate - a.responseRate).map((e, i) => (
        <div key={e.name} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: e.color, boxShadow: `0 0 5px ${e.color}` }} />
              {e.isYou && <span className="cc-you-badge">YOU</span>}
              <span style={{ fontSize: 13, fontWeight: e.isYou ? 700 : 500, color: e.isYou ? "#e2e8f8" : "#8899bb" }}>{e.name}</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: e.responseRate > 50 ? "#34D399" : e.responseRate > 25 ? "#FBBF24" : "#F87171" }}>
              {e.responseRate}%
            </span>
          </div>
          <AnimBar pct={e.responseRate} color={e.responseRate > 50 ? "#34D399" : e.responseRate > 25 ? "#FBBF24" : "#F87171"} delay={i * 100} />
        </div>
      ))}
      <div className="cc-insight bad" style={{ marginTop: 8 }}>
        <span>⚠️</span>
        <span>Industry benchmark is 60%+ response rate. Responding to reviews boosts trust and ranking.</span>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
const TABS = ["Overview", "Rating", "Sentiment", "Categories", "Response Rate"];

export default function CompetitorComparison() {
  const [yours,   setYours]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tab,     setTab]     = useState("Overview");

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/reviews`).then(r => r.json()),
      fetch(`${API_BASE}/api/analytics`).then(r => r.json()),
    ]).then(([rv, an]) => {
      setYours(buildYours(rv.reviews || [], an.analytics || {}));
      setLoading(false);
    }).catch(() => {
      setYours(buildYours(Array(25).fill({}), {
        average_rating: 3.2, response_rate_percent: 12,
        sentiment_breakdown: { positive: 14, neutral: 4, negative: 7 },
        category_breakdown: { Food: 65, Service: 48, Staff: 38, Ambience: 25, Cleanliness: 20 },
      }));
      setLoading(false);
    });
  }, []);

  const all = yours ? [yours, ...COMPETITORS] : COMPETITORS;
  const sorted = [...all].sort((a, b) => b.avgRating - a.avgRating);
  const yourRank = sorted.findIndex(e => e.isYou) + 1;
  const leader = sorted[0];

  // Insights
  const insights = [];
  if (yours) {
    insights.push({
      text: yourRank === 1
        ? "You have the highest average rating among all compared restaurants."
        : `You rank #${yourRank} of ${sorted.length}. ${leader.name} leads at ${leader.avgRating}★.`,
      good: yourRank === 1,
    });
    const yt = yours.sentiment.positive + yours.sentiment.neutral + yours.sentiment.negative;
    const yn = yt > 0 ? Math.round((yours.sentiment.negative / yt) * 100) : 0;
    const cn = Math.round(COMPETITORS.reduce((s, c) => {
      const t = c.sentiment.positive + c.sentiment.neutral + c.sentiment.negative;
      return s + (c.sentiment.negative / t) * 100;
    }, 0) / COMPETITORS.length);
    insights.push({
      text: yn < cn
        ? `Your negative rate (${yn}%) beats the competitor average of ${cn}%.`
        : `Your negative rate (${yn}%) exceeds the competitor average of ${cn}%. Room to improve.`,
      good: yn < cn,
    });
    if (yours.responseRate < 30) {
      insights.push({ text: `Your response rate (${yours.responseRate}%) is far below the leader (${Math.max(...COMPETITORS.map(c => c.responseRate))}%). Respond more to boost ranking.`, good: false });
    }
  }

  return (
    <div className="cc">
      <div className="cc-blob-1" /><div className="cc-blob-2" /><div className="cc-blob-3" />
      <div className="cc-inner">

        {/* Header */}
        <div className="cc-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div className="cc-badge">
                <span className="cc-badge-icon">🏆</span>
                <span className="cc-badge-text">Market Intelligence</span>
              </div>
              <h1 className="cc-title">Competitor Comparison</h1>
              <p className="cc-subtitle">Your performance vs nearby competitors · Competitor data is simulated</p>
            </div>
            {/* Summary stats */}
            {yours && (
              <div className="cc-header-stats">
                {[
                  { label: "Your Rank", value: `#${yourRank}/${sorted.length}`, color: yourRank === 1 ? "#34D399" : "#FBBF24" },
                  { label: "Market Leader", value: `${leader.avgRating}★`, color: leader.color },
                  { label: "Your Rating", value: `${yours.avgRating}★`, color: yours.color },
                  { label: "Gap to Leader", value: (leader.avgRating - yours.avgRating).toFixed(1), color: "#F87171" },
                ].map(s => (
                  <div key={s.label} className="cc-hs-item">
                    <div className="cc-hs-value" style={{ color: s.color }}>{s.value}</div>
                    <div className="cc-hs-label">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && <div className="cc-error">⚠️ {error}</div>}
        {loading && !error && (
          <div className="cc-loader-wrap">
            <div className="cc-spinner" />
            <div className="cc-loader-text">Loading market data…</div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Legend */}
            <div className="cc-legend">
              {all.map(e => (
                <div key={e.name} className="cc-legend-item">
                  <div className="cc-legend-dot" style={{ background: e.color, boxShadow: `0 0 5px ${e.color}` }} />
                  <span className={`cc-legend-label ${e.isYou ? "you" : ""}`}>{e.name}{e.isYou ? " (You)" : ""}</span>
                </div>
              ))}
            </div>

            {/* Insights */}
            {insights.length > 0 && (
              <div className="cc-insights">
                {insights.map((ins, i) => (
                  <div key={i} className={`cc-insight ${ins.good ? "good" : "bad"}`}>
                    <span>{ins.good ? "✅" : "⚠️"}</span>
                    <span>{ins.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div className="cc-tabs">
              {TABS.map(t => (
                <button key={t} className={`cc-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
              ))}
            </div>

            {/* ── OVERVIEW ── */}
            {tab === "Overview" && (
              <div className="cc-overview-grid">
                {sorted.map((e, i) => (
                  <CompetitorCard key={e.name} entity={e} rank={i + 1} delay={i * 100} />
                ))}
              </div>
            )}

            {/* ── RATING ── */}
            {tab === "Rating" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Card accent="#818CF8" delay={0}>
                  <div className="cc-section-title">Average Rating</div>
                  <div className="cc-section-sub">Out of 5 stars · higher is better · with 7-day trend</div>
                  {sorted.map((e, i) => <RatingBar key={e.name} entity={e} delay={i * 110} />)}
                  <div className={`cc-rating-insight ${yourRank === 1 ? "good" : "warn"}`}>
                    {yourRank === 1 ? "🏆 You lead with the highest rating! Keep it up."
                      : `📊 ${leader.name} leads at ${leader.avgRating}★. You're at ${yours?.avgRating}★ — a gap of ${(leader.avgRating - (yours?.avgRating||0)).toFixed(1)} stars.`}
                  </div>
                </Card>

                {/* Monthly trend table */}
                <Card accent="#FBBF24" delay={200}>
                  <div className="cc-section-title" style={{ marginBottom: 4 }}>Rating Trend (7 Days)</div>
                  <div className="cc-section-sub">Day-by-day rating movement per competitor</div>
                  <div className="cc-trend-table">
                    <div className="cc-trend-header">
                      <div className="cc-trend-cell cc-trend-name-cell">Restaurant</div>
                      {["D-6","D-5","D-4","D-3","D-2","Yesterday","Today"].map(d => (
                        <div key={d} className="cc-trend-cell cc-trend-day">{d}</div>
                      ))}
                    </div>
                    {sorted.map(e => (
                      <div key={e.name} className={`cc-trend-row ${e.isYou ? "you" : ""}`}>
                        <div className="cc-trend-cell cc-trend-name-cell">
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: e.color, flexShrink: 0 }} />
                          <span>{e.isYou ? "You" : e.name}</span>
                        </div>
                        {e.trend.map((v, i) => {
                          const prev = e.trend[i - 1];
                          const dir = prev === undefined ? null : v > prev ? "up" : v < prev ? "down" : "flat";
                          return (
                            <div key={i} className="cc-trend-cell" style={{ color: e.color, fontWeight: 700 }}>
                              {v}
                              {dir === "up" && <span style={{ color: "#34D399", fontSize: 9 }}> ↑</span>}
                              {dir === "down" && <span style={{ color: "#F87171", fontSize: 9 }}> ↓</span>}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ── SENTIMENT ── */}
            {tab === "Sentiment" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Card accent="#34D399" delay={0}>
                  <div className="cc-section-title">Sentiment Breakdown</div>
                  <div className="cc-sent-legend">
                    {[["#34D399","Positive"],["rgba(255,255,255,0.15)","Neutral"],["#F87171","Negative"]].map(([c, l]) => (
                      <div key={l} className="cc-sent-legend-item">
                        <div className="cc-sent-legend-dot" style={{ background: c }} />{l}
                      </div>
                    ))}
                  </div>
                  {sorted.map((e, i) => <SentimentBar key={e.name} entity={e} delay={i * 110} />)}
                </Card>

                {/* Sentiment score cards */}
                <div className="cc-sentiment-cards">
                  {sorted.map((e, i) => {
                    const total = e.sentiment.positive + e.sentiment.neutral + e.sentiment.negative;
                    const score = total ? Math.round(((e.sentiment.positive - e.sentiment.negative) / total) * 100) : 0;
                    return (
                      <Card key={e.name} accent={e.color} delay={i * 80}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>
                              {e.isYou ? "Your Restaurant" : e.name}
                            </div>
                            {e.isYou && <span className="cc-you-badge">YOU</span>}
                          </div>
                          <div style={{ fontSize: 24, fontWeight: 800, color: score >= 0 ? "#34D399" : "#F87171" }}>
                            {score > 0 ? "+" : ""}{score}
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: "#6b7fa3", marginBottom: 8 }}>Net Sentiment Score</div>
                        <AnimBar pct={Math.max(0, Math.min(100, score + 50))} color={score >= 0 ? "#34D399" : "#F87171"} delay={i * 80 + 300} />
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "#6b7fa3" }}>
                          <span style={{ color: "#34D399" }}>👍 {e.sentiment.positive}</span>
                          <span>😐 {e.sentiment.neutral}</span>
                          <span style={{ color: "#F87171" }}>👎 {e.sentiment.negative}</span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── CATEGORIES ── */}
            {tab === "Categories" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Card accent="#A78BFA" delay={0}>
                  <div className="cc-section-title">Category-wise Complaints</div>
                  <div className="cc-section-sub">Number of reviews per complaint category · lower is better</div>
                  <CategoryBars yours={yours} competitors={COMPETITORS} />
                </Card>

                {/* Category win/loss summary */}
                <Card accent="#F472B6" delay={200}>
                  <div className="cc-section-title" style={{ marginBottom: 4 }}>Category Win / Loss vs Competitors</div>
                  <div className="cc-section-sub">Where you rank best and worst per category</div>
                  <div className="cc-winloss-grid">
                    {["Food","Service","Staff","Ambience","Cleanliness"].map(cat => {
                      const catSorted = sorted.slice().sort((a, b) => (a.categories[cat] || 0) - (b.categories[cat] || 0));
                      const yourPos = catSorted.findIndex(e => e.isYou) + 1;
                      const best = catSorted[0];
                      const isWin = yourPos === 1;
                      return (
                        <div key={cat} className={`cc-wl-item ${isWin ? "win" : "loss"}`}>
                          <div className="cc-wl-cat">{cat}</div>
                          <div className="cc-wl-rank" style={{ color: isWin ? "#34D399" : "#F87171" }}>
                            #{yourPos}
                          </div>
                          <div className="cc-wl-label" style={{ color: isWin ? "#34D399" : "#F87171" }}>
                            {isWin ? "BEST" : `Best: ${best.isYou ? "You" : best.name}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}

            {/* ── RESPONSE RATE ── */}
            {tab === "Response Rate" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Card accent="#22D3EE" delay={0}>
                  <div className="cc-section-title">Response Rate Comparison</div>
                  <div className="cc-section-sub">% of reviews that received a reply · 60%+ is industry benchmark</div>
                  <ResponseRateComp all={sorted} />
                </Card>

                {/* Why it matters */}
                <Card accent="#818CF8" delay={200}>
                  <div className="cc-section-title" style={{ marginBottom: 14 }}>Why Response Rate Matters</div>
                  <div className="cc-why-grid">
                    {[
                      { icon: "📈", stat: "18%", desc: "Average rating improvement when response rate exceeds 75%" },
                      { icon: "💼", stat: "33%", desc: "More likely to re-visit when negative reviews are acknowledged" },
                      { icon: "🔍", stat: "Top 3", desc: "Google ranks responsive restaurants higher in local search" },
                      { icon: "⭐", stat: "0.5★", desc: "Average rating boost from consistent review responses" },
                    ].map((w, i) => (
                      <div key={i} className="cc-why-card">
                        <div className="cc-why-icon">{w.icon}</div>
                        <div className="cc-why-stat">{w.stat}</div>
                        <div className="cc-why-desc">{w.desc}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}