from app import classify


def test_classifies_clearly_positive_review():
    assert classify("I love this dealership, the staff were amazing and helpful!") == "positive"


def test_classifies_clearly_negative_review():
    assert classify("Terrible experience, the salesperson was rude and dishonest.") == "negative"


def test_classifies_neutral_review():
    assert classify("The dealership is located on Main Street.") == "neutral"


def test_health_endpoint_returns_200():
    from app import app as flask_app

    client = flask_app.test_client()
    response = client.get("/")
    assert response.status_code == 200


def test_analyze_endpoint_returns_sentiment_field():
    from app import app as flask_app

    client = flask_app.test_client()
    response = client.get("/analyze/great%20service")
    assert response.status_code == 200
    assert "sentiment" in response.get_json()
