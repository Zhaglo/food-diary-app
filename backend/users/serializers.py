from rest_framework import serializers

from .models import DailyGoals


class DailyGoalsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyGoals
        fields = (
            'id',
            'calories',
            'proteins',
            'fats',
            'carbs',
        )
        read_only_fields = ('id',)
