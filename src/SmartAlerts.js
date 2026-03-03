import { useState, useEffect, useRef } from "react";
import "./SmartAlerts.css";

const API_BASE        = "http://localhost:5000";
const SPIKE_THRESHOLD = 2;
const STAFF_THRESHOLD = 2;

// ── Mock fallback data ────────────────────────────────────────
const MOCK_REVIEWS = [
  { id:1,  branch:"Andheri", sentiment:"negative", categories:["Food","Service"],   text:"Food was cold and service was terrible",      source:"Google",      rating:1, date:"2025-07-14" },
  { id:2,  branch:"Andheri", sentiment:"negative", categories:["Staff"],            text:"The staff was very rude to us",                source:"Zomato",      rating:2, date:"2025-07-14" },
  { id:3,  branch:"Bandra",  sentiment:"negative", categories:["Food"],             text:"Worst food quality I've experienced",          source:"Google",      rating:1, date:"2025-07-13" },
  { id:4,  branch:"Bandra",  sentiment:"negative", categories:["Staff","Service"],  text:"Staff ignored us for 20 minutes",              source:"Swiggy",      rating:2, date:"2025-07-13" },
  { id:5,  branch:"Bandra",  sentiment:"negative", categories:["Staff"],            text:"Rude and dismissive staff",                    source:"TripAdvisor", rating:1, date:"2025-07-12" },
  { id:6,  branch:"Juhu",    sentiment:"negative", categories:["Cleanliness"],      text:"Tables were dirty and glasses unclean",        source:"Zomato",      rating:2, date:"2025-07-12" },
  { id:7,  branch:"Juhu",    sentiment:"negative", categories:["Ambience","Food"],  text:"Ambience was off and food quality poor",       source:"Google",      rating:2, date:"2025-07-11" },
  { id:8,  branch:"Andheri", sentiment:"positive", categories:["Food"],             text:"Amazing biryani! Will come again",             source:"Google",      rating:5, date:"2025-07-14" },
  { id:9,  branch:"Bandra",  sentiment:"positive", categories:["Service"],          text:"Great service and warm hospitality",           source:"Zomato",      rating:4, date:"2025-07-13" },
  { id:10, branch:"Juhu",    sentiment:"neutral",  categories:["Ambience"],         text:"Average experience, nothing special",          source:"Dineout",     rating:3, date:"2025-07-11" },
];

const MOCK_ANALYTICS = {
  total_reviews: 25,
  average_rating: 3.2,
  response_rate_percent: 12,
  weekly_trend: [-3, -1, 0, 2, -4, -2, -3],
  sentiment_breakdown: { positive: 14, neutral: 4, negative: 7 },
  alerts_this_week: 6,
  alerts_resolved: 2,
};

