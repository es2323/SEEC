# backend/your_app_name/models.py

from django.db import models

class BusRoute(models.Model):
    """Represents a bus route."""
    route_name = models.CharField(max_length=255, unique=True)  # You might want to name your route

    def __str__(self):
        return self.route_name

class BusStop(models.Model):
    """Represents a bus stop."""
    stop_name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.stop_name

class Journey(models.Model):
    """Represents a specific bus journey/run."""
    journey_code = models.CharField(max_length=20, unique=True)
    route = models.ForeignKey(BusRoute, on_delete=models.CASCADE, related_name='journeys')

    def __str__(self):
        return f"{self.route.route_name} - {self.journey_code}"

class StopTime(models.Model):
    """Represents the scheduled arrival time of a journey at a specific stop."""
    journey = models.ForeignKey(Journey, on_delete=models.CASCADE, related_name='stop_times')
    stop = models.ForeignKey(BusStop, on_delete=models.CASCADE)
    arrival_time = models.TimeField(null=True, blank=True)  # Allow for cases where the bus doesn't stop
    stop_sequence = models.IntegerField()  # To maintain the order of stops in the route

    class Meta:
        ordering = ['stop_sequence']
        unique_together = ('journey', 'stop')

    def __str__(self):
        return f"{self.journey} - {self.stop} ({self.arrival_time if self.arrival_time else 'No Stop'})"