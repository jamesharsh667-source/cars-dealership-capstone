import json
import logging

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import CarModel
from .restapis import (
    analyze_review_sentiments,
    get_dealer_by_id_from_cf,
    get_dealer_reviews_from_cf,
    get_dealers_from_cf,
    post_review,
)

logger = logging.getLogger(__name__)


def health(request):
    """Liveness/readiness probe target — no auth, no DB dependency."""
    return JsonResponse({"status": "ok"})


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
@csrf_exempt
def login_user(request):
    data = json.loads(request.body)
    username = data.get("userName")
    password = data.get("password")
    user = authenticate(username=username, password=password)
    response_data = {"userName": username}
    if user is not None:
        login(request, user)
        response_data["status"] = "Authenticated"
    else:
        response_data["status"] = "Failed"
    return JsonResponse(response_data)


def logout_request(request):
    logout(request)
    return JsonResponse({"userName": ""})


@csrf_exempt
def registration(request):
    data = json.loads(request.body)
    username = data.get("userName")
    password = data.get("password")
    first_name = data.get("firstName", "")
    last_name = data.get("lastName", "")
    email = data.get("email", "")

    if User.objects.filter(username=username).exists():
        return JsonResponse({"userName": username, "error": "Already Registered"})

    user = User.objects.create_user(
        username=username,
        first_name=first_name,
        last_name=last_name,
        password=password,
        email=email,
    )
    login(request, user)
    return JsonResponse({"userName": username, "status": "Authenticated"})


# ---------------------------------------------------------------------------
# Cars (local SQLite data)
# ---------------------------------------------------------------------------
def get_cars(request):
    car_models = CarModel.objects.select_related("car_make")
    cars = [
        {
            "CarModel": cm.name,
            "CarMake": cm.car_make.name,
        }
        for cm in car_models
    ]
    return JsonResponse({"CarModels": cars})


# ---------------------------------------------------------------------------
# Dealers & reviews (proxied to the Node/Mongo microservice)
# ---------------------------------------------------------------------------
def get_dealerships(request, state="All"):
    if state == "All":
        dealerships = get_dealers_from_cf()
    else:
        dealerships = get_dealers_from_cf(state=state)
    return JsonResponse({"status": 200, "dealers": dealerships})


def get_dealer_details(request, dealer_id):
    dealer = get_dealer_by_id_from_cf(dealer_id)
    if dealer:
        return JsonResponse({"status": 200, "dealer": dealer})
    return JsonResponse({"status": 404, "message": "Dealer not found"})


def get_dealer_reviews(request, dealer_id):
    reviews = get_dealer_reviews_from_cf(dealer_id)
    return JsonResponse({"status": 200, "reviews": reviews})


@csrf_exempt
def add_review(request):
    if not request.user.is_authenticated:
        return JsonResponse({"status": 403, "message": "Unauthorized"})

    data = json.loads(request.body)
    sentiment = analyze_review_sentiments(data.get("review", ""))
    data["sentiment"] = sentiment

    result = post_review(data)
    if result:
        return JsonResponse({"status": 200, "review": result})
    return JsonResponse({"status": 500, "message": "Error posting review"})
