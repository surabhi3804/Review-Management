"""
Review Management System - Backend API
=======================================
Local:  python3 app.py
Render: gunicorn app:app

Environment Variables needed on Render:
  GOOGLE_SHEET_CSV_URL  — your Google Sheet published CSV URL
"""

import os
import random
import csv
import io
import ssl
import urllib.request as urlrequest
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# ─────────────────────────────────────────────
# ⚙️  CORS — allows all Vercel preview URLs + localhost
# ─────────────────────────────────────────────
CORS(app, resources={r"/*": {"origins": [
    "https://review-nrgn2k706-surabhi3804s-projects.vercel.app",
    "https://*.vercel.app",          # covers all preview deployments
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]}}, supports_credentials=True)

# ─────────────────────────────────────────────
# ⚙️  GOOGLE SHEET CSV URL
#     On Render → set this as an Environment Variable
#     Locally   → paste your URL here as fallback
# ─────────────────────────────────────────────
GOOGLE_SHEET_CSV_URL = os.environ.get(
    "GOOGLE_SHEET_CSV_URL",
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT25xw-m-5q5HuvfunXkHKEizgYtsvSG_4k4cqzodxVVcdvfQV-IiVoIKiOBJSBXvHwJ0u4JHiGXiby/pub?output=csv"
)

reviews_db = []
review_id_counter = [1]

