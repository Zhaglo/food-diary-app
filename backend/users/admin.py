from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User, DailyGoals


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    pass


@admin.register(DailyGoals)
class DailyGoalsAdmin(admin.ModelAdmin):
    list_display = ('user', 'calories', 'proteins', 'fats', 'carbs')
    search_fields = ('user__username', 'user__email')
