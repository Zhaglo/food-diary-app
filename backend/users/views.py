from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import User, DailyGoals
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    DailyGoalsSerializer
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user


class CurrentUserGoalView(generics.RetrieveUpdateAPIView):
    serializer_class = DailyGoalsSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        goal, _ = DailyGoals.objects.get_or_create(user=self.request.user)
        return goal