SAMPLE_REVIEWS = [
    {"id": 1,  "branch": "Bandra",  "source": "Google",   "reviewer": "Rahul Mehta",    "rating": 5, "text": "Grandma's Cafe has the best waffles in Mumbai! Staff was super friendly and the ambience was so cozy.",  "timestamp": "2026-02-20 10:30"},
    {"id": 2,  "branch": "Bandra",  "source": "Zomato",   "reviewer": "Priya Sharma",   "rating": 2, "text": "Waited 40 minutes for cold coffee. The waiter was rude when we complained.",                             "timestamp": "2026-02-20 13:00"},
    {"id": 3,  "branch": "Andheri", "source": "Google",   "reviewer": "Aarav Kulkarni", "rating": 5, "text": "Fumi never disappoints! Amazing sushi and the staff is always so welcoming.",                            "timestamp": "2026-02-21 19:00"},
    {"id": 4,  "branch": "Juhu",    "source": "Internal", "reviewer": "Sneha Patil",    "rating": 1, "text": "Terrible experience. Food was stale and the washroom was dirty.",                                         "timestamp": "2026-02-21 14:00"},
    {"id": 5,  "branch": "Bandra",  "source": "Google",   "reviewer": "Vikram Desai",   "rating": 4, "text": "Food quality is excellent and portions are generous.",                                                     "timestamp": "2026-02-22 20:00"},
    {"id": 6,  "branch": "Andheri", "source": "Zomato",   "reviewer": "Ananya Joshi",   "rating": 3, "text": "Food is decent but nothing special. Service is slow during peak hours.",                                  "timestamp": "2026-02-22 16:00"},
    {"id": 7,  "branch": "Juhu",    "source": "Google",   "reviewer": "Rohan Nair",     "rating": 5, "text": "Absolutely fantastic! Fresh ingredients and staff went above and beyond.",                                "timestamp": "2026-02-23 20:30"},
    {"id": 8,  "branch": "Bandra",  "source": "Internal", "reviewer": "Kavita Iyer",    "rating": 2, "text": "Pancakes were completely burnt. Waiter was unapologetic and rude.",                                       "timestamp": "2026-02-23 11:00"},
    {"id": 9,  "branch": "Andheri", "source": "Zomato",   "reviewer": "Arjun Tiwari",   "rating": 4, "text": "Delivery was quick and food was still hot! The ramen is outstanding.",                                   "timestamp": "2026-02-24 13:00"},
    {"id": 10, "branch": "Juhu",    "source": "Google",   "reviewer": "Meera Pillai",   "rating": 1, "text": "Found a hair in my food, place smelled bad and staff was arguing loudly.",                               "timestamp": "2026-02-24 15:00"},
    {"id": 11, "branch": "Bandra",  "source": "Google",   "reviewer": "Siddharth Rao",  "rating": 5, "text": "Every dish is perfectly prepared. Staff remembered our preferences from last visit.",                     "timestamp": "2026-02-25 19:00"},
    {"id": 12, "branch": "Andheri", "source": "Internal", "reviewer": "Pooja Gupta",    "rating": 3, "text": "Seating is comfortable but food portions are too small for the price.",                                   "timestamp": "2026-02-25 12:00"},
    {"id": 13, "branch": "Juhu",    "source": "Zomato",   "reviewer": "Nikhil Sharma",  "rating": 5, "text": "Best miso soup I have ever had. Service is always fast and staff is extremely polite.",                  "timestamp": "2026-02-26 20:00"},
    {"id": 14, "branch": "Bandra",  "source": "Zomato",   "reviewer": "Divya Menon",    "rating": 2, "text": "Waited 1 hour for simple toast and eggs. Manager was unavailable when we complained.",                   "timestamp": "2026-02-26 10:00"},
    {"id": 15, "branch": "Andheri", "source": "Google",   "reviewer": "Karan Malhotra", "rating": 4, "text": "Great food and polite staff. The sashimi was very fresh.",                                               "timestamp": "2026-02-26 21:00"},
    {"id": 16, "branch": "Juhu",    "source": "Internal", "reviewer": "Riya Kapoor",    "rating": 5, "text": "Birthday dinner was magical! Staff surprised me with a cake.",                                            "timestamp": "2026-02-27 19:30"},
    {"id": 17, "branch": "Bandra",  "source": "Google",   "reviewer": "Aditya Verma",   "rating": 1, "text": "Found insects near our table. Complained to staff and they were completely dismissive.",                  "timestamp": "2026-02-27 21:00"},
    {"id": 18, "branch": "Andheri", "source": "Zomato",   "reviewer": "Ishaan Chopra",  "rating": 4, "text": "Delivery was quick and food was fresh. The chocolate waffle is absolutely amazing.",                     "timestamp": "2026-02-28 12:00"},
    {"id": 19, "branch": "Juhu",    "source": "Google",   "reviewer": "Tanya Singh",    "rating": 3, "text": "Good but inconsistent. Sometimes food is amazing sometimes average.",                                      "timestamp": "2026-02-28 14:00"},
    {"id": 20, "branch": "Bandra",  "source": "Internal", "reviewer": "Manav Jain",     "rating": 5, "text": "Simply the best cafe in Mumbai! Chef personally came to our table. Hygiene is top notch.",               "timestamp": "2026-02-28 20:00"},
]

for r in SAMPLE_REVIEWS:
    r["sentiment"] = None
    r["categories"] = []
    r["ai_response"] = None
    r["status"] = "pending"
    reviews_db.append(r)
review_id_counter[0] = len(SAMPLE_REVIEWS) + 1

# ── Rating text → number ──────────────────────────────────────────────────
RATING_TEXT_MAP = {
    "excellent": 5, "outstanding": 5, "perfect": 5, "amazing": 5, "wonderful": 5, "fantastic": 5,
    "very good": 4, "good": 4, "great": 4,
    "average": 3, "okay": 3, "ok": 3, "satisfactory": 3, "fair": 3, "neutral": 3,
    "bad": 2, "poor": 2, "below average": 2, "disappointing": 2,
    "very bad": 1, "terrible": 1, "horrible": 1, "worst": 1, "awful": 1,
}

def parse_rating(raw):
    if not raw: return 3
    c = str(raw).strip().lower()
    if c in RATING_TEXT_MAP: return RATING_TEXT_MAP[c]
    for key, val in RATING_TEXT_MAP.items():
        if key in c: return val
    try: return max(1, min(5, int(float(c))))
    except: return 3