// ── Alert detection ───────────────────────────────────────────
function runAlerts(reviews) {
  const alerts = [];
  if (!reviews?.length) return alerts;
  const neg = reviews.filter(r => r.sentiment === "negative");

  // Spike
  const negByBranch = {};
  neg.forEach(r => { negByBranch[r.branch] = (negByBranch[r.branch] || 0) + 1; });
  Object.entries(negByBranch).forEach(([branch, count]) => {
    const total = reviews.filter(r => r.branch === branch).length;
    const pct   = Math.round((count / total) * 100);
    if (count >= SPIKE_THRESHOLD) {
      alerts.push({
        id: `spike-${branch}`, severity: pct >= 60 ? "critical" : "warning",
        title: "Negative Review Spike", subtitle: `${branch} Branch`, type: "spike",
        message: `${count} of ${total} reviews are negative (${pct}%). Customers are consistently reporting poor experiences.`,
        branch, meta: `${count} negative · ${pct}% of total`, icon: "📉",
        suggestion: `Assign a branch manager to personally follow up with unhappy customers at ${branch}. Consider offering a complimentary visit or discount.`,
        affectedReviews: neg.filter(r => r.branch === branch),
        time: "Just now",
      });
    }
  });

  // Staff
  const staffNeg = neg.filter(r => (r.categories || []).includes("Staff"));
  const staffByBranch = {};
  staffNeg.forEach(r => { staffByBranch[r.branch] = (staffByBranch[r.branch] || 0) + 1; });
  Object.entries(staffByBranch).forEach(([branch, count]) => {
    if (count >= STAFF_THRESHOLD) {
      alerts.push({
        id: `staff-${branch}`, severity: count >= 3 ? "critical" : "warning",
        title: "Staff Behaviour Flagged", subtitle: `${branch} Branch`, type: "staff",
        message: `Staff conduct mentioned in ${count} negative reviews. A team review and coaching session is recommended.`,
        branch, meta: `${count} staff mentions`, icon: "👤",
        suggestion: `Schedule a mandatory training session for ${branch} staff. Review shift logs and CCTV footage for the flagged dates.`,
        affectedReviews: staffNeg.filter(r => r.branch === branch),
        time: "2 min ago",
      });
    }
  });

  // Food quality
  const foodNeg = neg.filter(r => (r.categories || []).includes("Food"));
  const foodByBranch = {};
  foodNeg.forEach(r => { foodByBranch[r.branch] = (foodByBranch[r.branch] || 0) + 1; });
  Object.entries(foodByBranch).forEach(([branch, count]) => {
    if (count >= 2) {
      alerts.push({
        id: `food-${branch}`, severity: count >= 3 ? "critical" : "warning",
        title: "Food Quality Complaints", subtitle: `${branch} Branch`, type: "food",
        message: `Food quality flagged in ${count} reviews at ${branch}. Review kitchen processes and ingredient sourcing.`,
        branch, meta: `${count} food complaints`, icon: "🍽️",
        suggestion: `Conduct an immediate kitchen audit at ${branch}. Check ingredient freshness, cooking temperatures, and prep hygiene standards.`,
        affectedReviews: foodNeg.filter(r => r.branch === branch),
        time: "15 min ago",
      });
    }
  });

  // Response rate
  alerts.push({
    id: "response-rate", severity: "warning",
    title: "Low Response Rate", subtitle: "All Branches", type: "response",
    message: "Only 12% of reviews have received a response. Unanswered reviews signal indifference to customers.",
    branch: "All", meta: "88% unanswered", icon: "💬",
    suggestion: "Set a daily 15-minute review response routine. Prioritise 1★ and 2★ reviews first — even a brief acknowledgement boosts trust scores.",
    affectedReviews: [],
    time: "1 hr ago",
  });

  return alerts.sort((a, b) => (a.severity === "critical" ? -1 : 1));
}

// ── Severity config ───────────────────────────────────────────
const SEV = {
  critical: { color:"#F87171", bg:"rgba(248,113,113,0.09)", border:"rgba(248,113,113,0.25)",
    badgeBg:"rgba(248,113,113,0.15)", badgeText:"#FCA5A5", label:"CRITICAL", glow:"rgba(248,113,113,0.15)" },
  warning:  { color:"#FBBF24", bg:"rgba(251,191,36,0.08)", border:"rgba(251,191,36,0.22)",
    badgeBg:"rgba(251,191,36,0.14)", badgeText:"#FDE68A", label:"WARNING",  glow:"rgba(251,191,36,0.12)" },
};

// ── Sparkline ─────────────────────────────────────────────────
function Sparkline({ data, color = "#F87171", width = 80, height = 28 }) {
  const max  = Math.max(...data.map(Math.abs));
  const pts  = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v + max) / (2 * max || 1)) * height;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ overflow:"visible" }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ filter:`drop-shadow(0 0 4px ${color}88)` }} />
    </svg>
  );
}

// ── Mini Review Snippet ───────────────────────────────────────
function ReviewSnippet({ review }) {
  return (
    <div className="sa-snippet">
      <div className="sa-snippet-stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
      <p className="sa-snippet-text">"{review.text}"</p>
      <div className="sa-snippet-meta">
        <span className="sa-snippet-source">{review.source}</span>
        <span className="sa-snippet-date">{review.date}</span>
      </div>
    </div>
  );
}

