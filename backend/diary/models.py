from decimal import Decimal

from django.conf import settings
from django.db import models

from products.models import Product


class MealEntry(models.Model):
    class MealType(models.TextChoices):
        BREAKFAST = 'breakfast', 'Breakfast'
        LUNCH = 'lunch', 'Lunch'
        DINNER = 'dinner', 'Dinner'
        SNACK = 'snack', 'Snack'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='meal_entries',
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='product',
    )

    meal_type = models.CharField(
        max_length=20,
        choices=MealType.choices,
    )

    weight_grams = models.DecimalField(max_digits=7, decimal_places=2)

    date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def calories(self):
        return self.product.calories_per_100g * self.weight_grams / Decimal('100')

    @property
    def proteins(self):
        return self.product.proteins_per_100g * self.weight_grams / Decimal('100')

    @property
    def fats(self):
        return self.product.fats_per_100g * self.weight_grams / Decimal('100')

    @property
    def carbs(self):
        return self.product.carbs_per_100g * self.weight_grams / Decimal('100')

    class Meta:
        ordering = ('-date', '-created_at',)

    def __str__(self):
        return f'{self.user.username} - {self.product.name}'
