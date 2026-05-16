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

    def validate_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                'Название продукта не может быть пустым.'
            )
        return value

    def validate_calories_per_100g(self, value):
        if value < 0:
            raise serializers.ValidationError(
                'Калорийность не может быть отрицательной.'
            )
        return value

    def validate_proteins_per_100g(self, value):
        if value < 0:
            raise serializers.ValidationError(
                'Количество белков не может быть отрицательным.'
            )
        return value

    def validate_fats_per_100g(self, value):
        if value < 0:
            raise serializers.ValidationError(
                'Количество жиров не может быть отрицательным.'
            )
        return value

    def validate_carbs_per_100g(self, value):
        if value < 0:
            raise serializers.ValidationError(
                'Количество углеводов не может быть отрицательным.'
            )
        return value