# ── Sentiment / Categories / AI response ─────────────────────────────────
POSITIVE_WORDS = ["amazing","great","excellent","good","best","fantastic","wonderful","awesome","love","helpful",
                  "friendly","clean","fresh","happy","enjoyed","perfect","outstanding","polite","fast","delicious","nice"]
NEGATIVE_WORDS = ["terrible","bad","worst","rude","disappointed","horrible","awful","disgusting","cold","slow",
                  "ignored","dirty","waited","poor","never","pathetic","stale","overpriced"]

CATEGORY_KEYWORDS = {
    "Food":        ["food","biryani","dish","taste","menu","meal","portion","fresh","stale","cold","delicious","bland","waffle","pancake","sushi","ramen"],
    "Service":     ["service","wait","waited","slow","fast","quick","delivery","order","attention"],
    "Staff":       ["staff","waiter","rude","polite","helpful","friendly","ignored","attitude","behavior"],
    "Ambience":    ["ambience","clean","dirty","noise","music","decor","atmosphere","comfortable","seating","place"],
    "Cleanliness": ["clean","dirty","hygiene","washroom","sanitize","hair","insects"],
}

AI_RESPONSE_TEMPLATES = {
    "positive": [
        "Thank you so much for your wonderful feedback, {name}! We're thrilled that you enjoyed your experience at our {branch} branch. We look forward to welcoming you again soon!",
        "Dear {name}, thank you for the lovely review! It's great to hear that you had a wonderful time at {branch}. See you next time!",
    ],
    "neutral": [
        "Thank you for your feedback, {name}. We're always working to improve — your suggestions help us serve you better at {branch}. Hope to exceed your expectations next visit!",
    ],
    "negative": [
        "Dear {name}, we sincerely apologize for the experience you had at {branch}. Please contact us at manager@restaurant.com so we can personally address your concerns.",
        "Hi {name}, we're truly sorry to hear about your disappointing experience at {branch}. We take all feedback seriously and will immediately investigate.",
    ],
}

def analyze_sentiment(text):
    t = text.lower()
    pos = sum(1 for w in POSITIVE_WORDS if w in t)
    neg = sum(1 for w in NEGATIVE_WORDS if w in t)
    return "positive" if pos > neg else "negative" if neg > pos else "neutral"

def categorize_review(text):
    t = text.lower()
    found = [cat for cat, kws in CATEGORY_KEYWORDS.items() if any(k in t for k in kws)]
    return found if found else ["General"]

def generate_ai_response(name, branch, sentiment):
    return random.choice(AI_RESPONSE_TEMPLATES[sentiment]).format(name=name, branch=branch)

def process_review(r):
    r["sentiment"]   = analyze_sentiment(r["text"])
    r["categories"]  = categorize_review(r["text"])
    r["ai_response"] = generate_ai_response(r["reviewer"], r["branch"], r["sentiment"])
    return r

for r in reviews_db:
    process_review(r)

