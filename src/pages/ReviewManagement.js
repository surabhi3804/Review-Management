import { useState } from "react";

function ReviewManagement({ reviews }) {
  const [selectedReview, setSelectedReview] = useState(null);
  const [filterSentiment, setFilterSentiment] = useState("All");
  const [filterBranch, setFilterBranch] = useState("All");

  const totalReviews   = reviews.length;
  const positiveCount  = reviews.filter((r) => r.sentiment === "positive" || r.sentiment === "Positive").length;
  const negativeCount  = reviews.filter((r) => r.sentiment === "negative" || r.sentiment === "Negative").length;
  const neutralCount   = reviews.filter((r) => r.sentiment === "neutral"  || r.sentiment === "Neutral").length;
  const averageRating  = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / totalReviews).toFixed(1)
    : "—";

  const branches = ["All", ...new Set(reviews.map((r) => r.branch).filter(Boolean))];

  const filtered = reviews.filter((r) => {
    const s = (r.sentiment || "").toLowerCase();
    const matchSentiment = filterSentiment === "All" || s === filterSentiment.toLowerCase();
    const matchBranch    = filterBranch === "All" || r.branch === filterBranch;
    return matchSentiment && matchBranch;
  });

  const generateReply = (r) => {
    const s = (r.sentiment || "").toLowerCase();
    if (s === "positive") return "Thank you so much for your wonderful feedback! We're thrilled you had a great experience. We look forward to welcoming you again soon! 🌟";
    if (s === "negative") return "We sincerely apologize for your experience. This doesn't reflect our standards. Please reach out to us at care@brand.com so we can personally make it right.";
    return "Thank you for sharing your feedback with us. We're always working to improve and your suggestions help us serve you better.";
  };

  const sentimentColor = (s) => {
    const val = (s || "").toLowerCase();
    if (val === "positive") return "var(--accent)";
    if (val === "negative") return "var(--red)";
    return "var(--gold)";
  };

  const sentimentBg = (s) => {
    const val = (s || "").toLowerCase();
    if (val === "positive") return "var(--accent-dim)";
    if (val === "negative") return "var(--red-dim)";
    return "var(--gold-dim)";
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", padding: "32px", color: "var(--text-primary)" }}>

      {/* Page Title */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
          Review Management
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
          All submitted reviews from the feedback form
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Reviews",   value: totalReviews,  color: "var(--accent)",  bg: "var(--accent-dim)", icon: "◎" },
          { label: "Average Rating",  value: `${averageRating} ★`, color: "var(--gold)",   bg: "var(--gold-dim)",   icon: "★" },
          { label: "Positive",        value: positiveCount, color: "var(--accent)",  bg: "var(--accent-dim)", icon: "▲" },
          { label: "Neutral",         value: neutralCount,  color: "var(--gold)",    bg: "var(--gold-dim)",   icon: "●" },
          { label: "Negative",        value: negativeCount, color: "var(--red)",     bg: "var(--red-dim)",    icon: "▼" },
        ].map((k) => (
          <div key={k.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "18px", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: k.color, flexShrink: 0 }}>
              {k.icon}
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "3px" }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <select
          value={filterSentiment}
          onChange={(e) => setFilterSentiment(e.target.value)}
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px", fontFamily: "var(--font-body)", padding: "8px 12px", outline: "none", cursor: "pointer" }}
        >
          {["All", "Positive", "Neutral", "Negative"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filterBranch}
          onChange={(e) => setFilterBranch(e.target.value)}
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px", fontFamily: "var(--font-body)", padding: "8px 12px", outline: "none", cursor: "pointer" }}
        >
          {branches.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {filtered.length} reviews
        </span>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)", fontSize: "14px", fontStyle: "italic" }}>
          No reviews yet. Submit one via the Feedback Form!
        </div>
      )}

      {/* Reviews Table */}
      {filtered.length > 0 && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Rating", "Branch", "Review", "Category", "Sentiment", "Time", "Action"].map((h) => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id || i} style={{ borderBottom: "1px solid rgba(0,229,160,0.04)", transition: "background 0.2s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 16px", color: "var(--gold)", fontSize: "14px" }}>
                    {"★".repeat(Number(r.rating))}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                    {r.branch || "—"}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "var(--text-secondary)", maxWidth: "260px" }}>
                    {r.review?.length > 70 ? r.review.slice(0, 70) + "…" : r.review}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", background: "var(--blue-dim)", color: "var(--blue)", fontFamily: "var(--font-mono)", fontWeight: 500 }}>
                      {r.category}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", background: sentimentBg(r.sentiment), color: sentimentColor(r.sentiment), fontFamily: "var(--font-mono)", fontWeight: 600, textTransform: "capitalize" }}>
                      {r.sentiment}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                    {r.timestamp || "—"}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <button
                      onClick={() => setSelectedReview(r)}
                      style={{ background: "var(--purple-dim)", color: "var(--purple)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "7px", padding: "6px 14px", fontSize: "12px", fontWeight: 600, fontFamily: "var(--font-body)", cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.2s ease" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(167,139,250,0.2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--purple-dim)")}
                    >
                      ✦ AI Reply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Reply Modal */}
      {selectedReview && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}
          onClick={() => setSelectedReview(null)}
        >
          <div
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "28px", width: "420px", maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px", color: "var(--purple)" }}>✦</span>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>AI Suggested Reply</h3>
            </div>

            {/* Original review */}
            <div style={{ background: "var(--bg-input)", borderRadius: "8px", padding: "12px", marginBottom: "14px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Original Review</div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{selectedReview.review}</p>
            </div>

            {/* AI reply */}
            <div style={{ background: "var(--accent-dim)", borderRadius: "8px", padding: "14px", marginBottom: "20px", border: "1px solid rgba(0,229,160,0.15)" }}>
              <div style={{ fontSize: "11px", color: "var(--accent)", fontFamily: "var(--font-mono)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Suggested Response</div>
              <p style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.6 }}>{generateReply(selectedReview)}</p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateReply(selectedReview));
                  alert("Reply copied!");
                }}
                style={{ flex: 1, padding: "10px", background: "linear-gradient(135deg, var(--accent) 0%, #0fa8ff 100%)", color: "#000", fontWeight: 700, fontSize: "13px", fontFamily: "var(--font-body)", border: "none", borderRadius: "8px", cursor: "pointer" }}
              >
                Copy Reply
              </button>
              <button
                onClick={() => setSelectedReview(null)}
                style={{ flex: 1, padding: "10px", background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)", fontSize: "13px", fontFamily: "var(--font-body)", border: "1px solid var(--border)", borderRadius: "8px", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewManagement;