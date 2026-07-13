from django.db import models


class CarMake(models.Model):
    """A car manufacturer, e.g. Toyota, Ford."""

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class CarModel(models.Model):
    """A specific model produced by a CarMake, e.g. Camry, F-150."""

    SEDAN = "Sedan"
    SUV = "SUV"
    TRUCK = "Truck"
    COUPE = "Coupe"
    WAGON = "Wagon"
    CAR_TYPES = [
        (SEDAN, "Sedan"),
        (SUV, "SUV"),
        (TRUCK, "Truck"),
        (COUPE, "Coupe"),
        (WAGON, "Wagon"),
    ]

    car_make = models.ForeignKey(CarMake, on_delete=models.CASCADE, related_name="models")
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=CAR_TYPES, default=SEDAN)
    year = models.IntegerField(default=2025)
    dealer_id = models.IntegerField(help_text="ID of the dealership (from the Node/Mongo service) that carries this model")

    def __str__(self):
        return f"{self.year} {self.car_make.name} {self.name}"