# ── Google Sheets loader ──────────────────────────────────────────────────
def load_from_google_sheet():
    global review_id_counter

    if not GOOGLE_SHEET_CSV_URL or not GOOGLE_SHEET_CSV_URL.strip():
        return 0, "Google Sheet URL not configured"

    url = GOOGLE_SHEET_CSV_URL.strip()
    if "pubhtml" in url: url = url.replace("pubhtml", "pub")
    if "output=" not in url: url += ("&" if "?" in url else "?") + "output=csv"

    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE

    raw = None
    current_url = url
    for _ in range(5):
        try:
            req = urlrequest.Request(current_url, headers={"User-Agent": "Mozilla/5.0"})
            with urlrequest.urlopen(req, timeout=15, context=ssl_ctx) as resp:
                raw_bytes = resp.read()
                for enc in ("utf-8-sig", "utf-8", "latin-1"):
                    try: raw = raw_bytes.decode(enc); break
                    except UnicodeDecodeError: continue
                break
        except urlrequest.HTTPError as e:
            if e.code in (301, 302, 303, 307, 308):
                current_url = e.headers.get("Location", current_url)
                continue
            return 0, f"HTTP {e.code}: {e.reason}"
        except Exception as e:
            return 0, f"Could not fetch sheet: {str(e)}"

    if raw is None:
        return 0, "Failed to fetch sheet after redirects"

    try:
        reader = csv.DictReader(io.StringIO(raw))
        rows = [{k.strip().lower(): (v or "").strip() for k, v in row.items()} for row in reader]
    except Exception as e:
        return 0, f"CSV parse error: {str(e)}"

    if not rows:
        return 0, "Sheet is empty"

    non_empty = [r for r in rows if any(v for v in r.values())]
    if not non_empty:
        return 0, "Sheet has headers but no data rows"

    print(f"  Columns found in sheet: {list(non_empty[0].keys())}")

    existing = {(r["reviewer"].lower(), r["timestamp"]) for r in reviews_db}
    added = 0

    for row in non_empty:
        reviewer = (row.get("name") or row.get("reviewer") or row.get("customer name")
                    or row.get("customer") or row.get("author") or row.get("user") or "")
        branch   = (row.get("branch") or row.get("location") or row.get("outlet")
                    or row.get("store") or row.get("restaurant") or "")
        text     = (row.get("feedback comment") or row.get("text") or row.get("review")
                    or row.get("comment") or row.get("feedback") or row.get("message")
                    or row.get("comments") or row.get("description") or "")
        rating_raw = (row.get("rating") or row.get("stars") or row.get("score")
                      or row.get("star rating") or "")
        rating_int = parse_rating(rating_raw)
        source    = row.get("source") or row.get("platform") or "Google Form"
        timestamp = (row.get("timestamp") or row.get("date") or row.get("time")
                     or row.get("submitted at") or datetime.now().strftime("%Y-%m-%d %H:%M"))

        if not reviewer or not branch or not text:
            print(f"  Skipping — missing field: name={repr(reviewer)}, branch={repr(branch)}, text={repr(text[:30])}")
            continue

        if (reviewer.lower(), timestamp) in existing:
            continue

        new_review = {
            "id": review_id_counter[0], "branch": branch, "source": source,
            "reviewer": reviewer, "rating": rating_int, "text": text,
            "timestamp": timestamp, "sentiment": None, "categories": [],
            "ai_response": None, "status": "pending",
            "will_revisit": row.get("would you visit again?") or "",
        }
        review_id_counter[0] += 1
        process_review(new_review)
        new_review["status"] = "processed"
        reviews_db.append(new_review)
        existing.add((reviewer.lower(), timestamp))
        added += 1
        print(f"  ✅ {reviewer} | {branch} | {rating_int}★ | {text[:40]}")

    return added, None

# ── API Routes ────────────────────────────────────────────────────────────

# ✅ NEW: Health check endpoint — used by UptimeRobot to keep Render awake
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "total_reviews": len(reviews_db)}), 200

@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "status": "running",
        "total_reviews": len(reviews_db),
        "sheet_connected": bool(GOOGLE_SHEET_CSV_URL and GOOGLE_SHEET_CSV_URL.strip())
    })

@app.route("/api/sync-sheet", methods=["GET", "POST", "OPTIONS"])
def sync_sheet():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    configured = bool(GOOGLE_SHEET_CSV_URL and GOOGLE_SHEET_CSV_URL.strip())

    if request.method == "GET":
        return jsonify({
            "configured": configured,
            "total_reviews": len(reviews_db),
            "message": "Sheet connected ✅" if configured else "⚠️ URL not configured"
        })

    added, error = load_from_google_sheet()
    if error:
        return jsonify({"success": False, "error": error, "total_reviews": len(reviews_db)}), 200
    return jsonify({
        "success": True,
        "message": f"Sync complete — {added} new review(s) added.",
        "added": added,
        "total_reviews": len(reviews_db)
    }), 200