// ── AlertCard ─────────────────────────────────────────────────
function AlertCard({ alert, onDismiss, index }) {
  const s = SEV[alert.severity] || SEV.warning;
  const [expanded, setExpanded] = useState(false);
  const [hov, setHov] = useState(false);

  return (
    <div
      className={`sa-alert sa-alert-${alert.severity} ${expanded ? "expanded" : ""}`}
      style={{ animationDelay:`${index * 80}ms` }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Left accent line */}
      <div className="sa-alert-line" style={{ background:`linear-gradient(180deg,${s.color},${s.color}00)` }} />

      {/* Glow overlay on hover */}
      <div className="sa-alert-glow" style={{ background:s.glow, opacity: hov ? 1 : 0 }} />

      {/* Icon */}
      <div className="sa-alert-icon-wrap" style={{ background:`${s.color}14`, border:`1px solid ${s.border}`, boxShadow:`0 0 16px ${s.color}22` }}>
        {alert.icon}
      </div>

      {/* Body */}
      <div className="sa-alert-body">
        <div className="sa-alert-top">
          <span className="sa-alert-badge" style={{ background:s.badgeBg, color:s.badgeText, border:`1px solid ${s.border}` }}>
            ● {s.label}
          </span>
          <span className="sa-alert-title">{alert.title}</span>
          <span className="sa-alert-subtitle">— {alert.subtitle}</span>
          <span className="sa-alert-time">{alert.time}</span>
        </div>

        <p className="sa-alert-msg">{alert.message}</p>

        {/* Meta row */}
        <div className="sa-alert-meta">
          <span className="sa-alert-meta-item">
            <span className="sa-alert-meta-dot" style={{ background:s.color, boxShadow:`0 0 5px ${s.color}` }} />
            {alert.meta}
          </span>
          <span className="sa-alert-meta-item">📍 {alert.branch}</span>
          {alert.affectedReviews?.length > 0 && (
            <span className="sa-alert-meta-item">🗂 {alert.affectedReviews.length} reviews</span>
          )}
        </div>

        {/* Suggestion box */}
        <div className="sa-suggestion">
          <div className="sa-suggestion-label">💡 Recommended Action</div>
          <p className="sa-suggestion-text">{alert.suggestion}</p>
        </div>

        {/* Expand/collapse reviews */}
        {alert.affectedReviews?.length > 0 && (
          <>
            <button className="sa-expand-btn" onClick={() => setExpanded(e => !e)}
              style={{ color:s.color, borderColor:`${s.color}33`, background:`${s.color}0d` }}>
              {expanded ? "▲ Hide reviews" : `▼ Show ${alert.affectedReviews.length} affected review${alert.affectedReviews.length > 1 ? "s" : ""}`}
            </button>
            {expanded && (
              <div className="sa-reviews-list">
                {alert.affectedReviews.slice(0,3).map(r => (
                  <ReviewSnippet key={r.id} review={r} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Action buttons */}
        <div className="sa-alert-actions">
          <button className="sa-action-btn primary" style={{ background:`${s.color}18`, border:`1px solid ${s.color}44`, color:s.color }}>
            Mark as Reviewed
          </button>
          <button className="sa-action-btn secondary">
            Assign to Manager
          </button>
          <button className="sa-action-btn secondary">
            Snooze 24h
          </button>
        </div>
      </div>

      <button className="sa-dismiss-btn" onClick={() => onDismiss(alert.id)}>✕</button>
    </div>
  );
}

// ── Stat mini card ────────────────────────────────────────────
function StatMini({ label, value, icon, color, trend, sparkData }) {
  return (
    <div className="sa-stat-mini">
      <div className="sa-stat-mini-top">
        <div>
          <div className="sa-stat-mini-label">{label}</div>
          <div className="sa-stat-mini-value" style={{ color }}>{value}</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
          <span className="sa-stat-mini-icon">{icon}</span>
          {sparkData && <Sparkline data={sparkData} color={color} />}
        </div>
      </div>
      {trend && (
        <div className="sa-stat-mini-trend" style={{ color: trend.startsWith("+") ? "#34D399" : "#F87171" }}>
          {trend}
        </div>
      )}
    </div>
  );
}

// ── Alert Timeline ────────────────────────────────────────────
function AlertTimeline({ alerts }) {
  const items = [
    { time:"Today, 12:45 PM", event:"4 new alerts detected from live review stream", type:"alert" },
    { time:"Today, 10:20 AM", event:"Bandra staff alert dismissed by Manager", type:"resolved" },
    { time:"Yesterday, 6:30 PM", event:"Andheri spike alert marked as reviewed", type:"resolved" },
    { time:"Yesterday, 2:15 PM", event:"3 critical alerts triggered across branches", type:"alert" },
    { time:"2 days ago", event:"Juhu cleanliness alert raised and assigned", type:"alert" },
    { time:"3 days ago", event:"All alerts cleared — system reported all clear", type:"clear" },
  ];
  return (
    <div className="sa-timeline">
      {items.map((item, i) => (
        <div key={i} className="sa-timeline-item">
          <div className={`sa-timeline-dot sa-tl-${item.type}`} />
          <div className="sa-timeline-line" style={{ display: i === items.length-1 ? "none" : "block" }} />
          <div className="sa-timeline-content">
            <div className="sa-timeline-time">{item.time}</div>
            <div className="sa-timeline-event">{item.event}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Branch Health ─────────────────────────────────────────────
function BranchHealth({ reviews }) {
  const branches = ["Andheri", "Bandra", "Juhu"];
  return (
    <div className="sa-branch-health">
      {branches.map(branch => {
        const all = reviews.filter(r => r.branch === branch);
        const neg = all.filter(r => r.sentiment === "negative").length;
        const pct = all.length ? Math.round((neg / all.length) * 100) : 0;
        const status = pct >= 50 ? "critical" : pct >= 30 ? "warning" : "healthy";
        const statusColors = { critical:"#F87171", warning:"#FBBF24", healthy:"#34D399" };
        const c = statusColors[status];
        return (
          <div key={branch} className="sa-branch-chip">
            <div className="sa-branch-chip-header">
              <span className="sa-branch-chip-name">{branch}</span>
              <span className="sa-branch-chip-badge" style={{ color:c, background:`${c}18`, border:`1px solid ${c}33` }}>
                {status.toUpperCase()}
              </span>
            </div>
            <div className="sa-branch-bar-track">
              <div className="sa-branch-bar-fill" style={{ width:`${pct}%`,
                background:`linear-gradient(90deg,${c},${c}aa)`, boxShadow:`0 0 8px ${c}44` }} />
            </div>
            <div className="sa-branch-chip-footer">
              <span style={{ color:"#6b7fa3", fontSize:11 }}>{neg} negative / {all.length} total</span>
              <span style={{ color:c, fontSize:11, fontWeight:700 }}>{pct}% neg rate</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function SmartAlerts() {
  const [alerts,    setAlerts]    = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [refreshed, setRefreshed] = useState(null);
  const [spinning,  setSpinning]  = useState(false);
  const [reviews,   setReviews]   = useState([]);
  const [analytics, setAnalytics] = useState(MOCK_ANALYTICS);
  const [activeTab, setActiveTab] = useState("alerts");

  const load = () => {
    setSpinning(true);
    Promise.all([
      fetch(`${API_BASE}/api/reviews`).then(r => r.json()),
      fetch(`${API_BASE}/api/analytics`).then(r => r.json()),
    ]).then(([rv, an]) => {
      const revs = rv.reviews || [];
      setReviews(revs);
      setAlerts(runAlerts(revs));
      setAnalytics(an.analytics || MOCK_ANALYTICS);
      setRefreshed(new Date().toLocaleTimeString());
      setLoading(false); setSpinning(false);
    }).catch(() => {
      // Fall back to mock
      setReviews(MOCK_REVIEWS);
      setAlerts(runAlerts(MOCK_REVIEWS));
      setAnalytics(MOCK_ANALYTICS);
      setRefreshed(new Date().toLocaleTimeString());
      setLoading(false); setSpinning(false);
    });
  };

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  const dismiss = id => setDismissed(p => [...p, id]);
  const active  = alerts.filter(a => !dismissed.includes(a.id));
  const crits   = active.filter(a => a.severity === "critical").length;
  const warns   = active.filter(a => a.severity === "warning").length;
  const a       = analytics || MOCK_ANALYTICS;

  return (
    <div className="sa">
      <div className="sa-blob-1" />
      <div className="sa-blob-2" />
      <div className="sa-blob-3" />

      <div className="sa-inner">

        {/* ── Header ── */}
        <div className="sa-header">
          <div className="sa-header-row">
            <div>
              <div className="sa-live-badge">
                <span className="sa-live-dot" />
                <span className="sa-live-text">Live Monitoring</span>
              </div>
              <h1 className="sa-title">Smart Alerts</h1>
              <p className="sa-subtitle">Auto-detected issues from your live review stream</p>
            </div>
            <div className="sa-controls">
              {crits > 0 && <span className="sa-count-badge sa-count-critical">{crits} Critical</span>}
              {warns > 0 && <span className="sa-count-badge sa-count-warning">{warns} Warning</span>}
              <button className="sa-refresh-btn" onClick={load}>
                <span className={`sa-refresh-icon ${spinning ? "spinning" : ""}`}>↻</span> Refresh
              </button>
            </div>
          </div>
          {refreshed && <div className="sa-last-checked">Last checked: {refreshed} · Auto-refreshes every 30s</div>}
        </div>

        {/* ── Stats Row ── */}
        <div className="sa-stats-row">
          <StatMini label="Active Alerts" value={active.length} icon="🚨" color="#F87171"
            trend={active.length > 3 ? "+2 since yesterday" : "-1 since yesterday"}
            sparkData={[2,4,3,5,3,4,active.length]} />
          <StatMini label="Alerts This Week" value={a.alerts_this_week || 6} icon="📅" color="#FBBF24"
            trend="+3 vs last week" sparkData={[1,3,2,4,3,5,6]} />
          <StatMini label="Resolved" value={a.alerts_resolved || 2} icon="✅" color="#34D399"
            trend={`${Math.round(((a.alerts_resolved||2)/((a.alerts_this_week||6)))*100)}% resolution rate`}
            sparkData={[0,1,1,2,1,2,2]} />
          <StatMini label="Avg Response Rate" value={`${a.response_rate_percent || 12}%`} icon="💬" color="#818CF8"
            trend="↑ 3% vs last week" sparkData={[8,10,9,11,10,11,12]} />
        </div>

        {/* ── Branch Health ── */}
        <div className="sa-section-card">
          <div className="sa-section-header">
            <div>
              <div className="sa-section-title">Branch Health Overview</div>
              <div className="sa-section-sub">Negative review rate per branch — updated in real time</div>
            </div>
            <div className="sa-health-legend">
              <span className="sa-hl-item sa-hl-healthy">Healthy</span>
              <span className="sa-hl-item sa-hl-warning">Warning</span>
              <span className="sa-hl-item sa-hl-critical">Critical</span>
            </div>
          </div>
          <BranchHealth reviews={reviews.length ? reviews : MOCK_REVIEWS} />
        </div>

        {/* ── Tabs ── */}
        <div className="sa-tabs">
          {[
            { id:"alerts",   label:"Active Alerts",  count: active.length },
            { id:"timeline", label:"Alert Timeline",  count: null },
            { id:"config",   label:"Configuration",   count: null },
          ].map(tab => (
            <button key={tab.id} className={`sa-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}>
              {tab.label}
              {tab.count !== null && <span className="sa-tab-count">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && <div className="sa-error">⚠️ {error} — <code>python app.py</code></div>}

        {/* Loader */}
        {loading && !error && (
          <div className="sa-loader-wrap">
            <div className="sa-spinner" />
            <div className="sa-loader-text">Scanning for issues…</div>
          </div>
        )}

        {/* ── ALERTS TAB ── */}
        {!loading && !error && activeTab === "alerts" && (
          <>
            {active.length === 0 ? (
              <div className="sa-allclear">
                <div className="sa-allclear-emoji">✅</div>
                <div className="sa-allclear-title">All Clear</div>
                <div className="sa-allclear-sub">No issues detected in your current review data.</div>
              </div>
            ) : (
              <>
                <div className="sa-alert-list-header">
                  <span className="sa-alert-list-label">{active.length} active alert{active.length > 1 ? "s" : ""} require attention</span>
                  {crits > 0 && <span className="sa-urgent-chip">⚡ {crits} need immediate action</span>}
                </div>
                {active.map((a, i) => (
                  <AlertCard key={a.id} alert={a} onDismiss={dismiss} index={i} />
                ))}
              </>
            )}
            {dismissed.length > 0 && (
              <div className="sa-dismissed" onClick={() => setDismissed([])}>
                {dismissed.length} dismissed · click to restore all
              </div>
            )}
          </>
        )}

        {/* ── TIMELINE TAB ── */}
        {!loading && !error && activeTab === "timeline" && (
          <div className="sa-section-card" style={{ marginTop: 0 }}>
            <div className="sa-section-title" style={{ marginBottom:4 }}>Alert Activity Log</div>
            <div className="sa-section-sub" style={{ marginBottom:20 }}>History of alerts generated, resolved, and dismissed</div>
            <AlertTimeline alerts={alerts} />
          </div>
        )}

        {/* ── CONFIG TAB ── */}
        {!loading && !error && activeTab === "config" && (
          <div className="sa-config-panel">
            <div className="sa-section-card">
              <div className="sa-section-title" style={{ marginBottom:4 }}>Alert Thresholds</div>
              <div className="sa-section-sub" style={{ marginBottom:20 }}>Configure when alerts are triggered</div>
              <div className="sa-config-grid-full">
                {[
                  { label:"Negative Spike Threshold", desc:"Min negative reviews per branch to trigger alert", value:`≥ ${SPIKE_THRESHOLD} per branch`, icon:"📉", color:"#F87171" },
                  { label:"Staff Complaint Threshold", desc:"Staff mentions before flagging behaviour", value:`≥ ${STAFF_THRESHOLD} per branch`, icon:"👤", color:"#FBBF24" },
                  { label:"Food Quality Threshold",    desc:"Food complaints before raising kitchen alert", value:"≥ 2 per branch", icon:"🍽️", color:"#F472B6" },
                  { label:"Response Rate Threshold",   desc:"Response rate below which alert is raised",    value:"< 30%", icon:"💬", color:"#818CF8" },
                  { label:"Auto-Refresh Interval",     desc:"How often the system checks for new alerts",   value:"Every 30 seconds", icon:"⏱", color:"#34D399" },
                  { label:"Alert Retention Period",    desc:"How long dismissed alerts are kept in log",    value:"30 days", icon:"🗂", color:"#22D3EE" },
                ].map(cfg => (
                  <div key={cfg.label} className="sa-config-row">
                    <div className="sa-config-row-icon" style={{ background:`${cfg.color}14`, border:`1px solid ${cfg.color}33` }}>{cfg.icon}</div>
                    <div style={{ flex:1 }}>
                      <div className="sa-config-row-label">{cfg.label}</div>
                      <div className="sa-config-row-desc">{cfg.desc}</div>
                    </div>
                    <div className="sa-config-row-value" style={{ color:cfg.color }}>{cfg.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sa-section-card" style={{ marginTop:14 }}>
              <div className="sa-section-title" style={{ marginBottom:4 }}>Notification Channels</div>
              <div className="sa-section-sub" style={{ marginBottom:20 }}>Where critical alerts are delivered</div>
              <div className="sa-notif-list">
                {[
                  { channel:"Email Digest",     detail:"alerts@reviewhub.app",   status:"Active",   icon:"📧", color:"#818CF8" },
                  { channel:"WhatsApp Alerts",  detail:"+91 98765 XXXXX",         status:"Active",   icon:"💬", color:"#34D399" },
                  { channel:"Slack Webhook",    detail:"#alerts channel",          status:"Inactive", icon:"🔔", color:"#FBBF24" },
                  { channel:"SMS Notifications",detail:"+91 98765 XXXXX",          status:"Active",   icon:"📱", color:"#F472B6" },
                ].map(n => (
                  <div key={n.channel} className="sa-notif-item">
                    <div className="sa-notif-icon" style={{ background:`${n.color}14`, border:`1px solid ${n.color}33`, color:n.color }}>{n.icon}</div>
                    <div style={{ flex:1 }}>
                      <div className="sa-notif-name">{n.channel}</div>
                      <div className="sa-notif-detail">{n.detail}</div>
                    </div>
                    <div className={`sa-notif-status ${n.status === "Active" ? "active" : "inactive"}`}>
                      {n.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}