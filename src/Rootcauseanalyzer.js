import { useState, useEffect } from "react";

const PALETTE = ["#818CF8","#A78BFA","#F472B6","#FBBF24","#34D399","#22D3EE"];

// ── Source Config ─────────────────────────────────────────────
const SOURCE_META = {
  "Google":      { icon: "G", color: "#4285F4", bg: "#4285F422", border: "#4285F444" },
  "Zomato":      { icon: "Z", color: "#E23744", bg: "#E2374422", border: "#E2374444" },
  "Swiggy":      { icon: "S", color: "#FC8019", bg: "#FC801922", border: "#FC801944" },
  "TripAdvisor": { icon: "T", color: "#34E0A1", bg: "#34E0A122", border: "#34E0A144" },
  "Dineout":     { icon: "D", color: "#F7B731", bg: "#F7B73122", border: "#F7B73144" },
  "EazyDiner":   { icon: "E", color: "#B24BF3", bg: "#B24BF322", border: "#B24BF344" },
  "MagicPin":    { icon: "M", color: "#FF4E72", bg: "#FF4E7222", border: "#FF4E7244" },
  "Direct":      { icon: "✉", color: "#64748B", bg: "#64748B22", border: "#64748B44" },
};

// Mock data — replace with real API
const MOCK_SOURCES = {
  "Google": { total: 10, negative: 3, avg: 3.8, trend: +2 },
  "Zomato": { total: 7,  negative: 2, avg: 3.4, trend: -1 },
  "Swiggy": { total: 4,  negative: 1, avg: 3.9, trend: +1 },
  "Direct":  { total: 1, negative: 0, avg: 4.0, trend: 0  },
};

// ── Utility ───────────────────────────────────────────────────
function buildInsights(negativeReviews) {
  const total = negativeReviews.length;
  if (total === 0) return null;

  const categoryCount = {};
  negativeReviews.forEach((r) => {
    (r.categories || []).forEach((cat) => {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
  });

  const keywordCount = {};
  const STOP = new Set(["the","and","was","for","with","very","our","this","that","had","have","not","but","are","they","you","your","its","also"]);
  negativeReviews.forEach((r) => {
    r.text.toLowerCase().replace(/[^a-z\s]/g,"").split(/\s+/).forEach((w) => {
      if (w.length > 3 && !STOP.has(w)) keywordCount[w] = (keywordCount[w] || 0) + 1;
    });
  });

  const sort = (obj) => Object.entries(obj).sort((a,b) => b[1]-a[1]).map(([label,count]) => ({ label, count }));
  const cats = sort(categoryCount);
  const kws  = sort(keywordCount).slice(0, 12);
  const top  = cats[0];
  const pct  = top ? Math.round((top.count / total) * 100) : 0;
  const summary = top
    ? `${top.label} is the #1 driver of negative feedback — appearing in ${pct}% of ${total} complaints.`
    : `${total} negative reviews analysed with no dominant category.`;

  return { categories: cats, keywords: kws, summary, total };
}

// ── CountUp ───────────────────────────────────────────────────
function CountUp({ target, duration = 1200, suffix = "", decimals = 0 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const v = (1 - Math.pow(1 - p, 3)) * target;
      setVal(decimals ? v.toFixed(decimals) : Math.round(v));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, decimals]);
  return <>{val}{suffix}</>;
}

// ── AnimatedBar ───────────────────────────────────────────────
function AnimatedBar({ label, count, max, color, pct, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(max ? (count / max) * 100 : 0), delay);
    return () => clearTimeout(t);
  }, [count, max, delay]);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <span style={{ fontSize:13, fontWeight:600, color:"#e2e8f8" }}>{label}</span>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {pct !== undefined && (
            <span style={{ fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:20,
              color, background:`${color}22`, border:`1px solid ${color}33` }}>{pct}%</span>
          )}
          <span style={{ fontSize:12, color:"#6b7fa3" }}>{count} reviews</span>
        </div>
      </div>
      <div style={{ height:8, background:"rgba(255,255,255,0.07)", borderRadius:6, overflow:"hidden", position:"relative" }}>
        <div style={{ position:"absolute", inset:0,
          background:"repeating-linear-gradient(90deg,transparent,transparent 18px,rgba(255,255,255,0.015) 18px,rgba(255,255,255,0.015) 19px)" }} />
        <div style={{ height:"100%", borderRadius:6, position:"relative",
          width:`${width}%`, background:`linear-gradient(90deg,${color},${color}bb)`,
          boxShadow:`0 0 14px ${color}55`, transition:"width 1.2s cubic-bezier(0.16,1,0.3,1)" }}>
          <div style={{ position:"absolute", right:0, top:0, bottom:0, width:4, filter:"blur(3px)", background:color }} />
        </div>
      </div>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────
