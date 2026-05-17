from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from diary.models import MealEntry
from products.models import Product
from users.models import User


class MealEntryValidationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="diary_user",
            password="DiaryPass123!",
        )

        self.client.force_authenticate(user=self.user)

        self.product = Product.objects.create(
            name="Тестовый продукт",
            calories_per_100g=Decimal("200.00"),
            proteins_per_100g=Decimal("10.00"),
            fats_per_100g=Decimal("5.00"),
            carbs_per_100g=Decimal("25.00"),
            created_by=self.user,
        )

        self.list_url = reverse("meal-entry-list")

        self.valid_payload = {
            "product": self.product.pk,
            "meal_type": MealEntry.MealType.BREAKFAST,
            "weight_grams": "150.00",
            "date": "2026-05-17",
        }

    def test_meal_entry_with_zero_weight_is_rejected(self):
        payload = {
            **self.valid_payload,
            "weight_grams": "0.00",
        }

        response = self.client.post(
            self.list_url,
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("weight_grams", response.data)

    def test_meal_entry_with_negative_weight_is_rejected(self):
        payload = {
            **self.valid_payload,
            "weight_grams": "-10.00",
        }

        response = self.client.post(
            self.list_url,
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("weight_grams", response.data)

    def test_meal_entry_with_invalid_meal_type_is_rejected(self):
        payload = {
            **self.valid_payload,
            "meal_type": "brunch_invalid",
        }

        response = self.client.post(
            self.list_url,
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("meal_type", response.data)
