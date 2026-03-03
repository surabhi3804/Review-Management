const Review = require("../backend/models/Review");

// ─────────────────────────────────────────────
// HELPER: Sort object by value descending
// ─────────────────────────────────────────────
const sortByCount = (obj) =>
  Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count }));

// ─────────────────────────────────────────────
// MAIN: Get Root Cause Analysis for a Branch
// ─────────────────────────────────────────────
const getRootCause = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { startDate, endDate } = req.query;

    // 1️⃣ Build query filter
    const filter = { sentiment: "negative" };
    if (branchId !== "all") filter.branchId = branchId;
    if (startDate || endDate) {
      filter["visitTime.date"] = {};
      if (startDate) filter["visitTime.date"].$gte = new Date(startDate);
      if (endDate)   filter["visitTime.date"].$lte = new Date(endDate);
    }

    // 2️⃣ Fetch all negative reviews
    const negativeReviews = await Review.find(filter);
    const total = negativeReviews.length;

    if (total === 0) {
      return res.json({
        success: true,
        branchId,
        totalNegativeReviews: 0,
        message: "No negative reviews found for this branch.",
        insights: null,
      });
    }

    // 3️⃣ Count: Category Issues
    const categoryCount = {};
    negativeReviews.forEach((review) => {
      (review.category || []).forEach((cat) => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
    });

    // 4️⃣ Count: Staff Mentions
    const staffCount = {};
    negativeReviews.forEach((review) => {
      (review.staffMentioned || []).forEach((staff) => {
        staffCount[staff] = (staffCount[staff] || 0) + 1;
      });
    });

    // 5️⃣ Count: Time Patterns (Day of Week)
    const dayCount = {};
    negativeReviews.forEach((review) => {
      const day = review.visitTime?.dayOfWeek;
      if (day) dayCount[day] = (dayCount[day] || 0) + 1;
    });

    // 6️⃣ Count: Time Slot (Morning / Evening etc.)
    const timeSlotCount = {};
    negativeReviews.forEach((review) => {
      const slot = review.visitTime?.timeSlot;
      if (slot) timeSlotCount[slot] = (timeSlotCount[slot] || 0) + 1;
    });

    // 7️⃣ Count: Keywords
    const keywordCount = {};
    negativeReviews.forEach((review) => {
      (review.keywords || []).forEach((kw) => {
        const normalized = kw.toLowerCase();
        keywordCount[normalized] = (keywordCount[normalized] || 0) + 1;
      });
    });

    // 8️⃣ Sorted results
    const sortedCategories = sortByCount(categoryCount);
    const sortedStaff      = sortByCount(staffCount);
    const sortedDays       = sortByCount(dayCount);
    const sortedTimeSlots  = sortByCount(timeSlotCount);
    const sortedKeywords   = sortByCount(keywordCount).slice(0, 10);

    // 9️⃣ Build human-readable summary
    const topCategory  = sortedCategories[0];
    const topDay       = sortedDays[0];
    const topStaff     = sortedStaff[0];
    const topTimeSlot  = sortedTimeSlots[0];

    let summary = `Main issue is`;
    if (topCategory) {
      const pct = Math.round((topCategory.count / total) * 100);
      summary += ` ${topCategory.label} (${pct}% of complaints)`;
    }
    if (topDay) summary += `, especially on ${topDay.label}s`;
    if (topTimeSlot) summary += ` during the ${topTimeSlot.label}`;
    if (topStaff) summary += `. Staff member "${topStaff.label}" mentioned most frequently.`;
    else summary += ".";

    // 🔟 Response
    res.json({
      success: true,
      branchId,
      totalNegativeReviews: total,
      summary,
      insights: {
        categories:  sortedCategories,
        staff:       sortedStaff,
        days:        sortedDays,
        timeSlots:   sortedTimeSlots,
        keywords:    sortedKeywords,
      },
    });
  } catch (err) {
    console.error("Root cause analysis error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// EXTRA: Compare Root Causes Across All Branches
// ─────────────────────────────────────────────
const compareBranches = async (req, res) => {
  try {
    const negativeReviews = await Review.find({ sentiment: "negative" });

    // Group by branch
    const branchMap = {};
    negativeReviews.forEach((review) => {
      const key = review.branchId.toString();
      if (!branchMap[key]) {
        branchMap[key] = { branchName: review.branchName, reviews: [] };
      }
      branchMap[key].reviews.push(review);
    });

    const comparison = Object.entries(branchMap).map(([branchId, { branchName, reviews }]) => {
      const categoryCount = {};
      reviews.forEach((r) => {
        (r.category || []).forEach((cat) => {
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
      });
      const topIssue = sortByCount(categoryCount)[0];
      return {
        branchId,
        branchName,
        totalNegativeReviews: reviews.length,
        topIssue: topIssue || null,
      };
    });

    res.json({ success: true, comparison });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getRootCause, compareBranches };