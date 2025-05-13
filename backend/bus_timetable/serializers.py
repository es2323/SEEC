# backend/your_app_name/serializers.py

from rest_framework import serializers
from .models import BusRoute, BusStop, Journey, StopTime

class BusRouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusRoute
        fields = '__all__'

class BusStopSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusStop
        fields = '__all__'

class StopTimeSerializer(serializers.ModelSerializer):
    stop_name = serializers.CharField(source='stop.stop_name', read_only=True)
    class Meta:
        model = StopTime
        fields = ['arrival_time', 'stop_sequence', 'stop_name']

class JourneySerializer(serializers.ModelSerializer):
    stop_times = StopTimeSerializer(many=True, read_only=True)
    class Meta:
        model = Journey
        fields = ['journey_code', 'stop_times']

class BusRouteSerializer(serializers.ModelSerializer):
    journeys = JourneySerializer(many=True, read_only=True)
    class Meta:
        model = BusRoute
        fields = ['id', 'route_name', 'journeys']