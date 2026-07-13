"""
Helper functions the Django views use to talk to the two backing
microservices:
  * the Node.js/MongoDB service (dealers + reviews)
  * the Flask sentiment-analysis service
"""
import requests
from django.conf import settings

BACKEND_URL = settings.BACKEND_URL
SENTIMENT_URL = settings.SENTIMENT_ANALYZER_URL


def get_request(endpoint, **kwargs):
    params = "&".join(f"{k}={v}" for k, v in kwargs.items())
    url = f"{BACKEND_URL}{endpoint}"
    try:
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Network error hitting {url}: {e}")
        return None


def analyze_review_sentiments(text):
    """Call the Flask sentiment microservice for a piece of review text."""
    url = f"{SENTIMENT_URL}/analyze/{requests.utils.quote(text)}"
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        return response.json().get("sentiment", "neutral")
    except requests.exceptions.RequestException as e:
        print(f"Sentiment service error: {e}")
        return "neutral"


def get_dealers_from_cf(state=None):
    """Fetch all dealers, or dealers in a given state, from the Node service."""
    endpoint = f"/fetchDealers/{state}" if state else "/fetchDealers"
    results = get_request(endpoint)
    return results if results else []


def get_dealer_by_id_from_cf(dealer_id):
    endpoint = f"/fetchDealer/{dealer_id}"
    return get_request(endpoint)


def get_dealer_reviews_from_cf(dealer_id):
    endpoint = f"/fetchReviews/dealer/{dealer_id}"
    reviews = get_request(endpoint)
    if not reviews:
        return []
    # Attach a sentiment to any review that doesn't already have one.
    for review in reviews:
        if not review.get("sentiment"):
            review["sentiment"] = analyze_review_sentiments(review.get("review", ""))
    return reviews


def post_review(data_dict):
    url = f"{BACKEND_URL}/insert_review"
    try:
        response = requests.post(url, json=data_dict, timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error posting review: {e}")
        return None
