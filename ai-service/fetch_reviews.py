"""
Zomato Review Scraper → Firebase Firestore (via Node.js backend)
=================================================================
No MongoDB ObjectIds needed! Uses branchName directly.

Install:
    pip install selenium webdriver-manager requests

Run:
    1. node server.js   (Terminal 1)
    2. python app.py    (Terminal 2)
    3. python fetch_reviews.py  (Terminal 3)
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
import requests
import re
from datetime import datetime

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
NODE_API  = "http://localhost:3001"
FLASK_API = "http://localhost:5000"

# No ObjectIds needed for Firebase — just use branch names!
RESTAURANTS = [
    {
        "url":    "https://www.zomato.com/mumbai/bandra-bistro-hill-road-bandra-west/reviews",
        "branch": "Bandra",
        "name":   "Grandma's Cafe"
    },
    {
        "url":    "https://www.zomato.com/mumbai/fumi-andheri/reviews",
        "branch": "Andheri",
        "name":   "Fumi"
    },
    {
        "url":    "https://www.zomato.com/mumbai/fumi-juhu/reviews",
        "branch": "Juhu",
        "name":   "Fumi"
    },
]

# Known staff names to detect in reviews
KNOWN_STAFF = [
    "ravi", "rahul", "priya", "amit", "sneha", "raj", "pooja",
    "arjun", "meera", "vikram", "ananya", "karan"
]

# ─────────────────────────────────────────────
# NLP HELPERS
# ─────────────────────────────────────────────
POSITIVE_WORDS = [
    "amazing", "great", "excellent", "good", "best", "fantastic", "wonderful",
    "awesome", "love", "helpful", "friendly", "clean", "fresh", "happy",
    "enjoyed", "perfect", "outstanding", "polite", "fast", "delicious",
    "superb", "brilliant", "impressive", "recommend", "favorite", "favourite"
]
NEGATIVE_WORDS = [
    "terrible", "bad", "worst", "rude", "disappointed", "horrible", "awful",
    "disgusting", "cold", "slow", "ignored", "dirty", "waited", "poor",
    "never", "pathetic", "unprofessional", "stale", "overpriced",
    "unacceptable", "inedible", "disappointing", "mediocre", "avoid"
]
CATEGORY_KEYWORDS = {
    "food":        ["food", "dish", "taste", "meal", "portion", "fresh", "stale",
                    "cold", "delicious", "bland", "biryani", "sushi", "ramen",
                    "waffle", "pancake", "menu", "cuisine", "ingredient", "spicy"],
    "service":     ["service", "quick", "delivery", "order", "attention", "prompt", "attentive"],
    "cleanliness": ["clean", "dirty", "hygiene", "washroom", "sanitize", "neat",
                    "insect", "pest", "hair", "smell", "smelled"],
    "ambiance":    ["ambience", "ambiance", "noise", "music", "decor", "atmosphere",
                    "comfortable", "seating", "cozy", "vibe", "lighting", "interior"],
    "wait_time":   ["wait", "waited", "waiting", "slow", "fast", "quick", "long",
                    "minutes", "hours", "delay", "delayed"],
    "staff":       ["staff", "waiter", "manager", "rude", "polite", "helpful",
                    "friendly", "ignored", "attitude", "behavior", "server"],
}

def get_time_slot(hour):
    if 6 <= hour < 12:  return "morning"
    if 12 <= hour < 17: return "afternoon"
    if 17 <= hour < 21: return "evening"
    return "night"

def analyze_sentiment(text):
    t = text.lower()
    pos = sum(1 for w in POSITIVE_WORDS if w in t)
    neg = sum(1 for w in NEGATIVE_WORDS if w in t)
    if pos > neg: return "positive"
    if neg > pos: return "negative"
    return "neutral"

def extract_categories(text):
    t = text.lower()
    found = [cat for cat, kws in CATEGORY_KEYWORDS.items() if any(kw in t for kw in kws)]
    return found if found else ["general"]

def extract_staff(text):
    t = text.lower()
    return [name.capitalize() for name in KNOWN_STAFF if name in t]

def extract_keywords(text):
    words = re.findall(r'\b[a-z]{4,}\b', text.lower())
    stop = {"this","that","with","have","from","they","were","been","their",
            "there","when","will","would","could","should","also","just","very",
            "really","quite","even","much","more","some","than","then","them",
            "your","what","which"}
    return list(dict.fromkeys(w for w in words if w not in stop))[:10]


# ─────────────────────────────────────────────
# SCRAPER
# ─────────────────────────────────────────────
def scrape_zomato_reviews(url, branch):
    print(f"\n🔍 Scraping: {url}")

    options = webdriver.ChromeOptions()
    #options.add_argument("--headless")    uncomment if you don't want browser to open
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )

    reviews_found = []

    try:
        driver.get(url)
        print("⏳ Waiting for page to load...")
        time.sleep(6)

        print("📜 Scrolling to load more reviews...")
        for _ in range(5):
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)

        # Extract review texts
        review_texts = []
        selectors = [
            "//p[contains(@class,'reviewText')]",
            "//div[contains(@class,'review-text')]",
            "//p[contains(@class,'sc-')]",
            "//*[@class and string-length(text()) > 80]",
        ]
        skip_words = ["zomato", "order now", "menu", "login", "sign up", "download"]

        for selector in selectors:
            try:
                elements = driver.find_elements(By.XPATH, selector)
                if elements:
                    for el in elements:
                        text = el.text.strip()
                        if 60 < len(text) < 2000 and not any(w in text.lower()[:60] for w in skip_words):
                            review_texts.append(text)
                    if review_texts:
                        break
            except Exception:
                continue

        # Fallback
        if not review_texts:
            print("⚠  Trying fallback...")
            for el in driver.find_elements(By.XPATH, "//*[text()]"):
                text = el.text.strip()
                if 80 < len(text) < 1000 and not any(w in text.lower()[:50] for w in skip_words):
                    review_texts.append(text)

        # Deduplicate
        seen, unique_texts = set(), []
        for t in review_texts:
            if t not in seen:
                seen.add(t)
                unique_texts.append(t)

        print(f"📝 Found {len(unique_texts)} unique reviews")

        # Extract reviewer names
        reviewer_names = []
        for selector in ["//a[contains(@href,'/users/')]",
                         "//span[contains(@class,'user')]",
                         "//div[contains(@class,'userName')]"]:
            try:
                els = driver.find_elements(By.XPATH, selector)
                if els:
                    for el in els:
                        name = el.text.strip()
                        if name and 2 < len(name) < 50:
                            reviewer_names.append(name)
                    break
            except Exception:
                continue

        # Extract ratings
        ratings = []
        for selector in ["//div[contains(@aria-label,'Rated')]",
                         "//*[contains(@class,'rating')]"]:
            try:
                els = driver.find_elements(By.XPATH, selector)
                for el in els:
                    label = el.get_attribute("aria-label") or el.text
                    for num in ["5", "4", "3", "2", "1"]:
                        if num in label:
                            ratings.append(int(num))
                            break
                if ratings:
                    break
            except Exception:
                continue

        # Build review objects
        now = datetime.now()
        for i, text in enumerate(unique_texts[:15]):
            reviewer = reviewer_names[i] if i < len(reviewer_names) else f"Zomato User {i+1}"
            rating   = ratings[i] if i < len(ratings) else 4
            sentiment = analyze_sentiment(text)

            review = {
                # Firebase doesn't need branchId ObjectId — just use name
                "branchName":     branch,
                "reviewerName":   reviewer,
                "rating":         rating,
                "text":           text,
                "sentiment":      sentiment,
                "category":       extract_categories(text),
                "staffMentioned": extract_staff(text),
                "keywords":       extract_keywords(text),
                "visitTime": {
                    "dayOfWeek": now.strftime("%A"),
                    "timeSlot":  get_time_slot(now.hour),
                    "date":      now.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                },
                "source": "zomato",
            }

            reviews_found.append(review)
            print(f"  ✅ {reviewer[:25]!r:28} | {rating}⭐ | {sentiment}")

    except Exception as e:
        print(f"❌ Scrape error: {e}")
    finally:
        driver.quit()

    return reviews_found


# ─────────────────────────────────────────────
# SEND TO BACKENDS
# ─────────────────────────────────────────────
def send_to_node(review):
    """Send to Firebase via Node.js backend"""
    try:
        res = requests.post(f"{NODE_API}/api/reviews", json=review, timeout=10)
        if res.status_code in [200, 201]:
            print(f"  🔥 Firebase saved: {review['reviewerName'][:25]}")
            return True
        else:
            print(f"  ❌ Node error ({res.status_code}): {res.text[:100]}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"  ❌ Cannot connect to Node at {NODE_API} — is node server.js running?")
        return False

def send_to_flask(review):
    """Also sync to Flask dashboard"""
    flask_payload = {
        "branch":   review["branchName"],
        "reviewer": review["reviewerName"],
        "rating":   review["rating"],
        "text":     review["text"],
        "source":   "Zomato",
    }
    try:
        res = requests.post(f"{FLASK_API}/api/reviews", json=flask_payload, timeout=10)
        return res.json().get("success", False)
    except Exception:
        return False


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("\n" + "="*55)
    print("  ZOMATO SCRAPER → FIREBASE FIRESTORE")
    print("="*55)
    print(f"  Node (Firebase): {NODE_API}")
    print(f"  Flask dashboard: {FLASK_API}")
    print("="*55)

    total_firebase = 0
    total_flask    = 0

    for restaurant in RESTAURANTS:
        print(f"\n🍽️  {restaurant['name']} — {restaurant['branch']}")
        reviews = scrape_zomato_reviews(restaurant["url"], restaurant["branch"])

        if not reviews:
            print("  ⚠  No reviews found — Zomato may be blocking.")
            print("     Try removing the --headless line in the scraper.")
            continue

        print(f"\n  📤 Sending {len(reviews)} reviews...")
        for review in reviews:
            if send_to_node(review):  total_firebase += 1
            if send_to_flask(review): total_flask    += 1
            time.sleep(10)

    print("\n" + "="*55)
    print(f"  🔥 Firebase : {total_firebase} reviews saved")
    print(f"  🐍 Flask    : {total_flask} reviews synced")
    print(f"  🌐 Check Firebase Console → Firestore → reviews collection")
    print("="*55)