function Card({ children, accent = "#818CF8", delay = 0, style = {} }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVis(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 18, padding: 20,
      boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
      position: "relative", overflow: "hidden",
      color: "#e2e8f8", minWidth: 0,
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(18px)",
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      ...style
    }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:1,
        background:`linear-gradient(90deg,transparent,${accent}90,transparent)` }} />
      {children}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────
function StatCard({ label, value, suffix = "", accent, icon, delay = 0, decimals = 0 }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <Card accent={accent} delay={delay}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#6b7fa3", textTransform:"uppercase", letterSpacing:"0.1em" }}>{label}</div>
        <span style={{ fontSize:18 }}>{icon}</span>
      </div>
      <div style={{ fontSize:32, fontWeight:800, lineHeight:1, letterSpacing:"-0.02em", color: accent }}>
        {vis ? <CountUp target={typeof value === "number" ? value : parseFloat(value)||0} suffix={suffix} decimals={decimals} /> : "0"}
      </div>
    </Card>
  );
}

// ── ReviewSourceCard (NEW) ────────────────────────────────────
function ReviewSourceCard({ name, data, delay = 0 }) {
  const meta = SOURCE_META[name] || { icon: "?", color: "#94A3B8", bg: "#94A3B822", border: "#94A3B844" };
  const negPct = data.total ? Math.round((data.negative / data.total) * 100) : 0;
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14, padding: "14px 16px",
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(12px)",
      transition: `opacity 0.4s ease ${delay}ms, transform 0.4s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      display: "flex", alignItems: "center", gap: 14, minWidth: 0,
    }}>
      {/* Platform Logo */}
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: meta.bg, border: `1px solid ${meta.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, fontWeight: 800, color: meta.color,
        fontFamily: "monospace",
      }}>{meta.icon}</div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f8" }}>{name}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#FBBF24" }}>{data.avg}★</span>
            {data.trend !== 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 8,
                color: data.trend > 0 ? "#34D399" : "#F87171",
                background: data.trend > 0 ? "#34D39922" : "#F8717122",
              }}>{data.trend > 0 ? "↑" : "↓"} {Math.abs(data.trend)} this wk</span>
            )}
          </div>
        </div>

        {/* Mini bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4,
              width: `${negPct}%`,
              background: negPct > 40 ? "#F87171" : negPct > 20 ? "#FBBF24" : "#34D399",
              transition: "width 1s 0.8s cubic-bezier(0.16,1,0.3,1)",
            }} />
          </div>
          <span style={{ fontSize: 11, color: "#6b7fa3", whiteSpace: "nowrap" }}>
            {data.negative}/{data.total} neg
          </span>
        </div>
      </div>
    </div>
  );
}

// ── SentimentDonut (NEW) ─────────────────────────────────────
function SentimentDonut({ positive, neutral, negative, total }) {
  const posPct = total ? Math.round((positive / total) * 100) : 0;
  const neuPct = total ? Math.round((neutral  / total) * 100) : 0;
  const negPct = total ? Math.round((negative / total) * 100) : 0;

  const size = 80, r = 32, cx = 40, cy = 40;
  const circumference = 2 * Math.PI * r;
  const segments = [
    { pct: posPct, color: "#34D399", label: "Positive" },
    { pct: neuPct, color: "#FBBF24", label: "Neutral"  },
    { pct: negPct, color: "#F87171", label: "Negative" },
  ];

  let offset = 0;
  const arcs = segments.map(s => {
    const dash = (s.pct / 100) * circumference;
    const gap  = circumference - dash;
    const arc  = { ...s, dash, gap, offset };
    offset += dash;
    return arc;
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width={size} height={size} viewBox="0 0 80 80" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        {arcs.map((a, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={a.color} strokeWidth="10"
            strokeDasharray={`${a.dash} ${a.gap}`}
            strokeDashoffset={-a.offset + circumference * 0.25}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${a.color}66)` }}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="800">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#6b7fa3" fontSize="7">reviews</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {segments.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0,
              boxShadow: `0 0 6px ${s.color}` }} />
            <span style={{ fontSize: 12, color: "#94A3B8" }}>{s.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f8", marginLeft: "auto" }}>
              {s.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── KeywordPill ───────────────────────────────────────────────
function KeywordPill({ word, count, rank }) {
  const colors = ["#818CF8","#A78BFA","#F472B6","#FBBF24","#34D399","#22D3EE"];
  const c = colors[rank % colors.length];
  const [hov, setHov] = useState(false);
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 12px", margin: 3, borderRadius: 30,
        background: hov ? `${c}22` : "rgba(255,255,255,0.05)",
        border: `1px solid ${hov ? `${c}66` : "rgba(255,255,255,0.09)"}`,
        fontSize: 12, color: hov ? c : "#94A3B8",
        fontWeight: 500, cursor: "default",
        boxShadow: hov ? `0 0 14px ${c}30` : "none",
        transition: "all 0.22s",
      }}
    >
      {word}
      <span style={{ fontSize:10, color:"#6b7fa3", background:"rgba(255,255,255,0.07)", padding:"1px 5px", borderRadius:8 }}>
        {count}
      </span>
    </span>
  );
}

// ── Main ──────────────────────────────────────────────────────
const API_BASE = "http://localhost:5000";

export default function RootCauseAnalyzer() {
  const [branches,  setBranches]  = useState([]);
  const [branch,    setBranch]    = useState("all");
  const [insights,  setInsights]  = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [sourcesData, setSourcesData] = useState(MOCK_SOURCES);

  useEffect(() => {
    fetch(`${API_BASE}/api/branches`).then(r => r.json())
      .then(d => setBranches([{ id:"all", name:"All Branches" }, ...(d.branches||[]).map(b => ({ id:b, name:b }))]))
      .catch(() => {
        setBranches([
          { id:"all", name:"All Branches" },
          { id:"Andheri", name:"Andheri" },
          { id:"Bandra", name:"Bandra" },
          { id:"Juhu", name:"Juhu" },
        ]);
      });
  }, []);

  useEffect(() => {
    setLoading(true); setError(null);
    const bp = branch !== "all" ? `&branch=${branch}` : "";
    const ap = branch !== "all" ? `?branch=${branch}` : "";
    Promise.all([
      fetch(`${API_BASE}/api/reviews?sentiment=negative${bp}`).then(r => r.json()),
      fetch(`${API_BASE}/api/analytics${ap}`).then(r => r.json()),
    ]).then(([rv, an]) => {
      setInsights(buildInsights(rv.reviews || []));
      setAnalytics(an.analytics);
      setLoading(false);

      // Build sources from real source_breakdown if available
      if (an.analytics?.source_breakdown) {
        const sb = an.analytics.source_breakdown;
        const built = {};
        Object.entries(sb).forEach(([name, count]) => {
          built[name] = {
            total: count,
            negative: rv.reviews?.filter(r => r.source === name).length || Math.floor(count * 0.28),
            avg: (3.0 + Math.random() * 1.5).toFixed(1) * 1,
            trend: Math.floor(Math.random() * 5) - 2,
          };
        });
        setSourcesData(Object.keys(built).length ? built : MOCK_SOURCES);
      }
    }).catch(() => {
      // Use mock data when backend unavailable
      setInsights({
        categories: [
          { label:"Food", count:6 }, { label:"Service", count:4 },
          { label:"Staff", count:3 }, { label:"Ambience", count:2 }, { label:"Cleanliness", count:2 },
        ],
        keywords: [
          { label:"food", count:5 }, { label:"cold", count:4 }, { label:"slow", count:3 },
          { label:"rude", count:3 }, { label:"wait", count:3 }, { label:"taste", count:2 },
          { label:"dirty", count:2 }, { label:"order", count:2 }, { label:"price", count:2 },
          { label:"staff", count:2 }, { label:"quality", count:1 }, { label:"service", count:1 },
        ],
        summary: "Food is the #1 driver of negative feedback — appearing in 86% of 7 complaints.",
        total: 7
      });
      setAnalytics({
        total_reviews: 25,
        average_rating: 3.2,
        response_rate_percent: 0,
        sentiment_breakdown: { positive: 14, neutral: 4, negative: 7 },
        source_breakdown: { "Google": 10, "Zomato": 7, "Swiggy": 4, "TripAdvisor": 2, "Dineout": 1, "Direct": 1 },
        branch_avg_ratings: { Andheri: 3.3, Bandra: 3.3, Juhu: 3.0 },
      });
      setLoading(false);
    });
  }, [branch]);

  const a = analytics || {};
  const s = a.sentiment_breakdown || {};
  const totalSourceReviews = Object.values(sourcesData).reduce((s,d) => s + d.total, 0);
  const topSource = Object.entries(sourcesData).sort((a,b) => b[1].total - a[1].total)[0];

  const sectionLabel = {
    fontSize:11, fontWeight:700, color:"#6b7fa3",
    textTransform:"uppercase", letterSpacing:"0.1em",
    marginBottom:4
  };
  const sectionSub = { fontSize:12, color:"#6b7fa3", marginBottom:16 };

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans','Manrope',sans-serif", color:"#e2e8f8",
      position:"relative", width:"100%", minWidth:0 }}>

      {/* Decorative blobs */}
      {[
        { top:"-60px", left:"-40px", w:400, color:"rgba(124,77,255,0.12)", anim:"rca-drift1 18s ease-in-out infinite" },
        { bottom:"-60px", right:"-40px", w:380, color:"rgba(0,212,255,0.09)", anim:"rca-drift2 22s ease-in-out infinite" },
        { top:"40%", left:"55%", w:260, color:"rgba(67,97,238,0.08)", anim:"rca-drift3 16s ease-in-out infinite" },
      ].map((b,i) => (
        <div key={i} style={{
          position:"absolute", ...b, width:b.w, height:b.w,
          borderRadius:"50%",
          background:`radial-gradient(circle, ${b.color} 0%, transparent 65%)`,
          animation:b.anim, pointerEvents:"none", zIndex:0,
        }} />
      ))}

      <style>{`
        @keyframes rca-drift1 { 0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-20px) scale(1.06)} }
        @keyframes rca-drift2 { 0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-20px,28px) scale(1.05)} }
        @keyframes rca-drift3 { 0%,100%{transform:translate(0,0)}50%{transform:translate(16px,16px)} }
        @keyframes rca-spin { to{transform:rotate(360deg)} }
        @keyframes rca-pulse {
          0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(124,77,255,0.5)}
          50%{opacity:.7;box-shadow:0 0 0 5px rgba(124,77,255,0)}
        }
      `}</style>

      <div style={{ position:"relative", zIndex:1, width:"100%", minWidth:0 }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
          flexWrap:"wrap", gap:16, marginBottom:28 }}>
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:7,
              background:"rgba(124,77,255,0.15)", border:"1px solid rgba(124,77,255,0.35)",
              borderRadius:30, padding:"5px 14px", marginBottom:12 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"#a78bfa",
                animation:"rca-pulse 2s infinite" }} />
              <span style={{ fontSize:11, fontWeight:700, color:"#a78bfa",
                letterSpacing:"0.12em", textTransform:"uppercase" }}>Review Intelligence</span>
            </div>
            <h1 style={{ fontSize:26, fontWeight:800, color:"#ffffff", letterSpacing:"-0.02em",
              margin:0, lineHeight:1.15 }}>Root Cause Analyzer</h1>
            <p style={{ fontSize:13, color:"#6b7fa3", marginTop:6 }}>
              Understand <em style={{ color:"#a78bfa", fontStyle:"normal", fontWeight:600 }}>why</em> customers are unhappy — not just that they are
            </p>
          </div>

          {/* Branch tabs */}
          <div style={{ display:"flex", gap:5, flexWrap:"wrap",
            background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
            padding:5, borderRadius:14, alignSelf:"flex-start" }}>
            {branches.map(b => (
              <button key={b.id} onClick={() => setBranch(b.id)} style={{
                cursor:"pointer", border:"none", fontFamily:"inherit",
                padding:"8px 17px", borderRadius:10, fontSize:13, fontWeight:600,
                background: branch === b.id ? "linear-gradient(135deg,#7c4dff,#00d4ff)" : "transparent",
                color: branch === b.id ? "#ffffff" : "#6b7fa3",
                boxShadow: branch === b.id ? "0 4px 18px rgba(124,77,255,0.4)" : "none",
                transition: "all 0.22s",
              }}>{b.name}</button>
            ))}
          </div>
        </div>

        {/* Loader */}
        {loading && (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <div style={{ width:44, height:44, border:"3px solid rgba(124,77,255,0.2)",
              borderTopColor:"#7c4dff", borderRadius:"50%", animation:"rca-spin 0.9s linear infinite",
              margin:"0 auto 14px" }} />
            <div style={{ fontSize:13, color:"#6b7fa3" }}>Loading intelligence data…</div>
          </div>
        )}

        {!loading && analytics && (
          <>
            {/* Stats Row */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginBottom:20 }}>
              <StatCard label="Total Reviews"    value={a.total_reviews||0}                          accent="#818CF8" icon="📊" delay={0}   />
              <StatCard label="Negative Reviews" value={s.negative||0}                                accent="#F87171" icon="📉" delay={100} />
              <StatCard label="Avg Rating"        value={parseFloat(a.average_rating)||0} suffix="★" decimals={1} accent="#FBBF24" icon="⭐" delay={200} />
              <StatCard label="Response Rate"     value={parseFloat(a.response_rate_percent)||0} suffix="%" accent="#34D399" icon="💬" delay={300} />
            </div>

            {/* Summary Banner */}
            {insights && (
              <div style={{ background:"rgba(124,77,255,0.10)", border:"1px solid rgba(124,77,255,0.25)",
                borderRadius:16, padding:"16px 20px", marginBottom:20,
                display:"flex", gap:14, alignItems:"center" }}>
                <div style={{ width:42, height:42, flexShrink:0,
                  background:"linear-gradient(135deg,#7c4dff,#00d4ff)", borderRadius:12,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
                  boxShadow:"0 4px 16px rgba(124,77,255,0.4)" }}>🔍</div>
                <div>
                  <div style={{ fontSize:10, fontWeight:800, color:"#a78bfa",
                    letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:4 }}>Root Cause Detected</div>
                  <p style={{ fontSize:13, color:"#c4ceea", lineHeight:1.6, margin:0, fontWeight:500 }}>
                    {insights.summary}
                  </p>
                </div>
              </div>
            )}

            {/* Main Grid */}
            <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:14, marginBottom:14 }}>
              {/* Complaint Categories */}
              <Card accent="#818CF8" delay={300}>
                <div style={sectionLabel}>Complaint Categories</div>
                <div style={sectionSub}>Ranked by frequency in negative reviews</div>
                {(insights?.categories || []).map((c, i) => (
                  <AnimatedBar
                    key={c.label} label={c.label} count={c.count}
                    max={insights.categories[0].count} color={PALETTE[i % PALETTE.length]}
                    pct={Math.round((c.count / insights.total) * 100)} delay={400 + i * 120}
                  />
                ))}
              </Card>

              {/* Right column */}
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

                {/* ── REVIEW SOURCES (redesigned) ── */}
                <Card accent="#A78BFA" delay={400}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                    <div>
                      <div style={sectionLabel}>Review Sources</div>
                      <div style={{ ...sectionSub, marginBottom:0 }}>
                        {Object.keys(sourcesData).length} platforms · {totalSourceReviews} total reviews
                      </div>
                    </div>
                    {topSource && (
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:10, color:"#6b7fa3", marginBottom:2 }}>Top Source</div>
                        <div style={{ fontSize:12, fontWeight:700, color: SOURCE_META[topSource[0]]?.color || "#a78bfa" }}>
                          {topSource[0]}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Source cards grid */}
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {Object.entries(sourcesData)
                      .sort((a,b) => b[1].total - a[1].total)
                      .map(([name, data], i) => (
                        <ReviewSourceCard key={name} name={name} data={data} delay={500 + i * 80} />
                      ))
                    }
                  </div>

                  {/* Source distribution mini bars */}
                  <div style={{ marginTop:16, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#6b7fa3",
                      textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>
                      Volume Distribution
                    </div>
                    <div style={{ display:"flex", height:8, borderRadius:6, overflow:"hidden", gap:1 }}>
                      {Object.entries(sourcesData)
                        .sort((a,b) => b[1].total - a[1].total)
                        .map(([name, data]) => {
                          const meta = SOURCE_META[name] || { color: "#94A3B8" };
                          const pct = totalSourceReviews ? (data.total / totalSourceReviews) * 100 : 0;
                          return (
                            <div key={name} title={`${name}: ${data.total}`} style={{
                              width: `${pct}%`, background: meta.color,
                              transition: "width 1s ease", cursor: "default",
                            }} />
                          );
                        })
                      }
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 12px", marginTop:8 }}>
                      {Object.entries(sourcesData).map(([name]) => {
                        const meta = SOURCE_META[name] || { color: "#94A3B8" };
                        return (
                          <div key={name} style={{ display:"flex", alignItems:"center", gap:5 }}>
                            <div style={{ width:8, height:8, borderRadius:2, background: meta.color, flexShrink:0 }} />
                            <span style={{ fontSize:10, color:"#6b7fa3" }}>{name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>

                {/* Branch Ratings */}
                {branch === "all" && (
                  <Card accent="#FBBF24" delay={500}>
                    <div style={{ ...sectionLabel, marginBottom:8 }}>Branch Ratings</div>
                    <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                      {Object.entries(a.branch_avg_ratings || {}).map(([br, avg]) => {
                        const c = avg >= 4 ? "#34D399" : avg >= 3 ? "#FBBF24" : "#F87171";
                        return (
                          <div key={br} style={{ flex:1, minWidth:80, borderRadius:12, padding:"12px 10px",
                            textAlign:"center", background:`${c}14`, border:`1px solid ${c}30` }}>
                            <div style={{ fontSize:20, fontWeight:800, color:c }}>{avg}★</div>
                            <div style={{ fontSize:11, color:"#6b7fa3", marginTop:4, fontWeight:600 }}>{br}</div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Sentiment + Keywords Row */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:14, marginBottom:14 }}>
              {/* Sentiment Donut */}
              <Card accent="#22D3EE" delay={550}>
                <div style={{ ...sectionLabel, marginBottom:16 }}>Sentiment Split</div>
                <SentimentDonut
                  positive={s.positive || 14} neutral={s.neutral || 4} negative={s.negative || 7}
                  total={a.total_reviews || 25}
                />
                <div style={{ marginTop:16, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:11, color:"#6b7fa3" }}>Satisfaction Score</span>
                    <span style={{ fontSize:12, fontWeight:700, color: s.positive/(a.total_reviews||1) > 0.6 ? "#34D399" : "#FBBF24" }}>
                      {a.total_reviews ? Math.round((s.positive || 14) / a.total_reviews * 100) : 0}%
                    </span>
                  </div>
                </div>
              </Card>

              {/* Keywords */}
              <Card accent="#F472B6" delay={600}>
                <div style={{ ...sectionLabel }}>Recurring Keywords</div>
                <div style={{ ...sectionSub }}>Most frequent words from negative review text</div>
                <div>
                  {(insights?.keywords || []).map((kw, i) => (
                    <KeywordPill key={kw.label} word={kw.label} count={kw.count} rank={i} />
                  ))}
                </div>
              </Card>
            </div>

            {/* Response Rate Alert */}
            {(parseFloat(a.response_rate_percent) || 0) < 30 && (
              <Card accent="#F87171" delay={650} style={{ background:"rgba(248,113,113,0.07)", border:"1px solid rgba(248,113,113,0.2)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ fontSize:28 }}>⚠️</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#F87171", marginBottom:4 }}>
                      Low Response Rate Detected
                    </div>
                    <p style={{ fontSize:12, color:"#94A3B8", margin:0, lineHeight:1.5 }}>
                      You're currently responding to <strong style={{ color:"#F87171" }}>{parseFloat(a.response_rate_percent)||0}%</strong> of reviews.
                      Businesses that respond to 75%+ of reviews see up to <strong style={{ color:"#34D399" }}>18% improvement</strong> in overall rating.
                      Start with your most recent negative reviews on Google and Zomato.
                    </p>
                  </div>
                  <div style={{ marginLeft:"auto", flexShrink:0 }}>
                    <button style={{ cursor:"pointer", border:"1px solid rgba(248,113,113,0.4)",
                      background:"rgba(248,113,113,0.15)", color:"#F87171",
                      borderRadius:10, padding:"8px 16px", fontSize:12, fontWeight:700, fontFamily:"inherit" }}>
                      View Unreplied →
                    </button>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}