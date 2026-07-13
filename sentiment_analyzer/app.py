"""
Cars Dealership - Sentiment Analysis microservice.

Exposes a simple REST endpoint that classifies review text as
positive, neutral, or negative. Uses NLTK's VADER sentiment
analyzer, which works well on short, informal review text and
needs no heavyweight ML dependencies (good fit for IBM Cloud
Code Engine / small containers).
"""
import os
from flask import Flask, jsonify
from flask_cors import CORS
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# Make sure the VADER lexicon is available (downloaded at build time too,
# see Dockerfile, but this keeps local `flask run` working as well).
try:
    nltk.data.find("sentiment/vader_lexicon.zip")
except LookupError:
    nltk.download("vader_lexicon")

app = Flask(__name__)
CORS(app)

analyzer = SentimentIntensityAnalyzer()


def classify(text: str) -> str:
    scores = analyzer.polarity_scores(text)
    compound = scores["compound"]
    if compound >= 0.05:
        return "positive"
    if compound <= -0.05:
        return "negative"
    return "neutral"


@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "Sentiment analyzer microservice is running"})


@app.route("/analyze/<path:text>", methods=["GET"])
def analyze(text: str):
    if not text or not text.strip():
        return jsonify({"error": "No text provided"}), 400
    sentiment = classify(text)
    return jsonify({"sentiment": sentiment})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    app.run(host="0.0.0.0", port=port)
