import { QRCodeCanvas } from "qrcode.react";

const reviewURL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfTH4uxGQBVXLsQsYWXpjtgWQ-y4RIHYpVaEGFEvgwPpKe2mA/viewform";

function QRCodePage() {
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
          maxWidth: "480px",
          textAlign: "center",
          boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "8px" }}>
          <span style={{ fontSize: 32, color: "var(--accent)" }}>◈</span>
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "24px",
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: "6px",
            letterSpacing: "-0.02em",
          }}
        >
          Scan to Submit Feedback
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            marginBottom: "28px",
          }}
        >
          Point your camera at the QR code to leave a review
        </p>

        {/* QR Code */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <a
            href={reviewURL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "16px",
              background: "#ffffff",
              borderRadius: "16px",
              transition: "transform 0.2s ease",
              boxShadow: "0 0 24px rgba(0,229,160,0.2)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <QRCodeCanvas value={reviewURL} size={200} />
          </a>
        </div>

        {/* URL display */}
        <p
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            wordBreak: "break-all",
            marginBottom: "20px",
            padding: "10px",
            background: "var(--bg-input)",
            borderRadius: "8px",
            border: "1px solid var(--border)",
          }}
        >
          {reviewURL}
        </p>

        {/* Copy Button */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(reviewURL);
            alert("Link copied to clipboard!");
          }}
          style={{
            width: "100%",
            padding: "12px",
            background: "linear-gradient(135deg, var(--accent) 0%, #0fa8ff 100%)",
            color: "#000",
            fontWeight: 700,
            fontSize: "14px",
            fontFamily: "var(--font-body)",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            letterSpacing: "0.02em",
            transition: "opacity 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          ⇩ Copy Review Link
        </button>
      </div>
    </div>
  );
}

export default QRCodePage;