@app.route("/api/reviews", methods=["GET"])
def get_reviews():
    branch    = request.args.get("branch")
    sentiment = request.args.get("sentiment")
    source    = request.args.get("source")
    result    = reviews_db[:]
    if branch:    result = [r for r in result if r["branch"]    == branch]
    if sentiment: result = [r for r in result if r["sentiment"] == sentiment]
    if source:    result = [r for r in result if r["source"]    == source]
    return jsonify({
        "success": True,
        "count": len(result),
        "reviews": sorted(result, key=lambda x: x["timestamp"], reverse=True)
    })

@app.route("/api/reviews", methods=["POST"])
def add_review():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "No JSON"}), 400
    branch   = data.get("branch")
    reviewer = data.get("reviewer") or data.get("name")
    rating   = data.get("rating")
    text     = data.get("text") or data.get("comment")
    if not all([branch, reviewer, rating, text]):
        return jsonify({"success": False, "error": "Missing: branch, reviewer, rating, text"}), 400
    new_review = {
        "id": review_id_counter[0], "branch": branch,
        "source": data.get("source", "QR Form"),
        "reviewer": reviewer, "rating": parse_rating(str(rating)), "text": text,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "sentiment": None, "categories": [], "ai_response": None, "status": "pending"
    }
    review_id_counter[0] += 1
    process_review(new_review)
    new_review["status"] = "processed"
    reviews_db.append(new_review)
    return jsonify({"success": True, "review": new_review}), 201

@app.route("/api/reviews/<int:review_id>/respond", methods=["POST"])
def respond_to_review(review_id):
    data = request.get_json()
    for r in reviews_db:
        if r["id"] == review_id:
            r["status"]           = "responded"
            r["manager_response"] = data.get("response", "")
            r["responded_at"]     = datetime.now().strftime("%Y-%m-%d %H:%M")
            return jsonify({"success": True, "review": r})
    return jsonify({"success": False, "error": "Not found"}), 404

@app.route("/api/analytics", methods=["GET"])
def get_analytics():
    branch = request.args.get("branch")
    data   = reviews_db if not branch else [r for r in reviews_db if r["branch"] == branch]
    if not data:
        return jsonify({"success": True, "analytics": {}})
    sc = {"positive": 0, "neutral": 0, "negative": 0}
    for r in data:
        if r["sentiment"] in sc: sc[r["sentiment"]] += 1
    br = {}
    for r in reviews_db:
        br.setdefault(r["branch"], []).append(r["rating"])
    avg       = round(sum(r["rating"] for r in data) / len(data), 1)
    responded = sum(1 for r in data if r["status"] == "responded")
    return jsonify({"success": True, "analytics": {
        "total_reviews":         len(data),
        "average_rating":        avg,
        "response_rate_percent": round(responded / len(data) * 100, 1),
        "sentiment_breakdown":   sc,
        "branch_avg_ratings":    {b: round(sum(v) / len(v), 1) for b, v in br.items()},
    }})

@app.route("/api/branches", methods=["GET"])
def get_branches():
    return jsonify({"success": True, "branches": sorted({r["branch"] for r in reviews_db})})

# ── Startup ───────────────────────────────────────────────────────────────
# ✅ Auto-sync sheet when Render spins up the server
def startup_sync():
    print("\n" + "=" * 55)
    print("  Review Management System — RUNNING")
    print("=" * 55)
    print("  Syncing Google Sheet on startup …")
    added, error = load_from_google_sheet()
    if error: print(f"  ⚠  {error}")
    else:     print(f"  ✅ Sheet sync done — {added} new review(s) loaded")
    print(f"  Total reviews in memory: {len(reviews_db)}")
    print("=" * 55 + "\n")

# Run startup sync immediately when the module loads (works for both gunicorn & direct run)
startup_sync()

if __name__ == "__main__":
    # ✅ Render injects a PORT env variable — must bind to it, not hardcode 5000
    port = int(os.environ.get("PORT", 5000))
    print(f"  API running at:  http://localhost:{port}")
    app.run(debug=False, host="0.0.0.0", port=port)