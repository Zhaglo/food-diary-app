from django.contrib import admin

from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'calories_per_100g',
        'proteins_per_100g',
        'fats_per_100g',
        'carbs_per_100g',
        'created_by',
        'created_at'
    )
    search_fields = ('name',)
    list_filter = ('created_at',)
