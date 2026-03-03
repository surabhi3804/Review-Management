import { useState } from "react";

function ReviewForm({ reviews, setReviews }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [branch, setBranch] = useState("Andheri");
  const [submitted, setSubmitted] = useState(false);

  const BRANCHES = ["Andheri", "Bandra", "Juhu", "Dadar"];

  const handleSubmit = (e) => {
    e.preventDefault();

    // Sentiment detection
    const text = review.toLowerCase();
    let sentiment = "neutral";
    const positiveWords = ["good","great","amazing","excellent","love","best","fantastic","wonderful","perfect","outstanding","polite","fast","fresh","delicious"];
    const negativeWords = ["bad","terrible","worst","rude","slow","cold","dirty","awful","horrible","disgusting","poor","waited","ignored","pathetic"];
    const posCount = positiveWords.filter((w) => text.includes(w)).length;
    const negCount = negativeWords.filter((w) => text.includes(w)).length;
    if (posCount > negCount) sentiment = "positive";
    else if (negCount > posCount) sentiment = "negative";

    // Category detection
    let category = "General";
    if (text.includes("food") || text.includes("biryani") || text.includes("dish") || text.includes("taste")) category = "Food";
    else if (text.includes("service") || text.includes("wait") || text.includes("slow") || text.includes("fast")) category = "Service";
    else if (text.includes("staff") || text.includes("waiter") || text.includes("rude") || text.includes("polite")) category = "Staff";
    else if (text.includes("clean") || text.includes("dirty") || text.includes("hygiene")) category = "Cleanliness";
    else if (text.includes("ambience") || text.includes("decor") || text.includes("noise") || text.includes("atmosphere")) category = "Ambience";

    const newReview = {
      id: Date.now(),
      rating,
      review,
      sentiment,
      category,
      branch,
      staff: "—",
      timestamp: new Date().toLocaleString(),
    };

    setReviews([...reviews, newReview]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setReview("");
    }, 2000);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
      }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "40px",
          width: "100%",
          maxWidth: "520px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <span style={{ fontSize: 32, color: "var(--accent)" }}>◎</span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "24px",
              fontWeight: 800,
              color: "var(--text-primary)",
              marginTop: "8px",
              letterSpacing: "-0.02em",
            }}
          >
            Customer Feedback
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Help us improve your experience
          </p>
        </div>

        {submitted ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "var(--accent)",
              fontFamily: "var(--font-display)",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            ✓ Review Submitted Successfully!
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Branch selector */}
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "8px" }}>
                Branch
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  fontFamily: "var(--font-body)",
                  padding: "10px 12px",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Star Rating */}
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "10px" }}>
                Rating
              </label>
              <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <span
                    key={num}
                    onClick={() => setRating(num)}
                    style={{
                      fontSize: "32px",
                      cursor: "pointer",
                      color: num <= rating ? "var(--gold)" : "rgba(255,255,255,0.12)",
                      textShadow: num <= rating ? "0 0 8px rgba(245,200,66,0.5)" : "none",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => { if (num > rating) e.currentTarget.style.color = "rgba(245,200,66,0.4)"; }}
                    onMouseLeave={(e) => { if (num > rating) e.currentTarget.style.color = "rgba(255,255,255,0.12)"; }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            {/* Review textarea */}
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "8px" }}>
                Your Experience
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                required
                placeholder="Share your experience with us..."
                rows={4}
                style={{
                  width: "100%",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  fontFamily: "var(--font-body)",
                  padding: "12px",
                  resize: "none",
                  outline: "none",
                  lineHeight: 1.6,
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,160,0.4)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!rating || !review.trim()}
              style={{
                width: "100%",
                padding: "13px",
                background: rating && review.trim()
                  ? "linear-gradient(135deg, var(--accent) 0%, #0fa8ff 100%)"
                  : "rgba(255,255,255,0.06)",
                color: rating && review.trim() ? "#000" : "var(--text-muted)",
                fontWeight: 700,
                fontSize: "14px",
                fontFamily: "var(--font-body)",
                border: "none",
                borderRadius: "10px",
                cursor: rating && review.trim() ? "pointer" : "not-allowed",
                letterSpacing: "0.02em",
                transition: "all 0.2s ease",
              }}
            >
              Submit Feedback ↗
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ReviewForm;