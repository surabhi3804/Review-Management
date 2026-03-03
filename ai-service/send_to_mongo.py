"""
Send Scraped Reviews to MongoDB Backend
========================================
This sends reviews to your friend's Node.js/MongoDB backend
Run: python send_to_mongo.py
"""

import requests
import json

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
NODE_API = "http://localhost:3001"   # your friend's Node.js backend port
FLASK_API = "http://localhost:5000"  # your Flask backend

# ─────────────────────────────────────────────
# ASK YOUR FRIEND: what is the branchId for each branch?
# They need to give you the MongoDB ObjectId for each branch
# OR we fetch branches from their API first
# ─────────────────────────────────────────────

def get_branches_from_node():
    """Fetch branch list from friend's Node.js backend"""
    try:
        res = requests.get(f"{NODE_API}/api/branches", timeout=5)
        data = res.json()
        print("✅ Got branches from Node backend:", data)
        return data
    except Exception as e:
        print(f"❌ Could not connect to Node backend at {NODE_API}")
        print(f"   Error: {e}")
        print(f"   Ask your friend what port their backend runs on!")
        return []

def get_reviews_from_flask():
    """Get all reviews from your Flask backend"""
    try:
        res = requests.get(f"{FLASK_API}/api/reviews", timeout=5)
        data = res.json()
        reviews = data.get("reviews", [])
        print(f"✅ Got {len(reviews)} reviews from Flask")
        return reviews
    except Exception as e:
        print(f"❌ Could not connect to Flask at {FLASK_API}")
        print(f"   Make sure python app.py is running!")
        return []

def send_review_to_node(review, branch_id):
    """Send a single review to friend's MongoDB backend"""
    # Map your Flask review format to their MongoDB schema
    payload = {
        "branchId": branch_id,
        "branchName": review.get("branch", "Unknown"),
        "reviewerName": review.get("reviewer", "Anonymous"),
        "rating": review.get("rating", 3),
        "text": review.get("text", ""),
        "sentiment": review.get("sentiment", "neutral"),
        "category": review.get("categories", []),
        "staffMentioned": [],
        "source": review.get("source", "manual").lower(),
        "keywords": [],
        "visitTime": {
            "date": review.get("timestamp", "")
        }
    }

    try:
        res = requests.post(
            f"{NODE_API}/api/reviews",
            json=payload,
            timeout=5
        )
        if res.status_code in [200, 201]:
            print(f"  ✅ Sent: {review['reviewer'][:25]} → {review['branch']}")
            return True
        else:
            print(f"  ❌ Failed ({res.status_code}): {res.text[:100]}")
            return False
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False


if __name__ == "__main__":
    print("\n" + "="*50)
    print("  SYNCING REVIEWS → MONGODB")
    print("="*50)

    # Step 1: Get branches from Node backend
    print("\n📡 Step 1: Connecting to your friend's backend...")
    branches = get_branches_from_node()

    if not branches:
        print("\n⚠️  Could not get branches. Ask your friend:")
        print("   1. What port is the Node.js backend running on?")
        print("   2. What is the API endpoint for branches?")
        print("   3. What is the MongoDB ObjectId for each branch?")
        print("\n📋 In the meantime, here are your Flask reviews:")
        reviews = get_reviews_from_flask()
        for r in reviews[:5]:
            print(f"   - {r['reviewer']} | {r['branch']} | {r['sentiment']} | {r['rating']}⭐")
        print(f"\n   Total: {len(reviews)} reviews ready to sync")
        exit()

    # Step 2: Build branch name → id map
    branch_map = {}
    for b in branches:
        # Try common field names
        name = b.get("name") or b.get("branchName") or b.get("branch") or ""
        id_ = b.get("_id") or b.get("id") or ""
        if name and id_:
            branch_map[name] = id_
            print(f"   Branch: {name} → {id_}")

    # Step 3: Get reviews from Flask
    print("\n📥 Step 2: Getting reviews from Flask...")
    reviews = get_reviews_from_flask()

    if not reviews:
        print("No reviews found in Flask!")
        exit()

    # Step 4: Send to MongoDB
    print(f"\n📤 Step 3: Sending {len(reviews)} reviews to MongoDB...")
    success = 0
    for review in reviews:
        branch_name = review.get("branch", "")
        branch_id = branch_map.get(branch_name)

        if not branch_id:
            # Use first available branch id as fallback
            branch_id = list(branch_map.values())[0] if branch_map else "000000000000000000000001"
            print(f"  ⚠ No branch ID for '{branch_name}', using default")

        if send_review_to_node(review, branch_id):
            success += 1

    print(f"\n{'='*50}")
    print(f"  ✅ Synced {success}/{len(reviews)} reviews to MongoDB!")
    print(f"  🌐 Check localhost:3000 to see them")
    print(f"{'='*50}")