from django.contrib.auth.models import User
from django.test import Client, TestCase

from .models import CarMake, CarModel


class CarModelTests(TestCase):
    def setUp(self):
        self.make = CarMake.objects.create(name="Toyota", description="Reliable cars")
        self.model = CarModel.objects.create(
            car_make=self.make, name="Camry", type=CarModel.SEDAN, year=2025, dealer_id=1
        )

    def test_car_make_str(self):
        self.assertEqual(str(self.make), "Toyota")

    def test_car_model_str(self):
        self.assertEqual(str(self.model), "2025 Toyota Camry")

    def test_car_model_relates_to_make(self):
        self.assertEqual(self.model.car_make.name, "Toyota")
        self.assertIn(self.model, self.make.models.all())


class HealthEndpointTests(TestCase):
    def test_health_returns_ok(self):
        client = Client()
        response = client.get("/djangoapp/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})


class GetCarsEndpointTests(TestCase):
    def setUp(self):
        make = CarMake.objects.create(name="Honda")
        CarModel.objects.create(car_make=make, name="Civic", type=CarModel.SEDAN, year=2024, dealer_id=2)

    def test_get_cars_returns_seeded_model(self):
        client = Client()
        response = client.get("/djangoapp/get_cars")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        names = [c["CarModel"] for c in data["CarModels"]]
        self.assertIn("Civic", names)


class RegistrationAndLoginTests(TestCase):
    def test_register_then_login(self):
        client = Client()
        register_response = client.post(
            "/djangoapp/register",
            data={
                "userName": "alice",
                "password": "s3cret-pass",
                "firstName": "Alice",
                "lastName": "Smith",
                "email": "alice@example.com",
            },
            content_type="application/json",
        )
        self.assertEqual(register_response.status_code, 200)
        self.assertEqual(register_response.json()["status"], "Authenticated")
        self.assertTrue(User.objects.filter(username="alice").exists())

        client.get("/djangoapp/logout")

        login_response = client.post(
            "/djangoapp/login",
            data={"userName": "alice", "password": "s3cret-pass"},
            content_type="application/json",
        )
        self.assertEqual(login_response.status_code, 200)
        self.assertEqual(login_response.json()["status"], "Authenticated")

    def test_duplicate_registration_is_rejected(self):
        client = Client()
        payload = {"userName": "bob", "password": "s3cret-pass"}
        client.post("/djangoapp/register", data=payload, content_type="application/json")
        second = client.post("/djangoapp/register", data=payload, content_type="application/json")
        self.assertEqual(second.json().get("error"), "Already Registered")
