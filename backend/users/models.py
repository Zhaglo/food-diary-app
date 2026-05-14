from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class DailyGoals(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="daily_goal",
    )

    calories = models.DecimalField(max_digits=7, decimal_places=2, default=2000)
    proteins = models.DecimalField(max_digits=6, decimal_places=2, default=100)
    fats = models.DecimalField(max_digits=6, decimal_places=2, default=70)
    carbs = models.DecimalField(max_digits=6, decimal_places=2, default=250)

    def __str__(self):
        return f'Daily goal for {self.user.username}'
