from django.urls import path

from .views import DailyAnalyticsView, WeeklyAnalyticsView


urlpatterns = [
    path('analytics/daily/', DailyAnalyticsView.as_view(), name='daily-analytics'),
    path('analytics/weekly/', WeeklyAnalyticsView.as_view(), name='weekly-analytics'),
]