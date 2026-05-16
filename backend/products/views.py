from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Product
from .permissions import IsProductOwnerOrAdmin
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = (IsAuthenticated, IsProductOwnerOrAdmin)

    def get_queryset(self):
        return Product.objects.all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
