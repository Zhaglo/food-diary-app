from rest_framework import serializers

from .models import MealEntry


class MealEntrySerializer(serializers.ModelSerializer):
    calories = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    proteins = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    fats = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    carbs = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = MealEntry
        fields = (
            'id',
            'product',
            'meal_type',
            'weight_grams',
            'date',
            'calories',
            'proteins',
            'fats',
            'carbs',
            'created_at',
        )
        read_only_fields = (
            'id',
            'calories',
            'proteins',
            'fats',
            'carbs',
            'created_at',
        )