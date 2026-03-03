import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import RootCauseAnalyzer from "./Rootcauseanalyzer";
import SmartAlerts from "./SmartAlerts";
import CompetitorComparison from "./CompetitorComparison";

// ── Static Sample Data ────────────────────────────────────────
const REVIEWS = [
  { id:  1, source: "Google",   branch: "Andheri", author: "Priya Sharma",   rating: 5, category: "Food",        sentiment: "positive", text: "Absolutely incredible food quality! The biryani was heavenly and perfectly spiced.",     time: "2 mins ago",   staff: "Ravi Kumar",  avatar: "PS" },
  { id:  2, source: "Zomato",   branch: "Andheri", author: "Rohan Mehta",    rating: 4, category: "Service",     sentiment: "positive", text: "Quick and attentive service. Our waiter Ravi made sure everything was perfect.",        time: "1 hr ago",     staff: "Ravi Kumar",  avatar: "RM" },
  { id:  3, source: "Internal", branch: "Andheri", author: "Sneha Joshi",    rating: 3, category: "Ambience",    sentiment: "neutral",  text: "Decent ambience but a bit noisy on weekends. Could use better sound dampening.",        time: "3 hrs ago",    staff: "Meera Das",   avatar: "SJ" },
  { id:  4, source: "Google",   branch: "Andheri", author: "Raj Verma",      rating: 3, category: "Cleanliness", sentiment: "neutral",  text: "Average cleanliness. Tables could be wiped more frequently between customers.",         time: "2 hrs ago",    staff: "Meera Das",   avatar: "RV" },
  { id:  5, source: "Zomato",   branch: "Andheri", author: "Pooja Nair",     rating: 1, category: "Staff",       sentiment: "negative", text: "The staff was completely inattentive. Had to ask three times for the menu.",             time: "5 hrs ago",    staff: "Meera Das",   avatar: "PN" },
  { id:  6, source: "Internal", branch: "Andheri", author: "Vikas Gupta",    rating: 2, category: "Food",        sentiment: "negative", text: "Food arrived cold and the dal was watery. Expected much better from this location.",     time: "6 hrs ago",    staff: "Ravi Kumar",  avatar: "VG" },
  { id:  7, source: "Google",   branch: "Andheri", author: "Divya Rao",      rating: 5, category: "Staff",       sentiment: "positive", text: "Wonderful staff! They remembered our anniversary and brought a complimentary dessert.",  time: "1 day ago",    staff: "Ravi Kumar",  avatar: "DR" },
  { id:  8, source: "Zomato",   branch: "Andheri", author: "Kiran Shah",     rating: 4, category: "Food",        sentiment: "positive", text: "Great variety on the menu. The pav bhaji was outstanding and portion sizes are good.",  time: "1 day ago",    staff: "Meera Das",   avatar: "KS" },
  { id:  9, source: "Zomato",   branch: "Bandra",  author: "Ahmed Khan",     rating: 2, category: "Service",     sentiment: "negative", text: "Waited 45 minutes for our order. Staff was rude and dismissive when we complained.",    time: "18 mins ago",  staff: "Neha Singh",  avatar: "AK" },
  { id: 10, source: "Google",   branch: "Bandra",  author: "Omar Ali",       rating: 1, category: "Staff",       sentiment: "negative", text: "Staff behavior was completely unacceptable. The manager was unapologetic about delays.", time: "4 hrs ago",    staff: "Neha Singh",  avatar: "OA" },
  { id: 11, source: "Internal", branch: "Bandra",  author: "Fatima Sheikh",  rating: 4, category: "Food",        sentiment: "positive", text: "Food quality is consistently good. The kebabs here are the best in the area.",          time: "2 hrs ago",    staff: "Arjun Patel", avatar: "FS" },
  { id: 12, source: "Google",   branch: "Bandra",  author: "Rahul Kapoor",   rating: 3, category: "Ambience",    sentiment: "neutral",  text: "Nice location with sea view but the interiors feel a bit dated and need renovation.",   time: "3 hrs ago",    staff: "Arjun Patel", avatar: "RK" },
  { id: 13, source: "Zomato",   branch: "Bandra",  author: "Anita Desai",    rating: 5, category: "Food",        sentiment: "positive", text: "The seafood here is absolutely fresh and delicious. Best prawn curry I have had!",      time: "5 hrs ago",    staff: "Arjun Patel", avatar: "AD" },
  { id: 14, source: "Internal", branch: "Bandra",  author: "Suresh Pillai",  rating: 2, category: "Cleanliness", sentiment: "negative", text: "Found the restrooms quite dirty. The kitchen area visible from our table looked messy.", time: "7 hrs ago",    staff: "Neha Singh",  avatar: "SP" },
  { id: 15, source: "Google",   branch: "Bandra",  author: "Meera Iyer",     rating: 4, category: "Service",     sentiment: "positive", text: "Service has improved a lot compared to my last visit. Staff was polite and efficient.", time: "1 day ago",    staff: "Arjun Patel", avatar: "MI" },
  { id: 16, source: "Zomato",   branch: "Bandra",  author: "Cyrus Mistry",   rating: 3, category: "Staff",       sentiment: "neutral",  text: "Staff is okay but needs more training on the menu. Could not answer basic questions.",  time: "1 day ago",    staff: "Neha Singh",  avatar: "CM" },
  { id: 17, source: "Internal", branch: "Juhu",    author: "Lisa Chen",      rating: 4, category: "Ambience",    sentiment: "positive", text: "Beautiful beachside interiors. Perfect for a business lunch or a romantic dinner.",     time: "1 hr ago",     staff: "Vikram Nair", avatar: "LC" },
  { id: 18, source: "Google",   branch: "Juhu",    author: "Kavya Reddy",    rating: 4, category: "Service",     sentiment: "positive", text: "Quick and efficient service. Great for people in a hurry. Will definitely return.",     time: "5 hrs ago",    staff: "Vikram Nair", avatar: "KR" },
  { id: 19, source: "Zomato",   branch: "Juhu",    author: "Neha Kulkarni",  rating: 2, category: "Food",        sentiment: "negative", text: "The paneer dishes were overcooked and tasteless. Very disappointing for the price.",     time: "3 hrs ago",    staff: "Vikram Nair", avatar: "NK" },
  { id: 20, source: "Internal", branch: "Juhu",    author: "Aditya Birla",   rating: 5, category: "Staff",       sentiment: "positive", text: "Exceptional staff. The manager came personally to check on us. Felt very valued.",       time: "4 hrs ago",    staff: "Vikram Nair", avatar: "AB" },
  { id: 21, source: "Google",   branch: "Juhu",    author: "Preethi Menon",  rating: 3, category: "Cleanliness", sentiment: "neutral",  text: "Generally clean but the outdoor seating area could be swept more regularly.",           time: "6 hrs ago",    staff: "Vikram Nair", avatar: "PM" },
  { id: 22, source: "Zomato",   branch: "Juhu",    author: "Sanjay Dutt",    rating: 1, category: "Service",     sentiment: "negative", text: "Waited over an hour. No one came to take our order. Had to walk up to the counter.",    time: "8 hrs ago",    staff: "Vikram Nair", avatar: "SD" },
  { id: 23, source: "Internal", branch: "Juhu",    author: "Tina Ambani",    rating: 5, category: "Food",        sentiment: "positive", text: "The thali here is outstanding value. Every dish was fresh, flavourful and generous.",    time: "1 day ago",    staff: "Vikram Nair", avatar: "TA" },
  { id: 24, source: "Google",   branch: "Juhu",    author: "Rahul Bose",     rating: 3, category: "Ambience",    sentiment: "neutral",  text: "Good location but gets very crowded on weekends. The noise level is quite high.",       time: "1 day ago",    staff: "Vikram Nair", avatar: "RB" },
  { id: 25, source: "Internal", branch: "Dadar",   author: "Sophie Turner",  rating: 5, category: "Staff",       sentiment: "positive", text: "The staff made our anniversary dinner truly unforgettable. Extremely thoughtful team.", time: "3 hrs ago",    staff: "Arjun Patel", avatar: "ST" },
  { id: 26, source: "Internal", branch: "Dadar",   author: "Daniel Park",    rating: 5, category: "Food",        sentiment: "positive", text: "Chef's special was absolutely outstanding. The best meal I've had this year easily!",   time: "6 hrs ago",    staff: "Arjun Patel", avatar: "DP" },
  { id: 27, source: "Google",   branch: "Dadar",   author: "Amruta Patil",   rating: 4, category: "Service",     sentiment: "positive", text: "Friendly and prompt service. The staff were knowledgeable about allergens too.",        time: "2 hrs ago",    staff: "Arjun Patel", avatar: "AP" },
  { id: 28, source: "Zomato",   branch: "Dadar",   author: "Ganesh More",    rating: 2, category: "Food",        sentiment: "negative", text: "The food was mediocre and overpriced. The rotis were hard and the curry was bland.",    time: "4 hrs ago",    staff: "Arjun Patel", avatar: "GM" },
  { id: 29, source: "Internal", branch: "Dadar",   author: "Rekha Sawant",   rating: 3, category: "Ambience",    sentiment: "neutral",  text: "Average ambience. Nothing special about the decor but it is comfortable enough.",       time: "5 hrs ago",    staff: "Arjun Patel", avatar: "RS" },
  { id: 30, source: "Google",   branch: "Dadar",   author: "Mahesh Bhatt",   rating: 1, category: "Cleanliness", sentiment: "negative", text: "The place was visibly unclean. Found a hair in my food and the floor was sticky.",      time: "7 hrs ago",    staff: "Arjun Patel", avatar: "MB" },
];

