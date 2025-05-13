# backend/your_app_name/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('bus-routes/', views.BusRouteList.as_view(), name='bus-route-list'),
    path('bus-routes/<int:pk>/', views.BusRouteDetail.as_view(), name='bus-route-detail'),
    path('journeys/', views.JourneyList.as_view(), name='journey-list'),
    path('journeys/<int:pk>/', views.JourneyDetail.as_view(), name='journey-detail'),
    path('stop-times/', views.StopTimeList.as_view(), name='stop-time-list'),
    path('stop-times/<int:pk>/', views.StopTimeDetail.as_view(), name='stop-time-detail'),
    path('route-timetable/<int:pk>/', views.RouteTimetable.as_view(), name='route-timetable'),
    # Add other URLs as needed
]