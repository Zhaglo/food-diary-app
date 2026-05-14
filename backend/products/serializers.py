from rest_framework import serializers

from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = (
            'id',
            'name',
            'calories_per_100g',
            'proteins_per_100g',
            'fats_per_100g',
            'carbs_per_100g',
            'created_by',
            'created_at',
        )
        read_only_fields = ('id', 'created_by', 'created_at')