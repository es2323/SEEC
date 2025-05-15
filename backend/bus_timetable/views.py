# backend/your_app_name/views.py

from rest_framework import generics
from rest_framework.response import Response
from .models import BusRoute, BusStop, Journey, StopTime
from .serializers import BusRouteSerializer, BusStopSerializer, JourneySerializer, StopTimeSerializer
from rest_framework.views import APIView


class UserLocation(APIView):
    """Find nearby bus stops based on user location."""

    def get(self, request, *args, **kwargs):
        return Response({"message": "Send a POST request with latitude and longitude."})

    def post(self, request, *args, **kwargs):
        latitude = request.data.get("latitude")
        longitude = request.data.get("longitude")

        if not latitude or not longitude:
            return Response({"error": "Latitude and Longitude required"}, status=400)

        nearby_stops = BusStop.objects.filter(
            latitude__range=(latitude - 0.01, latitude + 0.01),
            longitude__range=(longitude - 0.01, longitude + 0.01)
        )

        stops_data = [
            {"stop_name": stop.stop_name, "latitude": stop.latitude, "longitude": stop.longitude}
            for stop in nearby_stops
        ]

        return Response({"nearby_stops": stops_data})

class BusRouteList(generics.ListAPIView):
    queryset = BusRoute.objects.all()
    serializer_class = BusRouteSerializer

class BusRouteDetail(generics.RetrieveAPIView):
    queryset = BusRoute.objects.all()
    serializer_class = BusRouteSerializer

class JourneyList(generics.ListAPIView):
    queryset = Journey.objects.all()
    serializer_class = JourneySerializer

class JourneyDetail(generics.RetrieveAPIView):
    queryset = Journey.objects.all()
    serializer_class = JourneySerializer

class StopTimeList(generics.ListAPIView):
    queryset = StopTime.objects.all()
    serializer_class = StopTimeSerializer

class StopTimeDetail(generics.RetrieveAPIView):
    queryset = StopTime.objects.all()
    serializer_class = StopTimeSerializer

class RouteTimetable(generics.RetrieveAPIView):
    """Returns the timetable for a specific bus route."""
    queryset = BusRoute.objects.all()
    serializer_class = BusRouteSerializer  # You might need a custom serializer for this

    def retrieve(self, request, *args, **kwargs):
        try:
            route = self.get_object()
            timetable_data = []
            journeys = route.journeys.all().order_by('journey_code')
            stops = BusStop.objects.filter(stoptime__journey__route=route).distinct().order_by('stoptime__stop_sequence')

            stop_names = [stop.stop_name for stop in stops]
            journey_times = {}

            for journey in journeys:
                times = {}
                stop_times = journey.stop_times.all().order_by('stop_sequence')
                for st in stop_times:
                    times[st.stop.stop_name] = st.arrival_time.strftime('%H:%M') if st.arrival_time else '-'
                journey_times[journey.journey_code] = times

            timetable_data.append({'route_name': route.route_name})
            timetable_data.append({'stops': stop_names})
            timetable_data.append({'journeys': journey_times})

            return Response(timetable_data)
        except BusRoute.DoesNotExist:
            return Response({"error": "Route not found."}, status=404)

# You might want more specific endpoints for querying by stop, etc.