const BRANCHES   = ["All Branches", "Andheri", "Bandra", "Juhu", "Dadar"];
const CATEGORIES = ["All", "Food", "Service", "Staff", "Ambience", "Cleanliness"];
const SENTIMENTS = ["All", "positive", "neutral", "negative"];

const NAV_ITEMS = [
  { id: "overview",   icon: "⬡", label: "Overview",   route: null        },
  { id: "reviews",    icon: "◎", label: "Reviews",    route: null        },
  { id: "analytics",  icon: "⬟", label: "Analytics",  route: null        },
  { id: "rootcause",  icon: "🔍", label: "Root Cause", route: null        },
  { id: "alerts",     icon: "🔔", label: "Alerts",     route: null        },
  { id: "competitor", icon: "⚡", label: "Competitor", route: null        },
  { id: "branches",   icon: "⬢", label: "Branches",   route: null        },
  { id: "staff",      icon: "◈", label: "Staff",      route: null        },
  { id: "qr",         icon: "⊞", label: "QR Code",    route: "/qr"       },
  { id: "feedback",   icon: "✎", label: "Feedback",   route: "/feedback" },
  { id: "manage",     icon: "⊟", label: "Manage",     route: "/manage"   },
];

const BRANCH_DATA = [
  { name: "Andheri", rating: 4.6, reviews: 892,  trend: "+12%", color: "#f97316" },
  { name: "Bandra",  rating: 3.8, reviews: 654,  trend: "-3%",  color: "#3b82f6" },
  { name: "Juhu",    rating: 4.4, reviews: 423,  trend: "+8%",  color: "#22c55e" },
  { name: "Dadar",   rating: 4.7, reviews: 1203, trend: "+21%", color: "#a78bfa" },
];

// ── Enhanced Branch Data ──────────────────────────────────────
const BRANCH_DATA_FULL = [
  {
    name: "Andheri", rating: 4.6, reviews: 892, trend: "+12%", color: "#f97316",
    responseRate: 91, negRate: 9, openSince: "2019", manager: "Ravi Kumar", managerInitials: "RK",
    topComplaint: "Weekend noise", topPraise: "Food quality",
    weeklyReviews: [18, 22, 19, 25, 21, 28, 24],
    sentiment: { positive: 78, neutral: 13, negative: 9 },
    categories: { Food: 88, Service: 72, Staff: 65, Ambience: 54, Cleanliness: 70 },
    recentReviews: [
      { author: "Priya S.", rating: 5, text: "Best biryani in Mumbai! Consistent every visit.", time: "2m ago" },
      { author: "Rohan M.", rating: 4, text: "Great service — Ravi remembered our order.", time: "1h ago" },
      { author: "Sneha J.", rating: 3, text: "A bit noisy on weekends, otherwise perfect.", time: "3h ago" },
    ],
    alerts: [],
  },
  {
    name: "Bandra", rating: 3.8, reviews: 654, trend: "-3%", color: "#3b82f6",
    responseRate: 67, negRate: 28, openSince: "2021", manager: "Neha Singh", managerInitials: "NS",
    topComplaint: "Staff behaviour", topPraise: "Sea-view ambience",
    weeklyReviews: [14, 12, 16, 11, 13, 10, 14],
    sentiment: { positive: 54, neutral: 18, negative: 28 },
    categories: { Food: 70, Service: 45, Staff: 38, Ambience: 82, Cleanliness: 55 },
    recentReviews: [
      { author: "Ahmed K.", rating: 2, text: "Staff was rude when we asked about delays.", time: "18m ago" },
      { author: "Fatima S.", rating: 4, text: "Kebabs here are genuinely the best in the area.", time: "2h ago" },
      { author: "Rahul K.", rating: 3, text: "Nice sea view but interiors feel dated.", time: "3h ago" },
    ],
    alerts: ["High negative rate (28%)", "Staff complaints flagged"],
  },
  {
    name: "Juhu", rating: 4.4, reviews: 423, trend: "+8%", color: "#22c55e",
    responseRate: 82, negRate: 14, openSince: "2020", manager: "Vikram Nair", managerInitials: "VN",
    topComplaint: "Weekend crowds", topPraise: "Beachside ambience",
    weeklyReviews: [10, 14, 12, 16, 13, 18, 15],
    sentiment: { positive: 72, neutral: 14, negative: 14 },
    categories: { Food: 75, Service: 80, Staff: 85, Ambience: 92, Cleanliness: 68 },
    recentReviews: [
      { author: "Lisa C.", rating: 4, text: "Perfect for a business lunch — calm and beautiful.", time: "1h ago" },
      { author: "Kavya R.", rating: 4, text: "Quick and efficient. Will definitely return.", time: "5h ago" },
      { author: "Neha K.", rating: 2, text: "Paneer dishes were overcooked — very disappointing.", time: "3h ago" },
    ],
    alerts: [],
  },
  {
    name: "Dadar", rating: 4.7, reviews: 1203, trend: "+21%", color: "#a78bfa",
    responseRate: 95, negRate: 7, openSince: "2018", manager: "Arjun Patel", managerInitials: "AP",
    topComplaint: "Weekend wait times", topPraise: "Staff friendliness",
    weeklyReviews: [28, 32, 30, 38, 35, 42, 38],
    sentiment: { positive: 85, neutral: 8, negative: 7 },
    categories: { Food: 92, Service: 88, Staff: 95, Ambience: 76, Cleanliness: 84 },
    recentReviews: [
      { author: "Sophie T.", rating: 5, text: "Staff made our anniversary dinner unforgettable!", time: "3h ago" },
      { author: "Daniel P.", rating: 5, text: "Chef's special was the best meal I've had this year.", time: "6h ago" },
      { author: "Ganesh M.", rating: 2, text: "Rotis were hard and curry was bland — overpriced.", time: "4h ago" },
    ],
    alerts: [],
  },
];

