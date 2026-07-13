"""
Run with: python manage.py shell -c "from djangoapp.populate import initiate; initiate()"
Seeds the local SQLite CarMake / CarModel tables used by /djangoapp/get_cars.
"""
from .models import CarMake, CarModel


def initiate():
    data = {
        "Toyota": {"description": "Japanese automaker known for reliability.", "models": [("Camry", "Sedan", 2025), ("RAV4", "SUV", 2025)]},
        "Ford": {"description": "American automaker, famous for trucks.", "models": [("F-150", "Truck", 2025), ("Mustang", "Coupe", 2024)]},
        "Honda": {"description": "Japanese automaker known for efficiency.", "models": [("Civic", "Sedan", 2024), ("CR-V", "SUV", 2025)]},
        "Chevrolet": {"description": "American automaker, wide model range.", "models": [("Malibu", "Sedan", 2023), ("Silverado", "Truck", 2025)]},
    }

    for make_name, make_info in data.items():
        car_make, _ = CarMake.objects.get_or_create(
            name=make_name, defaults={"description": make_info["description"]}
        )
        for idx, (model_name, car_type, year) in enumerate(make_info["models"], start=1):
            CarModel.objects.get_or_create(
                car_make=car_make,
                name=model_name,
                defaults={"type": car_type, "year": year, "dealer_id": idx},
            )
    print("Database populated with car makes and models.")
