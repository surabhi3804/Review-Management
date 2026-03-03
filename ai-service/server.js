// ============================================================
// server.js  —  Node.js backend with Firebase Firestore
// Place this file inside your /backend folder
// ============================================================
// Install dependencies first:
//   cd backend
//   npm install express cors firebase-admin
// ============================================================

const express  = require("express");
const cors     = require("cors");
const admin    = require("firebase-admin");
const path     = require("path");

const app  = express();
const PORT = 3001;

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Firebase Init ─────────────────────────────────────────────
const serviceAccount = require("./serviceAccountKey.json"); // ← your downloaded key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
console.log("🔥 Firebase connected!");

// ============================================================
// POST /api/reviews
// Called by fetch_reviews.py to save each scraped review
// ============================================================
app.post("/api/reviews", async (req, res) => {
  try {
    const review = req.body;

    // Validate required fields
    if (!review.branchName || !review.text) {
      return res.status(400).json({ success: false, error: "Missing branchName or text" });
    }

    // Add server timestamp
    review.createdAt = admin.firestore.FieldValue.serverTimestamp();
    review.source    = review.source || "zomato";

    // Save to Firestore "reviews" collection
    const docRef = await db.collection("reviews").add(review);
    console.log(`✅ Saved review from ${review.reviewerName} [${review.branchName}] → ${docRef.id}`);

    res.status(201).json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("❌ Error saving review:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================
// GET /api/reviews
// Called by your React dashboard to fetch all reviews
// ============================================================
app.get("/api/reviews", async (req, res) => {
  try {
    const { branch, sentiment, limit = 100 } = req.query;

    let query = db.collection("reviews").orderBy("createdAt", "desc").limit(Number(limit));

    // Optional filters
    if (branch    && branch    !== "All Branches") query = query.where("branchName", "==", branch);
    if (sentiment && sentiment !== "All")          query = query.where("sentiment",  "==", sentiment);

    const snapshot = await query.get();

    const reviews = snapshot.docs.map((doc) => ({
      id:           doc.id,
      branch:       doc.data().branchName,
      reviewer:     doc.data().reviewerName,
      rating:       doc.data().rating,
      text:         doc.data().text,
      sentiment:    doc.data().sentiment,
      categories:   doc.data().category    || [],
      source:       doc.data().source      || "Zomato",
      timestamp:    doc.data().visitTime?.date || new Date().toISOString(),
      ai_response:  doc.data().ai_response || null,
    }));

    res.json({ success: true, reviews, count: reviews.length });
  } catch (err) {
    console.error("❌ Error fetching reviews:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================
// GET /api/reviews/stats
// Returns summary stats for the dashboard
// ============================================================
app.get("/api/reviews/stats", async (req, res) => {
  try {
    const snapshot = await db.collection("reviews").get();
    const reviews  = snapshot.docs.map((d) => d.data());

    const total     = reviews.length;
    const positive  = reviews.filter((r) => r.sentiment === "positive").length;
    const negative  = reviews.filter((r) => r.sentiment === "negative").length;
    const neutral   = reviews.filter((r) => r.sentiment === "neutral").length;
    const avgRating = total > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total).toFixed(1)
      : 0;

    // Per-branch breakdown
    const branchMap = {};
    reviews.forEach((r) => {
      const b = r.branchName || "Unknown";
      if (!branchMap[b]) branchMap[b] = { total: 0, ratingSum: 0 };
      branchMap[b].total++;
      branchMap[b].ratingSum += r.rating || 0;
    });
    const branches = Object.entries(branchMap).map(([name, data]) => ({
      name,
      total:     data.total,
      avgRating: (data.ratingSum / data.total).toFixed(1),
    }));

    res.json({
      success: true,
      stats: { total, positive, negative, neutral, avgRating, branches },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================
// DELETE /api/reviews/:id
// Delete a single review from Firestore
// ============================================================
app.delete("/api/reviews/:id", async (req, res) => {
  try {
    await db.collection("reviews").doc(req.params.id).delete();
    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Start server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Node server running at http://localhost:${PORT}`);
  console.log(`   POST /api/reviews      → save review to Firestore`);
  console.log(`   GET  /api/reviews      → fetch all reviews`);
  console.log(`   GET  /api/reviews/stats → dashboard stats`);
  console.log(`   DELETE /api/reviews/:id → delete a review\n`);
});