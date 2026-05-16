from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import MealEntry
from .serializers import MealEntrySerializer


class MealEntryViewSet(viewsets.ModelViewSet):
    serializer_class = MealEntrySerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return MealEntry.objects.filter(user=self.request.user).select_related('product')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
