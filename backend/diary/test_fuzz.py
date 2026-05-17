from decimal import Decimal

from hypothesis import given, settings, strategies as st
from hypothesis.extra.django import TestCase

from diary.serializers import MealEntrySerializer
from products.models import Product
from users.models import User


class MealEntrySerializerFuzzTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username=f"fuzz_user_{self._testMethodName}",
            password="FuzzUser123!",
        )

        self.product = Product.objects.create(
            name=f"Тестовый продукт {self._testMethodName}",
            calories_per_100g=Decimal("250.00"),
            proteins_per_100g=Decimal("10.00"),
            fats_per_100g=Decimal("5.00"),
            carbs_per_100g=Decimal("30.00"),
            created_by=self.user,
        )

    @settings(max_examples=50)
    @given(weight=st.decimals(min_value=-10000, max_value=0, places=2))
    def test_non_positive_weight_is_rejected(self, weight):
        serializer = MealEntrySerializer(
            data={
                "product": self.product.pk,
                "meal_type": "breakfast",
                "weight_grams": str(weight),
                "date": "2026-05-17",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("weight_grams", serializer.errors)

    @settings(max_examples=50)
    @given(
        meal_type=st.text(min_size=1, max_size=30).filter(
            lambda value: value not in {"breakfast", "lunch", "dinner", "snack"}
        )
    )
    def test_invalid_meal_type_is_rejected(self, meal_type):
        serializer = MealEntrySerializer(
            data={
                "product": self.product.pk,
                "meal_type": meal_type,
                "weight_grams": "150.00",
                "date": "2026-05-17",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("meal_type", serializer.errors)
