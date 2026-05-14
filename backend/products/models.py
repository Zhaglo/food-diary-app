from django.conf import settings
from django.db import models


class Product(models.Model):
    name = models.CharField(max_length=150)
    calories_per_100g = models.DecimalField(decimal_places=2, max_digits=6)
    proteins_per_100g = models.DecimalField(decimal_places=2, max_digits=6)
    fats_per_100g = models.DecimalField(decimal_places=2, max_digits=6)
    carbs_per_100g = models.DecimalField(decimal_places=2, max_digits=6)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_products'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('name',)

    def __str__(self):
        return self.name
