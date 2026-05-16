from django.urls import path

from .views import (
    RegisterView,
    CurrentUserView,
    CurrentUserGoalView
)


urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/me/', CurrentUserView.as_view(), name='current-user'),
    path('goals/me/', CurrentUserGoalView.as_view(), name='current-user-goal'),
]
