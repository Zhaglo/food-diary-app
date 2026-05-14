from django.contrib import admin

from .models import MealEntry


@admin.register(MealEntry)
class MealEntryAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'product',
        'meal_type',
        'weight_grams',
        'date',
        'created_at',
    )
    search_fields = ('user__username', 'product__name')
    list_filter = ('meal_type', 'date')