// ── Enhanced Staff Data ───────────────────────────────────────
const STAFF_DATA_FULL = [
  {
    name: "Vikram Nair", role: "Branch Manager", branch: "Juhu", rating: 4.9,
    mentions: 67, sentiment: 96, badge: "Top Rated", badgeType: "top", color: "#a78bfa",
    initials: "VN", shift: "Morning", joined: "Jan 2019", responseTime: "8 min", resolved: 14,
    weeklyMentions: [8, 10, 9, 12, 10, 14, 11],
    strengths: ["Customer relations", "Conflict resolution", "Leadership"],
    improvements: [],
    stats: { pos: 64, neg: 3 },
    feedback: [
      { text: "The manager came personally to check on us — felt so valued.", rating: 5, source: "Google" },
      { text: "Vikram resolved our complaint immediately and professionally.", rating: 5, source: "Zomato" },
    ],
  },
  {
    name: "Ravi Kumar", role: "Head Waiter", branch: "Andheri", rating: 4.8,
    mentions: 52, sentiment: 92, badge: "Excellent", badgeType: "excellent", color: "#f97316",
    initials: "RK", shift: "Evening", joined: "Mar 2020", responseTime: "12 min", resolved: 8,
    weeklyMentions: [6, 8, 7, 9, 8, 10, 8],
    strengths: ["Guest memory", "Attentiveness", "Upselling"],
    improvements: ["Punctuality"],
    stats: { pos: 48, neg: 4 },
    feedback: [
      { text: "Ravi remembered our anniversary and brought a complimentary dessert!", rating: 5, source: "Google" },
      { text: "Our waiter made the whole evening special. Outstanding service.", rating: 4, source: "Zomato" },
    ],
  },
  {
    name: "Neha Singh", role: "Hostess", branch: "Bandra", rating: 4.6,
    mentions: 38, sentiment: 88, badge: "Great", badgeType: "great", color: "#3b82f6",
    initials: "NS", shift: "Split", joined: "Jul 2021", responseTime: "15 min", resolved: 6,
    weeklyMentions: [4, 6, 5, 7, 5, 6, 5],
    strengths: ["Guest greeting", "Queue management", "Communication"],
    improvements: ["Menu knowledge"],
    stats: { pos: 33, neg: 5 },
    feedback: [
      { text: "Neha was so warm and welcoming at the entrance. Lovely first impression.", rating: 5, source: "Google" },
      { text: "Managed a long queue professionally — no one complained.", rating: 4, source: "Internal" },
    ],
  },
  {
    name: "Arjun Patel", role: "Sous Chef", branch: "Dadar", rating: 4.1,
    mentions: 29, sentiment: 74, badge: "Good", badgeType: "average", color: "#22c55e",
    initials: "AP", shift: "Morning", joined: "Sep 2022", responseTime: "N/A", resolved: 2,
    weeklyMentions: [3, 4, 3, 5, 4, 5, 4],
    strengths: ["Consistency", "Creative specials"],
    improvements: ["Portion control", "Temperature checks"],
    stats: { pos: 21, neg: 8 },
    feedback: [
      { text: "Chef's special was the best dish I've had in years. Outstanding!", rating: 5, source: "Internal" },
      { text: "Rotis were a bit hard today — inconsistent compared to last visit.", rating: 2, source: "Google" },
    ],
  },
  {
    name: "Meera Das", role: "Waiter", branch: "Andheri", rating: 2.9,
    mentions: 14, sentiment: 41, badge: "Needs Coaching", badgeType: "review", color: "#f87171",
    initials: "MD", shift: "Evening", joined: "Feb 2023", responseTime: "45 min", resolved: 0,
    weeklyMentions: [1, 2, 1, 3, 2, 2, 1],
    strengths: [],
    improvements: ["Responsiveness", "Table management", "Customer empathy"],
    stats: { pos: 5, neg: 9 },
    feedback: [
      { text: "Had to ask three times for the menu. Completely inattentive.", rating: 1, source: "Zomato" },
      { text: "Tables were not cleaned properly between customers.", rating: 2, source: "Google" },
    ],
  },
];

const REVIEW_TAGS = [
  { name: "Food Quality",   pct: 45, mentions: 1478, color: "#22c55e", icon: "🍛" },
  { name: "Service Delay",  pct: 32, mentions: 1051, color: "#ef4444", icon: "⏱" },
  { name: "Staff Behavior", pct: 18, mentions: 591,  color: "#f97316", icon: "👤" },
  { name: "Cleanliness",    pct: 12, mentions: 394,  color: "#3b82f6", icon: "🧹" },
  { name: "Ambience",       pct:  9, mentions: 295,  color: "#a78bfa", icon: "✨" },
];

const TRENDING_TAGS = [
  { label: "Biryani Quality", icon: "🔥" },
  { label: "New Menu",        icon: "✨" },
  { label: "Wait Time",       icon: "⚠"  },
];

const MONTHLY_TRENDS = [
  { month: "Aug", positive: 68, neutral: 18, negative: 14 },
  { month: "Sep", positive: 72, neutral: 15, negative: 13 },
  { month: "Oct", positive: 65, neutral: 20, negative: 15 },
  { month: "Nov", positive: 78, neutral: 12, negative: 10 },
  { month: "Dec", positive: 74, neutral: 16, negative: 10 },
  { month: "Jan", positive: 82, neutral: 11, negative:  7 },
];

const RESPONSES = {
  positive: [
    "Thank you so much! We're thrilled you had a wonderful experience. We look forward to seeing you again soon! 🌟",
    "Wonderful feedback! Your kind words motivate our entire team to keep delivering excellence.",
  ],
  neutral: [
    "Thank you for your honest feedback. We're always looking to improve and will take your comments on board.",
  ],
  negative: [
    "We sincerely apologize for this experience. This doesn't reflect our standards. Please contact us at care@brand.com so we can make it right.",
    "We're very sorry to hear this. Your feedback has been escalated to our branch manager for immediate attention.",
  ],
};

function mapApiReview(r) {
  return {
    id: r.id + 10000, source: r.source || "Google Form", branch: r.branch,
    author: r.reviewer, rating: r.rating,
    category: (r.categories && r.categories[0]) || "General",
    sentiment: r.sentiment || "neutral", text: r.text, time: r.timestamp,
    staff: "—", avatar: r.reviewer.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
    ai_response: r.ai_response, fromSheet: true,
  };
}

// ── Shared Sub-components ─────────────────────────────────────
function StarRating({ rating, size = "sm" }) {
  return (
    <div className={`stars stars--${size}`}>
      {[1,2,3,4,5].map(s => <span key={s} className={`star ${s <= rating ? "star--filled" : ""}`}>★</span>)}
    </div>
  );
}

function AnimatedNumber({ value, duration = 1500 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(ease * value));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);
  return <span>{display.toLocaleString()}</span>;
}

function MetricCard({ icon, label, value, sub, color, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div className={`metric-card metric-card--${color} ${visible ? "metric-card--visible" : ""}`}>
      <div className="metric-card__icon">{icon}</div>
      <div className="metric-card__content">
        <div className="metric-card__value">
          {visible && typeof value === "number" && <AnimatedNumber value={value} />}
          {typeof value === "string" && value}
        </div>
        <div className="metric-card__label">{label}</div>
        {sub && <div className="metric-card__sub">{sub}</div>}
      </div>
      <div className="metric-card__glow" />
    </div>
  );
}

function SentimentBar({ positive, neutral, negative }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);
  return (
    <div className="sentiment-bar">
      <div className="sentiment-bar__track">
        <div className="sentiment-bar__fill sentiment-bar__fill--pos" style={{ width: animated ? `${positive}%` : "0%" }} />
        <div className="sentiment-bar__fill sentiment-bar__fill--neu" style={{ width: animated ? `${neutral}%`  : "0%" }} />
        <div className="sentiment-bar__fill sentiment-bar__fill--neg" style={{ width: animated ? `${negative}%` : "0%" }} />
      </div>
      <div className="sentiment-bar__labels">
        <span className="tag tag--pos">▲ {positive}%</span>
        <span className="tag tag--neu">● {neutral}%</span>
        <span className="tag tag--neg">▼ {negative}%</span>
      </div>
    </div>
  );
}

function TrendChart({ data }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 500); return () => clearTimeout(t); }, []);
  const h = 120, w = 400;
  const pts = data.map((d, i) => ({ x: (i / (data.length - 1)) * (w - 40) + 20, y: h - (d.positive / 100) * (h - 20) }));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = `${pathD} L${pts[pts.length-1].x},${h} L${pts[0].x},${h} Z`;
  return (
    <div className="trend-chart">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00e5a0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#00e5a0" stopOpacity="0" />
          </linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <path d={areaD} fill="url(#chartGrad)" className={`chart-area ${animated ? "chart-area--visible" : ""}`} />
        <path d={pathD} fill="none" stroke="#00e5a0" strokeWidth="2.5" filter="url(#glow)" className={`chart-line ${animated ? "chart-line--visible" : ""}`} />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#00e5a0" filter="url(#glow)" className={`chart-dot ${animated ? "chart-dot--visible" : ""}`} style={{ animationDelay: `${i * 0.1}s` }} />
            <text x={p.x} y={h - 2} textAnchor="middle" fontSize="10" fill="#8899aa">{data[i].month}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function DonutChart({ positive, neutral, negative }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);
  const r = 54, cx = 70, cy = 70, strokeW = 14;
  const circumference = 2 * Math.PI * r;
  const segments = [
    { pct: positive, color: "#00e5a0", label: "Positive" },
    { pct: neutral,  color: "#94a3b8", label: "Neutral"  },
    { pct: negative, color: "#f87171", label: "Negative" },
  ];
  let offset = 0;
  const arcs = segments.map(seg => {
    const dash = animated ? (seg.pct / 100) * circumference : 0;
    const gap  = circumference - dash;
    const rotation = (offset / 100) * 360 - 90;
    offset += seg.pct;
    return { ...seg, dash, gap, rotation };
  });
  return (
    <div className="donut-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeW} />
        {arcs.map((arc, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={arc.color} strokeWidth={strokeW}
            strokeDasharray={`${arc.dash} ${arc.gap}`} strokeDashoffset={0}
            transform={`rotate(${arc.rotation} ${cx} ${cy})`}
            style={{ transition: `stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1) ${i * 0.15}s`, filter: arc.color === "#00e5a0" ? "drop-shadow(0 0 6px rgba(0,229,160,0.6))" : "none" }}
            strokeLinecap="round"
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="800" fill="#e8f0f8" fontFamily="Plus Jakarta Sans, sans-serif">{positive}%</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="11" fill="#7a93aa" fontFamily="Manrope, sans-serif">Positive</text>
      </svg>
      <div className="donut-legend">
        {segments.map(seg => (
          <div key={seg.label} className="donut-legend__item">
            <span className="donut-legend__dot" style={{ background: seg.color }} />
            <span className="donut-legend__label">{seg.label}</span>
            <span className="donut-legend__val" style={{ color: seg.color }}>{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BranchBarChart({ data }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 500); return () => clearTimeout(t); }, []);
  const maxH = 100;
  return (
    <div className="branch-bar-chart">
      {data.map((b, i) => {
        const h = animated ? (b.rating / 5) * maxH : 0;
        return (
          <div key={b.name} className="branch-bar-col">
            <div className="branch-bar-col__val" style={{ opacity: animated ? 1 : 0, transition: `opacity 0.4s ease ${i * 0.15 + 0.3}s` }}>{b.rating}</div>
            <div className="branch-bar-col__bar-wrap">
              <div className="branch-bar-col__bar" style={{ height: `${h}px`, background: b.color, transition: `height 1s cubic-bezier(0.4,0,0.2,1) ${i * 0.12}s`, boxShadow: `0 0 12px ${b.color}44` }} />
            </div>
            <div className="branch-bar-col__name">{b.name.substring(0, 5)}</div>
          </div>
        );
      })}
    </div>
  );
}

function BranchRatingList({ data }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 600); return () => clearTimeout(t); }, []);
  return (
    <div className="branch-rating-list">
      {data.map((b, i) => (
        <div key={b.name} className="branch-rating-row" style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="branch-rating-row__left">
            <span className="branch-rating-row__dot" style={{ background: b.color, boxShadow: `0 0 5px ${b.color}` }} />
            <div>
              <div className="branch-rating-row__name">{b.name}</div>
              <div className="branch-rating-row__reviews">{b.reviews.toLocaleString()} reviews</div>
            </div>
          </div>
          <div className="branch-rating-row__right">
            <span className="branch-rating-row__score" style={{ color: b.color }}>★ {b.rating}</span>
          </div>
          <div className="branch-rating-row__bar-track">
            <div className="branch-rating-row__bar-fill" style={{ width: animated ? `${(b.rating / 5) * 100}%` : "0%", background: `linear-gradient(90deg, ${b.color}, ${b.color}88)`, transition: `width 1.1s cubic-bezier(0.4,0,0.2,1) ${i * 0.12 + 0.3}s` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewTagsPanel({ tags, trending }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);
  return (
    <div className="review-tags-panel">
      <div className="review-tags-list">
        {tags.map((tag, i) => (
          <div key={tag.name} className="review-tag-row" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="review-tag-row__left">
              <span className="review-tag-row__icon">{tag.icon}</span>
              <div>
                <div className="review-tag-row__name">{tag.name}</div>
                <div className="review-tag-row__mentions">{tag.mentions.toLocaleString()} mentions</div>
              </div>
            </div>
            <span className="review-tag-row__pct" style={{ color: tag.color }}>{tag.pct}%</span>
            <div className="review-tag-row__bar-track">
              <div className="review-tag-row__bar-fill" style={{ width: animated ? `${tag.pct}%` : "0%", background: tag.color, transition: `width 1s cubic-bezier(0.4,0,0.2,1) ${i * 0.1 + 0.3}s`, boxShadow: `0 0 6px ${tag.color}55` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="review-tags-trending">
        <div className="review-tags-trending__label">TRENDING THIS WEEK</div>
        <div className="review-tags-trending__pills">
          {trending.map(t => <span key={t.label} className="trending-pill">{t.icon} {t.label}</span>)}
        </div>
      </div>
    </div>
  );
}

function StaffSnapshot({ staff }) {
  return (
    <div className="staff-snapshot">
      {staff.map((s, i) => (
        <div key={s.name} className="snap-card" style={{ animationDelay: `${i * 0.08}s` }}>
          <div className="snap-card__avatar" style={{ background: s.color }}>
            {s.name.split(" ").map(n => n[0]).join("")}
            <span className="snap-card__status-dot" />
          </div>
          <div className="snap-card__name">{s.name}</div>
          <div className="snap-card__role">{s.role}</div>
          <div className="snap-card__rating">
            <span className="snap-card__score">{s.rating}</span>
            <span className="snap-card__star">★</span>
          </div>
          <div className="snap-card__mentions">{s.mentions} mentions</div>
          <div className={`snap-card__badge snap-card__badge--${s.badgeType}`}>
            {s.badgeType === "excellent" && "✓ "}{s.badgeType === "great" && "✓ "}
            {s.badgeType === "average" && "– "}{s.badgeType === "review" && "▲ "}{s.badgeType === "top" && "★ "}
            {s.badge}
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewCard({ review, index }) {
  const [expanded, setExpanded] = useState(false);
  const [replied, setReplied] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), index * 80); return () => clearTimeout(t); }, [index]);

  const getSuggestion = () => {
    setAiSuggesting(true); setReplyText("");
    const pool = RESPONSES[review.sentiment] || RESPONSES.neutral;
    const text = review.ai_response || pool[Math.floor(Math.random() * pool.length)];
    let i = 0;
    const interval = setInterval(() => {
      setReplyText(text.slice(0, i + 1)); i++;
      if (i >= text.length) { clearInterval(interval); setAiSuggesting(false); }
    }, 18);
  };

  const sourceColorMap = { "Google": "source--Google", "Zomato": "source--Zomato", "Internal": "source--Internal", "Google Form": "source--Internal" };
  const sentimentClass = { positive: "sentiment--pos", neutral: "sentiment--neu", negative: "sentiment--neg" };

  return (
    <div className={`review-card review-card--${review.sentiment} ${visible ? "review-card--visible" : ""}`}>
      <div className="review-card__header">
        <div className="review-card__avatar">{review.avatar}</div>
        <div className="review-card__info">
          <div className="review-card__author">
            {review.author}
            {review.fromSheet && <span className="sheet-badge">SHEET</span>}
          </div>
          <div className="review-card__meta">
            <span className={`source-badge ${sourceColorMap[review.source] || "source--Internal"}`}>{review.source}</span>
            <span className="review-card__branch">{review.branch}</span>
            <span className="review-card__time">{review.time}</span>
          </div>
        </div>
        <div className="review-card__right">
          <StarRating rating={review.rating} />
          <span className={`sentiment-dot ${sentimentClass[review.sentiment]}`} />
        </div>
      </div>
      <div className="review-card__body">
        <p className="review-card__text">{review.text}</p>
        <div className="review-card__tags">
          <span className="tag tag--cat">{review.category}</span>
          <span className="tag tag--staff">👤 {review.staff}</span>
        </div>
      </div>
      {!replied && (
        <div className="review-card__reply-zone">
          {!expanded ? (
            <button className="btn btn--ghost" onClick={() => setExpanded(true)}>↩ Respond</button>
          ) : (
            <div className="reply-editor">
              <textarea className="reply-textarea" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write your response..." rows={3} />
              <div className="reply-actions">
                <button className="btn btn--ai" onClick={getSuggestion} disabled={aiSuggesting}>{aiSuggesting ? "✦ Writing..." : "✦ AI Suggest"}</button>
                <button className="btn btn--send" onClick={() => { setReplied(true); setExpanded(false); }} disabled={!replyText.trim()}>Send ↗</button>
                <button className="btn btn--ghost" onClick={() => { setExpanded(false); setReplyText(""); }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
      {replied && <div className="review-card__replied">✓ Replied</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// ENHANCED BRANCH COMPONENTS
// ═══════════════════════════════════════════════════
function MiniSparkline({ data, color, w = 72, h = 24 }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");
  const last = data[data.length - 1], prev = data[data.length - 2];
  return (
    <svg width={w} height={h} style={{ overflow: "visible", display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 3px ${color}88)` }} />
      <circle
        cx={(data.length - 1) / (data.length - 1) * w}
        cy={h - ((last - min) / range) * (h - 4) - 2}
        r="3" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
}

function SentimentMiniBar({ pos, neu, neg }) {
  const [anim, setAnim] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnim(true), 400); return () => clearTimeout(t); }, []);
  return (
    <div style={{ height: 6, borderRadius: 4, overflow: "hidden", display: "flex", background: "rgba(255,255,255,0.06)" }}>
      <div style={{ width: anim ? `${pos}%` : "0%", background: "var(--accent)", transition: "width 1s ease" }} />
      <div style={{ width: anim ? `${neu}%` : "0%", background: "var(--gold)", transition: "width 1s ease 0.1s" }} />
      <div style={{ width: anim ? `${neg}%` : "0%", background: "var(--red)", transition: "width 1s ease 0.2s" }} />
    </div>
  );
}

function BranchDetailCard({ b, index }) {
  const [expanded, setExpanded] = useState(false);
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), index * 100); return () => clearTimeout(t); }, [index]);
  const trendUp = b.trend.startsWith("+");
  const healthColor = b.negRate <= 10 ? "var(--accent)" : b.negRate <= 20 ? "var(--gold)" : "var(--red)";
  const healthLabel = b.negRate <= 10 ? "Healthy" : b.negRate <= 20 ? "Moderate" : "Needs Attention";

  return (
    <div className="bdc" style={{
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(18px)",
      transition: `opacity 0.5s ease ${index * 100}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 100}ms`,
    }}>
      <div className="bdc__accent-line" style={{ background: `linear-gradient(90deg, ${b.color}, transparent)` }} />
      
      {/* Header */}
      <div className="bdc__header">
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <div className="bdc__dot" style={{ background: b.color, boxShadow: `0 0 8px ${b.color}` }} />
          <div>
            <div className="bdc__name">{b.name}</div>
            <div className="bdc__since">Est. {b.openSince}</div>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div className="bdc__rating" style={{ color: b.color }}>{b.rating}★</div>
          <div className={`bdc__trend ${trendUp ? "bdc__trend--up" : "bdc__trend--down"}`}>{b.trend}</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="bdc__stats">
        {[
          { val: b.reviews.toLocaleString(), lbl: "Reviews", color: "var(--text-primary)" },
          { val: `${b.responseRate}%`, lbl: "Response Rate", color: b.responseRate > 80 ? "var(--accent)" : "var(--gold)" },
          { val: `${b.negRate}%`, lbl: "Neg. Rate", color: b.negRate > 20 ? "var(--red)" : b.negRate > 10 ? "var(--gold)" : "var(--accent)" },
          { val: <MiniSparkline data={b.weeklyReviews} color={b.color} />, lbl: "7-day vol." },
        ].map((s, i) => (
          <div key={i} className="bdc__stat">
            <div className="bdc__stat-val" style={{ color: s.color }}>{s.val}</div>
            <div className="bdc__stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Sentiment */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Sentiment</span>
          <div style={{ display: "flex", gap: 8, fontSize: 10, fontFamily: "var(--font-mono)" }}>
            <span style={{ color: "var(--accent)" }}>+{b.sentiment.positive}%</span>
            <span style={{ color: "var(--text-muted)" }}>{b.sentiment.neutral}%</span>
            <span style={{ color: "var(--red)" }}>−{b.sentiment.negative}%</span>
          </div>
        </div>
        <SentimentMiniBar pos={b.sentiment.positive} neu={b.sentiment.neutral} neg={b.sentiment.negative} />
      </div>

      {/* Manager + Chips */}
      <div className="bdc__meta">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="bdc__manager-av" style={{ background: b.color }}>{b.managerInitials}</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{b.manager}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Branch Manager</div>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          <span className="bdc__chip bdc__chip--good">✓ {b.topPraise}</span>
          <span className="bdc__chip bdc__chip--warn">⚠ {b.topComplaint}</span>
          <span className="bdc__chip" style={{ background: `${healthColor}14`, color: healthColor, border: `1px solid ${healthColor}33` }}>{healthLabel}</span>
        </div>
      </div>

      {/* Alerts */}
      {b.alerts.length > 0 && (
        <div className="bdc__alerts">
          {b.alerts.map(a => <div key={a} className="bdc__alert">⚡ {a}</div>)}
        </div>
      )}

      {/* Expand */}
      <button className="bdc__expand" style={{ color: b.color, borderColor: `${b.color}33`, background: `${b.color}09` }}
        onClick={() => setExpanded(e => !e)}>
        {expanded ? "▲ Collapse" : "▼ Show categories & reviews"}
      </button>

      {expanded && (
        <div className="bdc__expanded">
          <div className="bdc__expanded-grid">
            <div>
              <div className="bdc__exp-title">Category Scores</div>
              {Object.entries(b.categories).map(([cat, score]) => (
                <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: "var(--text-muted)", width: 72, flexShrink: 0 }}>{cat}</span>
                  <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${score}%`, background: b.color, borderRadius: 3, boxShadow: `0 0 6px ${b.color}55`, transition: "width 1.2s ease" }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: b.color, width: 26, textAlign: "right", fontFamily: "var(--font-mono)" }}>{score}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="bdc__exp-title">Recent Reviews</div>
              {b.recentReviews.map((r, i) => (
                <div key={i} className="bdc__review-item">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{r.author}</span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{r.time}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--gold)", marginBottom: 2 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, fontStyle: "italic" }}>"{r.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// ENHANCED STAFF COMPONENTS
// ═══════════════════════════════════════════════════
function StaffFullCard({ s, index }) {
  const [expanded, setExpanded] = useState(false);
  const [vis, setVis] = useState(false);
  const [barAnim, setBarAnim] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setVis(true), index * 90);
    const t2 = setTimeout(() => setBarAnim(true), index * 90 + 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [index]);

  const total = s.stats.pos + s.stats.neg;
  const posPct = total ? Math.round((s.stats.pos / total) * 100) : 0;

  return (
    <div className="sfc" style={{
      opacity: vis ? 1 : 0, transform: vis ? "translateX(0)" : "translateX(-16px)",
      transition: `opacity 0.5s ease ${index * 90}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 90}ms`,
      borderLeft: `3px solid ${s.color}`,
    }}>
      <div className="sfc__main">
        {/* Avatar */}
        <div className="sfc__avatar" style={{ background: `${s.color}22`, border: `2px solid ${s.color}44`, color: s.color }}>
          {s.initials}
          <div className={`sfc__dot ${s.badgeType === "review" ? "sfc__dot--warn" : "sfc__dot--ok"}`} />
        </div>

        {/* Identity */}
        <div className="sfc__identity">
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="sfc__name">{s.name}</span>
            <span className={`sfc__badge sfc__badge--${s.badgeType}`}>{s.badge}</span>
          </div>
          <div className="sfc__role-row">
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{s.role}</span>
            <span style={{ color: "var(--text-muted)", fontSize: 10 }}>·</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.branch}</span>
            <span style={{ color: "var(--text-muted)", fontSize: 10 }}>·</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>⏱ {s.shift}</span>
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 1 }}>Since {s.joined}</div>
        </div>

        {/* Rating */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div className="sfc__big-rating" style={{ color: s.color }}>{s.rating}</div>
          <div style={{ fontSize: 11, color: "var(--gold)" }}>{"★".repeat(Math.round(s.rating))}{"☆".repeat(5 - Math.round(s.rating))}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{s.mentions} mentions</div>
        </div>

        {/* Mini stats */}
        <div className="sfc__stats">
          {[
            { val: `${s.sentiment}%`, lbl: "Positive", color: s.sentiment > 70 ? "var(--accent)" : s.sentiment > 50 ? "var(--gold)" : "var(--red)" },
            { val: s.responseTime, lbl: "Avg Resp.", color: "var(--blue)" },
            { val: s.resolved, lbl: "Resolved", color: "var(--purple)" },
          ].map((x, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: x.color, fontFamily: "var(--font-display)", lineHeight: 1 }}>{x.val}</div>
              <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3, fontFamily: "var(--font-mono)" }}>{x.lbl}</div>
            </div>
          ))}
          <div style={{ textAlign: "center" }}>
            <MiniSparkline data={s.weeklyMentions} color={s.color} w={58} h={20} />
            <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3, fontFamily: "var(--font-mono)" }}>7-day</div>
          </div>
        </div>

        {/* Sentiment bar */}
        <div className="sfc__sent-block">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Sentiment</span>
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: posPct >= 70 ? "var(--accent)" : posPct >= 50 ? "var(--gold)" : "var(--red)" }}>{posPct}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 4, overflow: "hidden", background: "rgba(255,255,255,0.06)" }}>
            <div style={{
              height: "100%", borderRadius: 4,
              width: barAnim ? `${posPct}%` : "0%",
              background: posPct >= 70 ? "linear-gradient(90deg,var(--accent),#0fa8ff)" : posPct >= 50 ? "var(--gold)" : "var(--red)",
              boxShadow: posPct >= 70 ? "0 0 8px rgba(0,229,160,0.4)" : "none",
              transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
            <span style={{ color: "var(--accent)" }}>👍 {s.stats.pos}</span>
            <span style={{ color: "var(--red)" }}>👎 {s.stats.neg}</span>
          </div>
        </div>

        <button className="sfc__expand-btn" style={{ color: s.color, borderColor: `${s.color}33`, background: `${s.color}0a` }}
          onClick={() => setExpanded(e => !e)}>{expanded ? "▲" : "▼"}</button>
      </div>

      {expanded && (
        <div className="sfc__expanded">
          <div className="sfc__expanded-grid">
            <div>
              <div className="sfc__exp-title">Performance</div>
              {s.strengths.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Strengths</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {s.strengths.map(str => <span key={str} style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.25)", color: "var(--accent)" }}>✓ {str}</span>)}
                  </div>
                </div>
              )}
              {s.improvements.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Needs Improvement</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {s.improvements.map(imp => <span key={imp} style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", color: "var(--red)" }}>⚠ {imp}</span>)}
                  </div>
                </div>
              )}
            </div>
            <div>
              <div className="sfc__exp-title">Customer Mentions</div>
              {s.feedback.map((f, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 11, color: "var(--gold)" }}>{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)" }}>{f.source}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>"{f.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────
export default function ReviewDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [branch, setBranch] = useState("All Branches");
  const [category, setCategory] = useState("All");
  const [sentiment, setSentiment] = useState("All");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifCount] = useState(3);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [apiReviews, setApiReviews] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/reviews");
      const data = await res.json();
      if (data.success && data.reviews.length > 0) setApiReviews(data.reviews.map(mapApiReview));
    } catch (e) { console.warn("Could not fetch reviews from backend:", e); }
    finally { setApiLoading(false); }
  };

  useEffect(() => {
    const init = async () => {
      try { await fetch("http://localhost:5000/api/sync-sheet", { method: "POST" }); } catch {}
      await fetchReviews();
    };
    init();
  }, []);

  const syncSheet = async () => {
    setSyncing(true); setSyncMsg("");
    try {
      const res = await fetch("http://localhost:5000/api/sync-sheet", { method: "POST" });
      const data = await res.json();
      setSyncMsg(data.success ? `✅ ${data.message}` : `⚠️ ${data.error}`);
      if (data.success) await fetchReviews();
    } catch { setSyncMsg("⚠️ Cannot reach backend — is app.py running?"); }
    finally { setSyncing(false); setTimeout(() => setSyncMsg(""), 5000); }
  };

  const allReviews = [...apiReviews, ...REVIEWS.filter(r => !apiReviews.some(a => a.author === r.author && a.text === r.text))];
  const apiBranches = [...new Set(apiReviews.map(r => r.branch))];
  const allBranches = ["All Branches", ...new Set([...BRANCHES.slice(1), ...apiBranches])];

  const filtered = allReviews.filter(r => {
    if (branch !== "All Branches" && r.branch !== branch) return false;
    if (category !== "All" && r.category !== category) return false;
    if (sentiment !== "All" && r.sentiment !== sentiment) return false;
    if (search && !r.text.toLowerCase().includes(search.toLowerCase()) && !r.author.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalReviews = 3172 + apiReviews.length;
  const responseRate = 87;
  const csat = 82;
  const activeLabel = NAV_ITEMS.find(n => n.id === activeTab)?.label || "Dashboard";

  // Branch summary stats
  const bestBranch = [...BRANCH_DATA_FULL].sort((a, b) => b.rating - a.rating)[0];
  const worstBranch = [...BRANCH_DATA_FULL].sort((a, b) => a.rating - b.rating)[0];
  const mostReviewed = [...BRANCH_DATA_FULL].sort((a, b) => b.reviews - a.reviews)[0];
  const bestResponse = [...BRANCH_DATA_FULL].sort((a, b) => b.responseRate - a.responseRate)[0];

  // Staff summary stats
  const topStaff = [...STAFF_DATA_FULL].sort((a, b) => b.rating - a.rating)[0];
  const reviewStaff = STAFF_DATA_FULL.find(s => s.badgeType === "review");
  const avgStaffRating = (STAFF_DATA_FULL.reduce((s, x) => s + x.rating, 0) / STAFF_DATA_FULL.length).toFixed(1);
  const totalMentions = STAFF_DATA_FULL.reduce((s, x) => s + x.mentions, 0);

  const STAFF_DATA_DISPLAY = [
    { name: "Ravi Kumar",  role: "Head Waiter", rating: 4.8, mentions: 52, sentiment: 92, badge: "Excellent", badgeType: "excellent", color: "#f97316" },
    { name: "Neha Singh",  role: "Hostess",     rating: 4.6, mentions: 38, sentiment: 88, badge: "Great",     badgeType: "great",     color: "#3b82f6" },
    { name: "Arjun Patel", role: "Sous Chef",   rating: 4.1, mentions: 29, sentiment: 74, badge: "Average",   badgeType: "average",   color: "#22c55e" },
    { name: "Meera Das",   role: "Waiter",      rating: 2.9, mentions: 14, sentiment: 41, badge: "Review",    badgeType: "review",    color: "#ef4444" },
    { name: "Vikram Nair", role: "Manager",     rating: 4.9, mentions: 67, sentiment: 96, badge: "Top Rated", badgeType: "top",       color: "#a78bfa" },
  ];

  return (
    <div className={`dashboard ${sidebarOpen ? "dashboard--sidebar-open" : ""}`}>
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="mobile-header__logo"><span className="mobile-header__logo-icon">◈</span>ReviewHub</div>
        <div className="mobile-header__actions">
          <button className="mobile-header__btn" onClick={() => setMobileSearchOpen(!mobileSearchOpen)}>⌕</button>
          <button className="mobile-header__btn" onClick={syncSheet} disabled={syncing}>{syncing ? "⟳" : "⇩"}</button>
          <button className="mobile-header__btn" onClick={() => setMobileDrawerOpen(true)} style={{ position: "relative" }}>
            ☰{notifCount > 0 && <span className="topbar__notif-count">{notifCount}</span>}
          </button>
        </div>
      </header>

      <div className={`mobile-search-overlay ${mobileSearchOpen ? "mobile-search-overlay--visible" : ""}`}>
        <div className="search-bar" style={{ width: "100%" }}>
          <span className="search-bar__icon">⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reviews..." autoFocus={mobileSearchOpen} style={{ width: "100%" }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14 }}>✕</button>}
        </div>
      </div>

      {mobileDrawerOpen && <div className="mobile-drawer-overlay mobile-drawer-overlay--visible" onClick={() => setMobileDrawerOpen(false)} />}
      <div className={`mobile-drawer ${mobileDrawerOpen ? "mobile-drawer--open" : ""}`}>
        <div className="mobile-drawer__header">
          <span className="mobile-drawer__logo">ReviewHub</span>
          <button className="mobile-drawer__close" onClick={() => setMobileDrawerOpen(false)}>✕</button>
        </div>
        <nav className="mobile-drawer__nav">
          {NAV_ITEMS.map((item, i) => (
            <div key={item.id}>
              {i === 8 && <div className="mobile-drawer__nav-divider" />}
              <button className={`mobile-drawer__nav-item ${activeTab === item.id ? "mobile-drawer__nav-item--active" : ""}`}
                onClick={() => { if (item.route) navigate(item.route); else setActiveTab(item.id); setMobileDrawerOpen(false); }}>
                <span className="mobile-drawer__nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.route && <span className="mobile-drawer__nav-ext">↗</span>}
                {item.id === "reviews" && <span className="sidebar__badge" style={{ marginLeft: "auto" }}>{filtered.length}</span>}
              </button>
            </div>
          ))}
        </nav>
        <div className="mobile-drawer__footer">
          <div className="mobile-drawer__csat-label">CSAT Score</div>
          <div className="mobile-drawer__csat-value">{csat}%</div>
          <div className="mobile-drawer__csat-bar"><div className="mobile-drawer__csat-fill" style={{ width: `${csat}%` }} /></div>
          {syncMsg && <div style={{ marginTop: 12, fontSize: 12, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>{syncMsg}</div>}
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__logo">
          <span className="sidebar__logo-icon">◈</span>
          <span className="sidebar__logo-text">ReviewHub</span>
        </div>
        <nav className="sidebar__nav">
          {NAV_ITEMS.map((item, i) => (
            <div key={item.id}>
              {i === 8 && <div className="sidebar__nav-divider" />}
              <button className={`sidebar__nav-item ${activeTab === item.id ? "sidebar__nav-item--active" : ""}`}
                onClick={() => { if (item.route) navigate(item.route); else setActiveTab(item.id); }}>
                <span className="sidebar__nav-icon">{item.icon}</span>
                <span className="sidebar__nav-label">{item.label}</span>
                {item.id === "reviews" && <span className="sidebar__badge">{filtered.length}</span>}
                {item.route && <span className="sidebar__nav-ext">↗</span>}
              </button>
            </div>
          ))}
        </nav>
        <div className="sidebar__footer">
          <div className="sidebar__csat-label">CSAT Score</div>
          <div className="sidebar__csat-value">{csat}%</div>
          <div className="sidebar__csat-bar"><div className="sidebar__csat-fill" style={{ width: `${csat}%` }} /></div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="topbar">
          <button className="topbar__toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span /><span /><span />
          </button>
          <div className="topbar__title">
            <h1>{activeLabel}</h1>
            <span className="topbar__subtitle">
              Review Management System
              {apiReviews.length > 0 && <span style={{ color: "var(--accent)", marginLeft: 8, fontFamily: "var(--font-mono)", fontSize: 10 }}>● {apiReviews.length} from sheet</span>}
            </span>
          </div>
          <div className="topbar__actions">
            <div className="search-bar">
              <span className="search-bar__icon">⌕</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reviews..." />
            </div>
            {syncMsg && <span className="sync-msg">{syncMsg}</span>}
            <button className="btn btn--sync" onClick={syncSheet} disabled={syncing}>{syncing ? "⟳" : "⇩"} {syncing ? "Syncing..." : "Sync Sheet"}</button>
            <button className="topbar__notif">🔔{notifCount > 0 && <span className="topbar__notif-count">{notifCount}</span>}</button>
            <div className="topbar__avatar">AK</div>
          </div>
        </header>

        <div className="content">

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="tab-panel">
              <div className="metrics-grid">
                <MetricCard icon="◎" label="Total Reviews"  value={totalReviews} sub={`+${apiReviews.length} from Google Sheet`} color="teal"   delay={0}   />
                <MetricCard icon="★" label="Average Rating" value="4.4 ★"        sub="Across all branches"                       color="gold"   delay={100} />
                <MetricCard icon="↩" label="Response Rate"  value={responseRate} sub="% replied within 2h"                      color="blue"   delay={200} />
                <MetricCard icon="◈" label="CSAT Score"     value={csat}         sub="% satisfied customers"                    color="purple" delay={300} />
              </div>
              <div className="overview-triple-grid">
                <div className="card">
                  <div className="card__header"><div><h2>Sentiment Breakdown</h2><div className="card__sub-label">All sources combined</div></div><button className="card__link-btn">Details</button></div>
                  <DonutChart positive={62} neutral={24} negative={14} />
                  <div className="mom-grid">
                    <div className="mom-item mom-item--pos"><div className="mom-item__val">+8%</div><div className="mom-item__label">Positive ↑</div></div>
                    <div className="mom-item mom-item--neu"><div className="mom-item__val">−2%</div><div className="mom-item__label">Neutral ↓</div></div>
                    <div className="mom-item mom-item--neg"><div className="mom-item__val">−6%</div><div className="mom-item__label">Negative ↓</div></div>
                  </div>
                  <div className="mom-label">MONTH-OVER-MONTH</div>
                </div>
                <div className="card">
                  <div className="card__header"><div><h2>Branch Performance</h2><div className="card__sub-label">Avg. rating comparison</div></div><button className="card__link-btn" onClick={() => setActiveTab("branches")}>Full Report</button></div>
                  <BranchBarChart data={BRANCH_DATA} />
                  <BranchRatingList data={BRANCH_DATA} />
                </div>
                <div className="card">
                  <div className="card__header"><div><h2>Top Review Tags</h2><div className="card__sub-label">Most mentioned topics</div></div><button className="card__link-btn">All Tags</button></div>
                  <ReviewTagsPanel tags={REVIEW_TAGS} trending={TRENDING_TAGS} />
                </div>
              </div>
              <div className="card card--full">
                <div className="card__header"><div><h2>Staff Performance Snapshot</h2></div><button className="card__link-btn" onClick={() => setActiveTab("staff")}>All Staff →</button></div>
                <StaffSnapshot staff={STAFF_DATA_DISPLAY} />
              </div>
              <div className="section-grid">
                <div className="card card--wide">
                  <div className="card__header"><h2>Sentiment Overview</h2><span className="card__badge">Last 30 days</span></div>
                  <SentimentBar positive={74} neutral={16} negative={10} />
                  <div className="spacer" />
                  <h3 className="chart-title">Positive Sentiment Trend</h3>
                  <TrendChart data={MONTHLY_TRENDS} />
                </div>
                <div className="card">
                  <div className="card__header"><h2>Recent Activity</h2><span className="card__badge live">● LIVE</span></div>
                  <div className="activity-feed">
                    {allReviews.slice(0, 5).map((r, i) => (
                      <div key={r.id} className="activity-item" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="activity-item__avatar">{r.avatar}</div>
                        <div className="activity-item__content">
                          <div className="activity-item__name">{r.author}</div>
                          <div className="activity-item__meta">{r.source} • {r.branch}</div>
                        </div>
                        <div className="activity-item__right"><StarRating rating={r.rating} size="xs" /><span className={`mini-dot mini-dot--${r.sentiment}`} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card card--full">
                <div className="card__header"><h2>Review Sources</h2></div>
                <div className="source-grid">
                  {[{ name: "Google", count: 1423, pct: 45, icon: "G" }, { name: "Zomato", count: 987, pct: 31, icon: "Z" }, { name: "Internal", count: 762, pct: 24, icon: "◈" }].map(s => (
                    <div key={s.name} className="source-card">
                      <div className={`source-card__icon source--${s.name.toLowerCase()}`}>{s.icon}</div>
                      <div className="source-card__info"><div className="source-card__name">{s.name}</div><div className="source-card__count">{s.count.toLocaleString()} reviews</div></div>
                      <div className="source-card__bar"><div className="source-card__fill" style={{ width: `${s.pct}%` }} /></div>
                      <div className="source-card__pct">{s.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card card--full">
                <div className="card__header"><h2>Quick Actions</h2><span className="card__sub-label" style={{ margin: 0 }}>Open standalone pages</span></div>
                <div className="quick-actions">
                  {[{ icon: "⊞", label: "QR Code Generator", desc: "Share your feedback link via QR code", route: "/qr", color: "var(--accent)" }, { icon: "✎", label: "Feedback Form", desc: "Submit a new customer review directly", route: "/feedback", color: "var(--blue)" }, { icon: "⊟", label: "Manage Reviews", desc: "View, filter and reply to all feedback", route: "/manage", color: "var(--purple)" }].map(a => (
                    <button key={a.route} className="quick-action-card" onClick={() => navigate(a.route)}>
                      <div className="quick-action-card__icon" style={{ color: a.color, background: `color-mix(in srgb, ${a.color} 12%, transparent)` }}>{a.icon}</div>
                      <div className="quick-action-card__body"><div className="quick-action-card__label">{a.label}</div><div className="quick-action-card__desc">{a.desc}</div></div>
                      <span className="quick-action-card__arrow" style={{ color: a.color }}>↗</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* REVIEWS */}
          {activeTab === "reviews" && (
            <div className="tab-panel">
              <div className="filters-bar">
                <select value={branch} onChange={e => setBranch(e.target.value)} className="filter-select">{allBranches.map(b => <option key={b}>{b}</option>)}</select>
                <select value={category} onChange={e => setCategory(e.target.value)} className="filter-select">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
                <select value={sentiment} onChange={e => setSentiment(e.target.value)} className="filter-select">{SENTIMENTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select>
                <span className="filter-count">{filtered.length} reviews</span>
              </div>
              {apiLoading && <div className="loading-state">⟳ Loading sheet reviews…</div>}
              <div className="reviews-list">
                {filtered.map((r, i) => <ReviewCard key={r.id} review={r} index={i} />)}
                {filtered.length === 0 && !apiLoading && <div className="empty-state">No reviews match your filters.</div>}
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="tab-panel">
              <div className="section-grid">
                <div className="card card--wide">
                  <div className="card__header"><h2>Monthly Trends</h2></div>
                  <div className="trend-table">
                    {MONTHLY_TRENDS.map((m, i) => (
                      <div key={m.month} className="trend-row" style={{ animationDelay: `${i * 0.1}s` }}>
                        <span className="trend-row__month">{m.month}</span>
                        <div className="trend-row__bars">
                          <div className="trend-bar trend-bar--pos" style={{ width: `${m.positive * 2}px` }}><span>{m.positive}%</span></div>
                          <div className="trend-bar trend-bar--neu" style={{ width: `${m.neutral * 2}px` }}><span>{m.neutral}%</span></div>
                          <div className="trend-bar trend-bar--neg" style={{ width: `${m.negative * 2}px` }}><span>{m.negative}%</span></div>
                        </div>
                      </div>
                    ))}
                    <div className="trend-legend"><span className="tag tag--pos">Positive</span><span className="tag tag--neu">Neutral</span><span className="tag tag--neg">Negative</span></div>
                  </div>
                </div>
                <div className="card">
                  <div className="card__header"><h2>Category Breakdown</h2></div>
                  <div className="category-list">
                    {[{ name: "Food Quality", pct: 38, color: "#00e5a0" }, { name: "Service", pct: 27, color: "#3b82f6" }, { name: "Staff Behavior", pct: 18, color: "#a78bfa" }, { name: "Ambience", pct: 11, color: "#f59e0b" }, { name: "Cleanliness", pct: 6, color: "#f87171" }].map((c, i) => (
                      <div key={c.name} className="category-item" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="category-item__label">{c.name}</div>
                        <div className="category-item__bar-track"><div className="category-item__bar-fill" style={{ width: `${c.pct}%`, background: c.color }} /></div>
                        <div className="category-item__pct" style={{ color: c.color }}>{c.pct}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card card--full">
                <div className="card__header"><h2>Escalation Alerts</h2><span className="card__badge card__badge--red">{allReviews.filter(r => r.rating <= 2).length} critical</span></div>
                <div className="escalation-list">
                  {allReviews.filter(r => r.rating <= 2).map((r, i) => (
                    <div key={r.id} className="escalation-item" style={{ animationDelay: `${i * 0.1}s` }}>
                      <span className="escalation-icon">⚠</span>
                      <div className="escalation-content"><strong>{r.author}</strong> — {r.branch} — <em>"{r.text.slice(0, 60)}..."</em></div>
                      <span className="escalation-time">{r.time}</span>
                      <button className="btn btn--escalate">Escalate</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ ENHANCED BRANCHES ═══════════════ */}
          {activeTab === "branches" && (
            <div className="tab-panel">
              {/* Summary strip */}
              <div className="branch-summary-strip">
                {[
                  { icon: "🏆", label: "Top Rated", value: bestBranch.name, sub: `${bestBranch.rating}★ avg`, color: bestBranch.color },
                  { icon: "📊", label: "Most Reviewed", value: mostReviewed.name, sub: `${mostReviewed.reviews.toLocaleString()} reviews`, color: mostReviewed.color },
                  { icon: "💬", label: "Best Response Rate", value: bestResponse.name, sub: `${bestResponse.responseRate}% replied`, color: bestResponse.color },
                  { icon: "⚠️", label: "Needs Attention", value: worstBranch.name, sub: `${worstBranch.rating}★ · ${worstBranch.negRate}% negative`, color: "var(--red)" },
                ].map((s, i) => (
                  <div key={i} className="bss-item" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="bss-icon">{s.icon}</div>
                    <div>
                      <div className="bss-label">{s.label}</div>
                      <div className="bss-value" style={{ color: s.color }}>{s.value}</div>
                      <div className="bss-sub">{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detail cards grid */}
              <div className="branch-detail-grid">
                {BRANCH_DATA_FULL.map((b, i) => <BranchDetailCard key={b.name} b={b} index={i} />)}
              </div>

              {/* Comparison table */}
              <div className="card card--full">
                <div className="card__header">
                  <div><h2>Branch Comparison</h2><div className="card__sub-label">Side-by-side across all metrics</div></div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <div className="bct-header">
                    {["Branch", "Rating", "Reviews", "Response Rate", "Neg. Rate", "Sentiment", "Status"].map(h => (
                      <div key={h} className={`bct-cell ${h === "Branch" ? "bct-name-cell" : "bct-head"}`}>{h}</div>
                    ))}
                  </div>
                  {[...BRANCH_DATA_FULL].sort((a, b) => b.rating - a.rating).map((b, i) => {
                    const hc = b.negRate <= 10 ? "var(--accent)" : b.negRate <= 20 ? "var(--gold)" : "var(--red)";
                    const hl = b.negRate <= 10 ? "Healthy" : b.negRate <= 20 ? "Moderate" : "Needs Attention";
                    return (
                      <div key={b.name} className="bct-row" style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="bct-cell bct-name-cell"><div style={{ width: 8, height: 8, borderRadius: 2, background: b.color, flexShrink: 0 }} /><span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{b.name}</span></div>
                        <div className="bct-cell" style={{ color: b.color, fontWeight: 800, fontFamily: "var(--font-display)" }}>{b.rating}★</div>
                        <div className="bct-cell" style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{b.reviews.toLocaleString()}</div>
                        <div className="bct-cell"><span style={{ color: b.responseRate > 80 ? "var(--accent)" : "var(--gold)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{b.responseRate}%</span></div>
                        <div className="bct-cell"><span style={{ color: b.negRate > 20 ? "var(--red)" : b.negRate > 10 ? "var(--gold)" : "var(--accent)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{b.negRate}%</span></div>
                        <div className="bct-cell" style={{ minWidth: 120 }}><SentimentMiniBar pos={b.sentiment.positive} neu={b.sentiment.neutral} neg={b.sentiment.negative} /></div>
                        <div className="bct-cell"><span className="bct-badge" style={{ color: hc, background: `${hc}14`, border: `1px solid ${hc}30` }}>{hl}</span></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ ENHANCED STAFF ═══════════════ */}
          {activeTab === "staff" && (
            <div className="tab-panel">
              {/* Summary strip */}
              <div className="staff-summary-strip">
                {[
                  { icon: "⭐", label: "Team Avg Rating", value: avgStaffRating, sub: "across all staff", color: "var(--gold)" },
                  { icon: "💬", label: "Total Mentions", value: totalMentions, sub: "in customer reviews", color: "var(--blue)" },
                  { icon: "🏆", label: "Top Performer", value: topStaff.name, sub: `${topStaff.rating}★ · ${topStaff.sentiment}% positive`, color: topStaff.color },
                  { icon: "🔺", label: "Needs Coaching", value: reviewStaff?.name || "—", sub: reviewStaff ? `${reviewStaff.sentiment}% positive rate` : "", color: "var(--red)" },
                ].map((s, i) => (
                  <div key={i} className="sss-item" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="sss-icon">{s.icon}</div>
                    <div>
                      <div className="sss-label">{s.label}</div>
                      <div className="sss-value" style={{ color: s.color }}>{s.value}</div>
                      <div className="sss-sub">{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Staff full cards */}
              <div className="sfc-list">
                {[...STAFF_DATA_FULL].sort((a, b) => b.rating - a.rating).map((s, i) => (
                  <StaffFullCard key={s.name} s={s} index={i} />
                ))}
              </div>

              {/* Leaderboard */}
              <div className="card card--full">
                <div className="card__header"><div><h2>Staff Leaderboard</h2><div className="card__sub-label">Ranked by customer sentiment score</div></div></div>
                <div className="slb-list">
                  {[...STAFF_DATA_FULL].sort((a, b) => b.sentiment - a.sentiment).map((s, i) => (
                    <div key={s.name} className="slb-row" style={{ animationDelay: `${i * 80}ms` }}>
                      <div className={`slb-rank ${i === 0 ? "slb-rank--gold" : i === 1 ? "slb-rank--silver" : i === 2 ? "slb-rank--bronze" : ""}`}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </div>
                      <div className="slb-avatar" style={{ background: s.color }}>{s.initials}</div>
                      <div className="slb-info"><div className="slb-name">{s.name}</div><div className="slb-role">{s.role} · {s.branch}</div></div>
                      <div className="slb-bar-wrap">
                        <div className="slb-bar-track">
                          <div className="slb-bar-fill" style={{ width: `${s.sentiment}%`, background: s.sentiment >= 80 ? `linear-gradient(90deg,${s.color},${s.color}88)` : s.color, boxShadow: s.sentiment >= 80 ? `0 0 8px ${s.color}55` : "none" }} />
                        </div>
                        <span className="slb-pct" style={{ color: s.color }}>{s.sentiment}%</span>
                      </div>
                      <div className="slb-rating" style={{ color: s.color }}>{s.rating}★</div>
                      <span className={`slb-badge slb-badge--${s.badgeType}`}>{s.badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "rootcause"  && <div className="tab-panel"><RootCauseAnalyzer /></div>}
          {activeTab === "alerts"     && <div className="tab-panel"><SmartAlerts /></div>}
          {activeTab === "competitor" && <div className="tab-panel"><CompetitorComparison /></div>}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-bottom-nav">
        <div className="mobile-bottom-nav__items">
          {[{ id: "overview", icon: "⬡", label: "Home" }, { id: "reviews", icon: "◎", label: "Reviews" }, { id: "analytics", icon: "⬟", label: "Analytics" }, { id: "branches", icon: "⬢", label: "Branches" }, { id: "staff", icon: "◈", label: "Staff" }].map(item => (
            <button key={item.id} className={`mobile-bottom-nav__item ${activeTab === item.id ? "mobile-bottom-nav__item--active" : ""}`} onClick={() => setActiveTab(item.id)}>
              <span className="mobile-bottom-nav__icon">{item.icon}</span>
              <span className="mobile-bottom-nav__label">{item.label}</span>
              {item.id === "reviews" && filtered.length > 0 && <span className="mobile-bottom-nav__badge">{filtered.length > 99 ? "99+" : filtered.length}</span>}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}